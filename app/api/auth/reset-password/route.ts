import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { checkRateLimit } from '@/lib/rateLimit';

const THIRTY_MINUTES = 30 * 60 * 1000;

function tooManyRequestsResponse(retryAfter: number) {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many password reset attempts. Please try again later.',
      retryAfter,
    },
    { status: 429 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body?.token || '').trim();
    const password = String(body?.password || '');

    const rateLimit = checkRateLimit({
      request,
      keyPrefix: 'auth:reset-password',
      maxRequests: 10,
      windowMs: THIRTY_MINUTES,
    });

    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(rateLimit.retryAfter);
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Reset token is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
