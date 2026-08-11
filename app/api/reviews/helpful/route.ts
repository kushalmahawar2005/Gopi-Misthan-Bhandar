import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { checkRateLimit } from '@/lib/rateLimit';

// POST mark review as helpful
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit({
    request,
    keyPrefix: 'review-helpful',
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    ).lean();

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
