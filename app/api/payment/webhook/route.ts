import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';
import { createShipment, resolveCourierForShipment } from '@/lib/nimbuspost';
import { calculateTotalWeightKg } from '@/lib/weight';

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
      const appliedCouponCode = String(order.appliedCouponCode || '').trim().toUpperCase();
      const hasCouponApplied = Boolean(appliedCouponCode && Number(order.couponDiscount || 0) > 0);
      const stockUpdateTasks = order.items.map((item: any) => 
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
      );
      
      if (hasCouponApplied) {
        stockUpdateTasks.push(
          Coupon.findOneAndUpdate(
            {
              code: appliedCouponCode,
              isActive: true,
              $or: [
                { usageLimit: null },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
              ],
            },
            { $inc: { usedCount: 1 } }
          )
        );
      }
      await Promise.allSettled(stockUpdateTasks);

      // Automated Shipment
      try {
        const totalWeight = calculateTotalWeightKg(order.items || []);

        const nimbusPaymentType = order.paymentMethod === 'cod' ? 'cod' : 'prepaid';
        const pickupWarehouseName =
          process.env.NIMBUSPOST_PICKUP_WAREHOUSE_NAME ||
          process.env.SENDER_NAME ||
          'Gopi Misthan Bhandar';

        const shippingPincode = String(order.shipping?.zipCode || '').trim();
        const canResolveCourier = /^\d{6}$/.test(shippingPincode);
        const resolvedCourier = canResolveCourier
          ? await resolveCourierForShipment({
              pincode: shippingPincode,
              weight: totalWeight,
              order_amount: Math.max(0, Number(order.total || 0)),
              payment_method: nimbusPaymentType,
              preferredCourierName: String(order.selectedCourier || ''),
              preferredCourierId: String(order.selectedCourierId || ''),
            })
          : null;

        const courierIdForShipment = String(order.selectedCourierId || resolvedCourier?.id || '').trim() || undefined;

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
          pickup_warehouse_name: pickupWarehouseName,
          order_items: order.items.map((item: any) => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
            weight: item.weight,
          })),
          payment_method: nimbusPaymentType,
          total_amount: order.total,
          order_amount: String(order.total),
          courier_id: courierIdForShipment,
          weight: totalWeight,
          length: 10, breadth: 10, height: 10,
        });

        if (shipmentResult.status && shipmentResult.data) {
          const awb = String(
            shipmentResult?.data?.awb_number || shipmentResult?.data?.awb || shipmentResult?.data?.waybill || ''
          ).trim();

          if (!awb) {
            console.error('Auto-shipment created without AWB in response:', shipmentResult);
          } else {
            order.awbNumber = awb;
            order.courierName = shipmentResult.data.courier_name || resolvedCourier?.name || order.selectedCourier || order.courierName;
            if (!order.selectedCourier && resolvedCourier?.name) {
              order.selectedCourier = resolvedCourier.name;
            }
            if (!order.selectedCourierId && resolvedCourier?.id) {
              order.selectedCourierId = resolvedCourier.id;
            }
            order.trackingUrl = `https://nimbuspost.com/track?awb=${awb}`;
            order.status = 'shipped';
            order.shipmentStatus = 'shipped';
            await order.save();
          }
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
