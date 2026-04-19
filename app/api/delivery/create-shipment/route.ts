import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { createShipment, resolveCourierForShipment } from '@/lib/nimbuspost';
import { requireAdmin } from '@/lib/auth';
import { calculateTotalWeightKg } from '@/lib/weight';


export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ 
      $or: [{ _id: orderId }, { orderNumber: orderId }] 
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Already created?
    if (order.awbNumber) {
      return NextResponse.json({ success: true, awb: order.awbNumber });
    }

    const totalWeight = calculateTotalWeightKg(order.items || []);

    const nimbusPaymentType: 'prepaid' | 'cod' = order.paymentMethod === 'cod' ? 'cod' : 'prepaid';
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

    const shipmentParams = {
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
      length: 10, // Default dimensions if not specified
      breadth: 10,
      height: 10,
    };

    const result = await createShipment(shipmentParams);

    if (result.status && result.data) {
      const awb = String(result?.data?.awb_number || result?.data?.awb || result?.data?.waybill || '').trim();
      if (!awb) {
        console.error('Nimbus shipment response missing AWB:', result);
        return NextResponse.json(
          {
            success: false,
            message: 'Shipment created but AWB number missing in response. Please verify in Nimbus panel and retry sync.',
          },
          { status: 400 }
        );
      }

      const courier = result.data.courier_name || resolvedCourier?.name || order.selectedCourier || 'Courier';
      
      order.awbNumber = awb;
      order.courierName = courier;
      if (!order.selectedCourier && resolvedCourier?.name) {
        order.selectedCourier = resolvedCourier.name;
      }
      if (!order.selectedCourierId && resolvedCourier?.id) {
        order.selectedCourierId = resolvedCourier.id;
      }
      order.status = 'shipped';
      order.shipmentStatus = 'shipped';
      order.trackingUrl = `https://nimbuspost.com/track?awb=${awb}`;
      
      await order.save();

      return NextResponse.json({ success: true, awb: awb });
    } else {
      console.error('NimbusPost Shipment Creation Failed:', result);

      const rawNimbusMessage = String(result?.message || '').trim();
      if (/no\s+autoship\s+rule\s+found/i.test(rawNimbusMessage)) {
        const guidance = courierIdForShipment
          ? 'NimbusPost account me selected courier active nahi lag raha. Nimbus dashboard me courier activation/autoship rule verify karein.'
          : 'NimbusPost autoship rule missing hai aur courier resolve nahi ho paaya. Checkout courier mapping ya Nimbus autoship rule configure karein.';

        return NextResponse.json({ success: false, message: guidance }, { status: 400 });
      }

      return NextResponse.json({ success: false, message: result.message || 'Shipment creation failed' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Create shipment API error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
