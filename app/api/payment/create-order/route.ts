import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { calculateOrderAmount } from '@/lib/orderUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, couponCode, deliveryPincode, courierCharge, userId, orderId: existingOrderId } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Calculate and validate order amount on server side
    const calculation = await calculateOrderAmount(cartItems, couponCode, deliveryPincode, courierCharge);

    if (!calculation.success) {
      return NextResponse.json(
        { success: false, error: calculation.error },
        { status: 400 }
      );
    }

    // Connect to DB and check for existing order (if provided)
    let orderToUpdate = null;
    if (existingOrderId) {
      orderToUpdate = await Order.findOne({ orderNumber: existingOrderId });
      if (orderToUpdate && orderToUpdate.paymentStatus === 'paid') {
        return NextResponse.json(
          { success: false, error: 'Order already paid' },
          { status: 400 }
        );
      }
    }

    // Convert total to paise for Razorpay
    const amountInPaise = Math.round(calculation.finalAmount * 100);

    const result = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: existingOrderId || `receipt_${Date.now()}`,
      notes: {
        userId: userId || 'guest',
        couponCode: couponCode || 'none',
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // If an existing order was found, update it with the new Razorpay Order ID and calculated amounts
    if (orderToUpdate) {
      orderToUpdate.razorpayOrderId = result.orderId;
      orderToUpdate.subtotal = calculation.breakdown.subtotal;
      orderToUpdate.shippingCost = calculation.breakdown.deliveryCharge;
      orderToUpdate.total = calculation.finalAmount;
      await orderToUpdate.save();
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      finalAmount: calculation.finalAmount,
      breakdown: calculation.breakdown,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error creating payment order' },
      { status: 500 }
    );
  }
}


