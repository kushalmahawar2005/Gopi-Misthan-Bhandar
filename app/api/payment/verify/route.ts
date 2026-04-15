import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, razorpayOrderId } = body;

    if (!orderId || !paymentId || !signature || !razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if this payment ID has already been used (idempotency/double payment check)
    const existingPayment = await Order.findOne({ paymentId });
    if (existingPayment) {
      console.warn(`Payment ID ${paymentId} already exists for order ${existingPayment.orderNumber}. Returning success for idempotency.`);
      // Return success with order data so the frontend can redirect properly
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        order: existingPayment,
      });
    }

    // Verify payment signature
    const verification = await verifyPayment(razorpayOrderId, paymentId, signature);

    if (!verification.success) {
      // Mark order as payment failed
      await Order.findOneAndUpdate(
        { orderNumber: orderId },
        { paymentStatus: 'failed' }
      );
      return NextResponse.json(
        { success: false, error: verification.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Find the order and update its status
    // This acts as a fast-path update. The webhook is the ultimate source of truth,
    // but we update here so the success page shows correct data immediately.
    const order = await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only update if not already paid (webhook might have beaten us)
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = paymentId;
      order.razorpayOrderId = razorpayOrderId;
      await order.save();
    }

    // Fire-and-forget: Send confirmation email & SMS
    // These are non-blocking - we don't wait for them
    if (order.shipping?.email) {
      sendOrderConfirmationEmail(order.shipping.email, {
        orderNumber: order.orderNumber,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
        shipping: {
          name: order.shipping.name,
          address: order.shipping.street,
          city: order.shipping.city,
          state: order.shipping.state,
          zipCode: order.shipping.zipCode,
          phone: order.shipping.phone,
        },
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
      }).catch((err: any) => console.error('Email send error:', err));
    }

    if (order.shipping?.phone) {
      sendOrderConfirmationSMS(
        order.shipping.phone,
        order.orderNumber,
        order.total
      ).catch((err: any) => console.error('SMS send error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: order,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying payment' },
      { status: 500 }
    );
  }
}
