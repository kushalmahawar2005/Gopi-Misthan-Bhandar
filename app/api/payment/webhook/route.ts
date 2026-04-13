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
    const event = JSON.parse(body);

    await connectDB();

    console.log(`Processing Webhook Event: ${event.event}`);

    // We only care about specific events
    if (event.event === 'payment.captured' || event.event === 'order.paid' || event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const couponCode = paymentEntity.notes?.couponCode;

      if (!razorpayOrderId) {
        return NextResponse.json({ success: false, message: 'No order_id in payload' }, { status: 400 });
      }

      const order = await Order.findOne({ razorpayOrderId });

      if (!order) {
        console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }

      // Idempotency check:
      if (
        (event.event === 'payment.captured' || event.event === 'order.paid') &&
        order.paymentStatus === 'paid'
      ) {
        console.log(`Order ${order.orderNumber} already marked as paid. Skipping redundant processing.`);
        // 6. Returns 200 immediately
        return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
      }

      // Handle successful payment
      if (event.event === 'payment.captured' || event.event === 'order.paid') {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentId = paymentId;
        await order.save();


        console.log(`Order ${order.orderNumber} status updated to paid/processing.`);

        // 3. Inventory Auto-Deduction
        const stockUpdateTasks = order.items.map((item: any) => 
          Product.findByIdAndUpdate(item.productId, { 
            $inc: { stock: -item.quantity } 
          })
        );
        
        // 4. Update Coupon usage if applicable
        if (couponCode && couponCode !== 'none') {
          stockUpdateTasks.push(
            Coupon.findOneAndUpdate(
              { code: couponCode.toUpperCase() },
              { $inc: { usedCount: 1 } }
            )
          );
        }
        
        const backgroundResults = await Promise.allSettled(stockUpdateTasks);
        backgroundResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Post-payment task failed:`, result.reason);
          }
        });

        // Setup correctly formatted orderData matching lib/email.ts
        const orderDataForEmail = {
          orderNumber: order.orderNumber,
          items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          shipping: {
            name: order.shipping.name,
            address: order.shipping.street,
            city: order.shipping.city,
            state: order.shipping.state,
            zipCode: order.shipping.zipCode,
            phone: order.shipping.phone
          },
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt)
        };

        // 5. Trigger Shipment Creation (NimbusPost)
        try {
          // Get site URL for tracking link
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          
          // Calculate weight
          let totalWeight = 0;
          order.items.forEach((item: any) => {
             const w = item.weight || '0.5kg';
             const value = parseFloat(w);
             if (w.toLowerCase().includes('g')) {
               totalWeight += (value / 1000) * item.quantity;
             } else {
               totalWeight += value * item.quantity;
             }
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
            },
            order_items: order.items.map((item: any) => ({
              name: item.name,
              qty: item.quantity,
              price: item.price,
            })),
            payment_method: 'prepaid',
            total_amount: order.total,
            weight: totalWeight,
            length: 10,
            breadth: 10,
            height: 10,
          });

          if (shipmentResult.status && shipmentResult.data) {
            const awb = shipmentResult.data.awb_number;
            const courier = shipmentResult.data.courier_name || order.selectedCourier || 'Courier';
            const trackingUrl = `${siteUrl}/orders?awb=${awb}`; // Custom track page or Nimbus track

            order.awbNumber = awb;
            order.courierName = courier;
            order.status = 'shipped';
            order.shipmentStatus = 'shipped';
            order.trackingUrl = trackingUrl;
            await order.save();

            const { sendShipmentEmail } = await import('@/lib/email');
            const { sendShipmentSMS } = await import('@/lib/sms');

            await Promise.allSettled([
              sendShipmentEmail(order.shipping.email, orderDataForEmail as any, awb, courier, trackingUrl),
              sendShipmentSMS(order.shipping.phone, order.orderNumber, awb, trackingUrl),
            ]);
            
            console.log(`Shipment created and notifications sent for order ${order.orderNumber}. AWB: ${awb}`);
          } else {
            console.error('Auto shipment creation failed for order', order.orderNumber, shipmentResult.message);
            // Even if shipment fails, we still send confirmation email
            await Promise.allSettled([
              sendOrderConfirmationEmail(order.shipping.email, orderDataForEmail as any),
              sendOrderConfirmationSMS(order.shipping.phone, order.orderNumber, order.total),
            ]);
          }
        } catch (shipmentError: any) {
          console.error('Error in auto shipment flow:', shipmentError);
          // Fallback to regular confirmation if shipment fails
          await Promise.allSettled([
            sendOrderConfirmationEmail(order.shipping.email, orderDataForEmail as any),
            sendOrderConfirmationSMS(order.shipping.phone, order.orderNumber, order.total),
          ]);
        }
      } 
      // Handle failed payment
      else if (event.event === 'payment.failed') {
        // Only update if it wasn't already marked as paid successfully 
        if (order.paymentStatus !== 'paid') {
            order.paymentStatus = 'failed';
            await order.save();
            console.log(`Order ${order.orderNumber} status updated to payment failed.`);
        }
      }

    } else {
      console.log(`Webhook Event ignored: ${event.event}`);
    }

    // 6. Returns 200 immediately
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
