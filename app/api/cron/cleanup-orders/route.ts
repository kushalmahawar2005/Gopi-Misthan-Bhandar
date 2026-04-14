import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET
    const authHeader = request.headers.get('x-cron-secret');
    if (authHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 2. Find pending orders older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const expiredOrders = await Order.find({
      status: 'pending',
      createdAt: { $lt: thirtyMinutesAgo }
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ success: true, message: 'No expired orders found', count: 0 });
    }

    // 3. Process each expired order
    const results = await Promise.allSettled(expiredOrders.map(async (order) => {
      // a. Restore stock for each item
      await Promise.allSettled(order.items.map(async (item: any) => {
        if (item.product || item._id) {
          await Product.findByIdAndUpdate(item.product || item._id, {
            $inc: { stock: item.quantity }
          });
        }
      }));

      // b. Mark order as expired
      order.status = 'expired';
      await order.save();
      
      return order._id;
    }));

    const successfulCleanups = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${successfulCleanups} orders`,
      count: successfulCleanups
    });

  } catch (error: any) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
