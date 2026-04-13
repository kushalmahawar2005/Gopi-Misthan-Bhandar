import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';

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

    // 1. Verifies Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid signature detected for webhook event.', { expectedSignature, signature });
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    // Signature matches, proceed
    await connectDB();

    // 3. Parse Event
    const event = JSON.parse(body);

    // 4. Handle Specific Events
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payload = event.payload.payment?.entity || event.payload.order?.entity;
      const razorpayOrderId = payload.order_id || payload.id;
      const paymentId = payload.id;

      const order = await Order.findOne({ razorpayOrderId });

      if (!order) return NextResponse.json({ success: true });

      if (order.paymentStatus === 'paid') return NextResponse.json({ success: true });

      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = paymentId;
      await order.save();

      // Post-payment Inventory update
      const couponCode = payload.notes?.couponCode;
      const stockUpdateTasks = order.items.map((item: any) => 
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
      );
      
      if (couponCode && couponCode !== 'none') {
        stockUpdateTasks.push(
          Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } })
        );
      }
      await Promise.allSettled(stockUpdateTasks);

      // Automated Shipment
      try {
        let totalWeight = 0;
        order.items.forEach((item: any) => {
           const w = item.weight || '0.5kg';
           const value = parseFloat(w);
           totalWeight += (w.toLowerCase().includes('g') ? value / 1000 : value) * item.quantity;
        });
        if (totalWeight === 0) totalWeight = 0.5;

        const { createShipment } = await import('@/lib/nimbuspost');
        const shipmentResult = await createShipment({
          order_id: order.orderNumber,
          consignee: {
            name: order.shipping.name,
            address: order.shipping.street,
            city: order.shipping.city,
            state: order.shipping.state,
            pincode: order.shipping.zipCode,
            phone: order.shipping.phone,
            email: order.shipping.email,
          },
          pickup: {
            name: process.env.SENDER_NAME || 'Gopi Misthan Bhandar',
            address: process.env.SENDER_ADDRESS || '',
            city: process.env.SENDER_CITY || '',
            state: process.env.SENDER_STATE || '',
            pincode: process.env.SENDER_PINCODE || '',
            phone: process.env.SENDER_PHONE || '',
            email: process.env.SENDER_EMAIL || '',
          },
          order_items: order.items.map((item: any) => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
          })),
          payment_method: 'prepaid',
          total_amount: order.total,
          weight: totalWeight,
          length: 10, breadth: 10, height: 10,
        });

        if (shipmentResult.status && shipmentResult.data) {
          order.awbNumber = shipmentResult.data.awb_number;
          order.status = 'shipped';
          order.shipmentStatus = 'shipped';
          await order.save();
        }
      } catch (e) {
        console.error('Auto shipment creation failed:', e);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
