import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';


export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    const applicableTo = body?.applicableTo || 'all';
    const categories = Array.isArray(body?.categories) ? body.categories.filter(Boolean) : [];
    const products = Array.isArray(body?.products) ? body.products.filter(Boolean) : [];

    if (body?.usageLimit !== null && body?.usageLimit !== undefined) {
      const usageLimit = Number(body.usageLimit);
      if (!Number.isInteger(usageLimit) || usageLimit < 1) {
        return NextResponse.json(
          { success: false, error: 'usageLimit must be a positive integer or null' },
          { status: 400 }
        );
      }
      body.usageLimit = usageLimit;
    }

    if (applicableTo === 'all') {
      body.categories = [];
      body.products = [];
    }

    if (applicableTo === 'category') {
      if (categories.length === 0) {
        return NextResponse.json(
          { success: false, error: 'categories are required when applicableTo is category' },
          { status: 400 }
        );
      }
      body.categories = categories;
      body.products = [];
    }

    if (applicableTo === 'product') {
      if (products.length === 0) {
        return NextResponse.json(
          { success: false, error: 'products are required when applicableTo is product' },
          { status: 400 }
        );
      }
      body.products = products;
      body.categories = [];
    }

    const coupon = await Coupon.create(body);
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

