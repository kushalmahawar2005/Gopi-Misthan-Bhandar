import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Convert rupees to paise
    const amountInPaise = Math.round(amount * 100);

    const result = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId || `receipt_${Date.now()}`,
      notes: notes || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error creating payment order' },
      { status: 500 }
    );
  }
}

