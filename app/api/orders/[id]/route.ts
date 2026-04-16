import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderStatusSMS } from '@/lib/sms';
import { getRequestAuth, requireAdmin } from '@/lib/auth';


// GET single order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const order = await Order.findById(params.id) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const isOwner = order.userId && String(order.userId) === auth.user.id;
    if (!auth.isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. This order does not belong to you.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update order
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    
    const body = await request.json();
    const oldOrder = await Order.findById(params.id);
    const order = await Order.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Send SMS if status changed
    if (oldOrder && body.status && oldOrder.status !== body.status && order.shipping?.phone) {
      sendOrderStatusSMS(
        order.shipping.phone,
        order.orderNumber,
        body.status
      ).catch((error) => {
        console.error('Error sending status update SMS:', error);
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    
    const order = await Order.findByIdAndDelete(params.id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

