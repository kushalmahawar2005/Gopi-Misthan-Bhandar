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

    let query: any = {};

    // If userId is provided, filter by userId
    if (userId) {
      query.userId = userId;
    }
    // If email is provided but no userId, filter by shipping email
    else if (email) {
      query['shipping.email'] = email;
    }

    if (status) {
      query.status = status;
    }

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
