import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

const ONE_HOUR = 60 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

const GENERIC_MESSAGE =
  'If an account exists with this email, a password reset link has been sent.';

function tooManyRequestsResponse(retryAfter: number) {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many password reset requests. Please try again later.',
      retryAfter,
    },
    { status: 429 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    const rateLimit = checkRateLimit({
      request,
      keyPrefix: 'auth:forgot-password',
      identifier: email || 'anonymous',
      maxRequests: 5,
      windowMs: THIRTY_MINUTES,
    });

    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(rateLimit.retryAfter);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + ONE_HOUR);
    await user.save();

    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return NextResponse.json(
        { success: false, error: 'Unable to send reset email right now. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
