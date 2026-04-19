import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CartItem, calculateOrderAmount } from '@/lib/orderUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCartItems = Array.isArray(body?.cartItems) ? body.cartItems : [];
    const couponCode = String(body?.couponCode || '').trim();
    const deliveryPincode = body?.deliveryPincode ? String(body.deliveryPincode).trim() : undefined;
    const parsedCourierCharge = Number(body?.courierCharge);
    const courierCharge = Number.isFinite(parsedCourierCharge) && parsedCourierCharge >= 0
      ? parsedCourierCharge
      : undefined;

    if (!couponCode) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    if (rawCartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const cartItems: CartItem[] = rawCartItems
      .map((item: any) => ({
        productId: String(item?.productId || '').trim(),
        quantity: Number(item?.quantity || 0),
        weight: item?.weight ? String(item.weight).trim() : undefined,
      }))
      .filter((item: CartItem) => Boolean(item.productId) && item.quantity > 0);

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items are invalid' },
        { status: 400 }
      );
    }

    await connectDB();

    const calculation = await calculateOrderAmount(
      cartItems,
      couponCode,
      deliveryPincode,
      courierCharge
    );

    if (!calculation.success) {
      return NextResponse.json(
        { success: false, error: calculation.error || 'Failed to apply coupon' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        breakdown: calculation.breakdown,
        finalAmount: calculation.finalAmount,
        appliedCouponCode: calculation.appliedCouponCode,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
