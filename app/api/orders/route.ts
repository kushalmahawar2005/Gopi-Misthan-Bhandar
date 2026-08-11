import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getRequestAuth } from '@/lib/auth';
import { calculateOrderAmount } from '@/lib/orderUtils';
import { checkRateLimit } from '@/lib/rateLimit';

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

    const rateLimit = checkRateLimit({
      request,
      keyPrefix: 'order-create',
      maxRequests: 5,
      windowMs: 60 * 1000,
      identifier: auth.user.id,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many order attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    await connectDB();

    const body = await request.json();

    // --- Server-side re-validation: never trust client-supplied prices/totals ---
    const clientItems = Array.isArray(body.items) ? body.items : [];
    if (clientItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    const cartForCalc = clientItems.map((item: any) => ({
      productId: String(item?.productId || item?.id || '').trim(),
      quantity: Math.max(1, Number(item?.quantity) || 0),
      weight: String(item?.weight || item?.selectedWeight || item?.selectedSize || '').trim(),
    }));

    // Recomputes prices + validates stock against the DB. Shipping is provided as a
    // provisional client value here and re-validated authoritatively in /api/payment/create-order.
    const clientShippingCost = Number(body.shippingCost);
    const calculation = await calculateOrderAmount(
      cartForCalc,
      body.appliedCouponCode,
      body.shipping?.zipCode,
      Number.isFinite(clientShippingCost) && clientShippingCost >= 0 ? clientShippingCost : undefined
    );

    if (!calculation.success) {
      return NextResponse.json(
        { success: false, error: calculation.error || 'Order validation failed' },
        { status: 400 }
      );
    }

    // Rebuild line items from validated products (image is display-only, fall back to client value).
    const validatedItems = (calculation.products || []).map((product: any, idx: number) => ({
      productId: String(product._id),
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image || clientItems[idx]?.image || '',
      weight: product.weight || '',
    }));

    // Generate orderNumber if not provided
    if (!body.orderNumber) {
      body.orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Force safe initial values + server-validated financials to prevent tampering.
    const orderData = {
      ...body,
      items: validatedItems,
      subtotal: calculation.breakdown.subtotal,
      couponDiscount: calculation.breakdown.discount,
      appliedCouponCode: calculation.appliedCouponCode || undefined,
      shippingCost: calculation.breakdown.deliveryCharge,
      total: calculation.finalAmount,
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
