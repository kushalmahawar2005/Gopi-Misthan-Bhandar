import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { markOrderPaidOnce, runPostPaymentFulfillment } from '@/lib/orderFulfillment';

export async function POST(req: Request) {
  try {
    const body = await req.text(); // Raw text for signature verification
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ success: false, message: 'Server configured incorrectly' }, { status: 500 });
    }

    if (!signature) {
      console.error('No signature found in headers');
      return NextResponse.json({ success: false, message: 'No signature found' }, { status: 400 });
    }

    // 1. Verify Razorpay webhook signature over the raw body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.error('Invalid signature detected for webhook event.');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    const event = JSON.parse(body);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!razorpayOrderId || !paymentId) {
        console.error('Paid webhook did not contain payment and Razorpay order IDs.');
        return NextResponse.json({ success: false, message: 'Invalid payment payload' }, { status: 400 });
      }

      const order = await Order.findOne({ razorpayOrderId });
      if (!order) return NextResponse.json({ success: true });

      // Mark paid if the browser's verify call has not already done it, then
      // always run fulfilment. Each step guards itself, so an order already
      // confirmed by verify still gets its stock, coupon and shipment handled.
      await markOrderPaidOnce(String(order._id), paymentId);
      await runPostPaymentFulfillment(String(order._id));
    }

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment?.entity?.order_id;

      if (razorpayOrderId) {
        await Order.updateOne(
          { razorpayOrderId, paymentStatus: { $ne: 'paid' } },
          { $set: { paymentStatus: 'failed' } }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
