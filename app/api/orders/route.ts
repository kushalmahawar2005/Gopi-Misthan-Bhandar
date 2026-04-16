import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getRequestAuth } from '@/lib/auth';

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

// GET orders
export async function GET(request: NextRequest) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('orderNumber');

    let query: any = {};

    // Admin can use dashboard filters. Non-admin is always scoped to own userId.
    if (auth.isAdmin) {
      if (orderNumber) {
        query.orderNumber = orderNumber;
      } else if (requestedUserId) {
        query.userId = requestedUserId;
      } else if (email) {
        query['shipping.email'] = email;
      }
    } else {
      query.userId = auth.user.id;
      if (orderNumber) {
        query.orderNumber = orderNumber;
      }
    }

    if (status) {
      query.status = status;
    }

    // Check if pagination is requested
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (page) {
      const pageNum = parsePositiveInt(page, 1);
      const limitNum = Math.min(parsePositiveInt(limit, 10), 100);
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

    // Non-paginated response
    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required to place order.' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Generate orderNumber if not provided
    if (!body.orderNumber) {
      body.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Force safe initial values to prevent premature confirmation
    const orderData = {
      ...body,
      userId: auth.user.id,
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
