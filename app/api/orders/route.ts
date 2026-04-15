import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('orderNumber');

    let query: any = {};

    // If orderNumber is provided, use it directly (for success page lookup)
    if (orderNumber) {
      query.orderNumber = orderNumber;
    }
    // If userId is provided, filter by userId
    else if (userId) {
      query.userId = userId;
    }
    // If email is provided but no userId, filter by shipping email
    else if (email) {
      query['shipping.email'] = email;
    }

    if (status) {
      query.status = status;
    }

    // Check if pagination is requested
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (page) {
      // Paginated response for admin dashboard
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10')));
      const skip = (pageNum - 1) * limitNum;

      const [orders, totalOrders] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Order.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalOrders / limitNum);

      return NextResponse.json({
        success: true,
        data: orders,
        totalOrders,
        totalPages,
        currentPage: pageNum,
      }, { status: 200 });
    }

    // Non-paginated response (for polling, user order history, etc.)
    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate orderNumber if not provided
    if (!body.orderNumber) {
      body.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Force safe initial values to prevent premature confirmation
    const orderData = {
      ...body,
      status: 'pending',
      paymentStatus: 'pending',
    };
    
    // Create the order
    const order = await Order.create(orderData);



    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
