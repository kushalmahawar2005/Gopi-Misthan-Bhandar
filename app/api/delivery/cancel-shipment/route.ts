import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { cancelShipment } from '@/lib/nimbuspost';
import { requireAdmin } from '@/lib/auth';


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

    if (!order || !order.awbNumber) {
      return NextResponse.json({ success: false, message: 'Shipment not found for this order' }, { status: 404 });
    }

    const result = await cancelShipment(order.awbNumber);

    if (result.status) {
      order.shipmentStatus = 'failed'; // Or add 'cancelled' if your enum allows
      order.awbNumber = ''; // Clear AWB so it can be re-created if needed
      await order.save();

      return NextResponse.json({ success: true, message: 'Shipment cancelled successfully' });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Cancellation failed. This usually happens if the shipment is already picked up or manifested.' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Cancel shipment API error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
