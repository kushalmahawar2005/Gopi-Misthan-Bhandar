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
      console.warn(`Payment ID ${paymentId} already exists for order ${existingPayment.orderNumber}. Rejecting verification.`);
      return NextResponse.json(
        { success: false, error: 'Payment already verified' },
        { status: 409 }
      );
    }

    // Verify payment signature
    const verification = await verifyPayment(razorpayOrderId, paymentId, signature);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // 3. Find the order (the status update will be handled by the Webhook for absolute reliability)
    const order = await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
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

