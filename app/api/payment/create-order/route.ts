import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { calculateOrderAmount } from '@/lib/orderUtils';
import { getRequestAuth } from '@/lib/auth';
import { checkServiceability } from '@/lib/nimbuspost';
import { cleanupExpiredPendingOrders } from '@/lib/orderCleanup';

const FALLBACK_COURIER_CHARGE = 60;

function parseWeightToKg(weight: string): number {
  const raw = String(weight || '').trim().toLowerCase();
  if (!raw) return 0;

  const match = raw.match(/^(\d+(?:\.\d+)?)\s*(kg|g|gm|gram|grams)?$/i);
  if (!match) {
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
  }

  const value = Number(match[1]);
  const unit = (match[2] || 'kg').toLowerCase();

  if (!Number.isFinite(value) || value <= 0) return 0;
  if (unit === 'kg') return value;
  return value / 1000;
}

function buildItemsSignature(items: any[]): string {
  return items
    .map((item) => ({
      productId: String(item?.productId || '').trim(),
      quantity: Number(item?.quantity || 0),
      weight: String(item?.weight || '').trim().toLowerCase(),
    }))
    .filter((item) => item.productId && item.quantity > 0)
    .sort((a, b) => {
      const keyA = `${a.productId}:${a.weight}`;
      const keyB = `${b.productId}:${b.weight}`;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return a.quantity - b.quantity;
    })
    .map((item) => `${item.productId}:${item.quantity}:${item.weight}`)
    .join('|');
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to continue.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cartItems, couponCode, deliveryPincode } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    await connectDB();

    // Free-plan friendly fallback: cleanup stale pending orders during checkout flow.
    await cleanupExpiredPendingOrders({
      userId: auth.user.id,
      olderThanMinutes: 30,
      limit: 50,
    });

    const cartSignature = buildItemsSignature(cartItems);
    if (!cartSignature) {
      return NextResponse.json(
        { success: false, error: 'Cart items are invalid' },
        { status: 400 }
      );
    }

    // Server-side pending order lookup by authenticated user and cart content.
    const pendingOrders = await Order.find({
      userId: auth.user.id,
      paymentStatus: 'pending',
      status: 'pending',
    })
      .select('orderNumber items paymentStatus shipping')
      .sort({ createdAt: -1 })
      .limit(25);

    const orderToUpdate = pendingOrders.find((order: any) => {
      const existingSignature = buildItemsSignature(order.items || []);
      return existingSignature === cartSignature;
    }) as any;

    if (!orderToUpdate) {
      return NextResponse.json(
        { success: false, error: 'No matching pending order found for this user.' },
        { status: 404 }
      );
    }

    // Compute courier charge server-side using authoritative order pincode and cart weight.
    const orderDeliveryPincode = String(orderToUpdate.shipping?.zipCode || deliveryPincode || '').trim();
    const totalWeightKg = cartItems.reduce((total: number, item: any) => {
      const quantity = Math.max(0, Number(item?.quantity || 0));
      const itemWeightKg = parseWeightToKg(String(item?.weight || ''));
      return total + itemWeightKg * quantity;
    }, 0);

    let serverCourierCharge = FALLBACK_COURIER_CHARGE;
    if (/^\d{6}$/.test(orderDeliveryPincode)) {
      const serviceability = await checkServiceability({
        pincode: orderDeliveryPincode,
        weight: totalWeightKg > 0 ? totalWeightKg : 0.5,
        order_amount: 0,
        payment_method: 'prepaid',
      });

      if (serviceability?.status && Array.isArray(serviceability?.data) && serviceability.data.length > 0) {
        const cheapest = serviceability.data.reduce((min: any, current: any) => {
          const currentCharge = Number(current?.total_charges ?? current?.freight_charges ?? Number.MAX_SAFE_INTEGER);
          const minCharge = Number(min?.total_charges ?? min?.freight_charges ?? Number.MAX_SAFE_INTEGER);
          return currentCharge < minCharge ? current : min;
        }, serviceability.data[0]);

        const computedCharge = Number(cheapest?.total_charges ?? cheapest?.freight_charges);
        if (Number.isFinite(computedCharge) && computedCharge >= 0) {
          serverCourierCharge = computedCharge;
        }
      }
    }

    // Calculate and validate order amount on server side using authoritative courier charge.
    const calculation = await calculateOrderAmount(
      cartItems,
      couponCode,
      orderDeliveryPincode,
      serverCourierCharge
    );

    if (!calculation.success) {
      return NextResponse.json(
        { success: false, error: calculation.error },
        { status: 400 }
      );
    }

    if (orderToUpdate.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Convert total to paise for Razorpay
    const amountInPaise = Math.round(calculation.finalAmount * 100);

    const result = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderToUpdate.orderNumber,
      notes: {
        userId: auth.user.id,
        couponCode: couponCode || 'none',
        orderNumber: orderToUpdate.orderNumber,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Update the matched user-owned pending order with authoritative payment metadata.
    orderToUpdate.razorpayOrderId = result.orderId;
    orderToUpdate.subtotal = calculation.breakdown.subtotal;
    orderToUpdate.shippingCost = calculation.breakdown.deliveryCharge;
    orderToUpdate.couponDiscount = calculation.breakdown.discount || 0;
    orderToUpdate.appliedCouponCode = calculation.appliedCouponCode || undefined;
    orderToUpdate.total = calculation.finalAmount;
    await orderToUpdate.save();

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: orderToUpdate.orderNumber,
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


