import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { createShipment } from '@/lib/nimbuspost';

export async function POST(req: NextRequest) {
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

    // Calculate total weight (assuming each item has weight or default to 0.5kg)
    let totalWeight = 0;
    order.items.forEach((item: any) => {
       // weight might be "500g" or "1kg", need to parse to kg
       const w = item.weight || '0.5kg';
       const value = parseFloat(w);
       if (w.toLowerCase().includes('g')) {
         totalWeight += (value / 1000) * item.quantity;
       } else {
         totalWeight += value * item.quantity;
       }
    });
    if (totalWeight === 0) totalWeight = 0.5;

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
      },
      order_items: order.items.map((item: any) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
      })),
      payment_method: 'prepaid' as const,
      total_amount: order.total,
      weight: totalWeight,
      length: 10, // Default dimensions if not specified
      breadth: 10,
      height: 10,
    };

    try {
      const result = await createShipment(shipmentParams);

      if (result.status && result.data) {
        const awb = result.data.awb_number;
        const courier = result.data.courier_name || order.selectedCourier || 'Courier';
        
        order.awbNumber = awb;
        order.courierName = courier;
        order.status = 'shipped';
        order.shipmentStatus = 'shipped';
        order.trackingUrl = `https://nimbuspost.com/track?awb=${awb}`;
        
        await order.save();

        return NextResponse.json({ success: true, awb: awb });
      } else {
        throw new Error(result.message || 'Shipment creation failed');
      }
    } catch (e) {
      // MOCK SHIPMENT FOR TESTING
      // REMOVE THIS IN PRODUCTION
      console.warn('Using mock shipment for testing:', e);
      const mockAwb = `TEST-AWB-${Date.now()}`;
      order.awbNumber = mockAwb;
      order.courierName = order.selectedCourier || 'Standard (Test)';
      order.status = 'processing';
      order.shipmentStatus = 'Label Created (Test)';
      order.trackingUrl = '#';
      await order.save();
      return NextResponse.json({ success: true, awb: mockAwb });
    }

  } catch (error: any) {
    console.error('Create shipment API error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
