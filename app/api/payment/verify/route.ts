import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';
import { getRequestAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to verify payment.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const isOwner = order.userId && String(order.userId) === auth.user.id;
    if (!auth.isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. This order does not belong to you.' },
        { status: 403 }
      );
    }

    if (!order.razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment order reference on server.' },
        { status: 400 }
      );
    }

    // Check if this payment ID has already been used (idempotency/double payment check)
    const existingPayment = await Order.findOne({ paymentId });
    if (existingPayment) {
      if (existingPayment.orderNumber !== order.orderNumber) {
        return NextResponse.json(
          { success: false, error: 'Payment already linked to a different order.' },
          { status: 409 }
        );
      }
      // Return success with order data so the frontend can redirect properly
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        order: existingPayment,
      });
    }

    // Verify signature against server-side Razorpay order reference (never trust client order id).
    const verification = await verifyPayment(order.razorpayOrderId, paymentId, signature);

    if (!verification.success) {
      // Mark order as payment failed
      order.paymentStatus = 'failed';
      await order.save();
      return NextResponse.json(
        { success: false, error: verification.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    const verifiedOrderId = verification.payment?.order_id;
    if (!verifiedOrderId || verifiedOrderId !== order.razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Payment/order mismatch detected.' },
        { status: 400 }
      );
    }

    // Only update if not already paid (webhook might have beaten us)
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = paymentId;
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
