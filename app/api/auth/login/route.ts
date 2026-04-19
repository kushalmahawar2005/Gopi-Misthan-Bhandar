import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function tooManyRequestsResponse(retryAfter: number) {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many login attempts. Please try again later.',
      retryAfter,
    },
    { status: 429 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const ipLimit = checkRateLimit({
      request,
      keyPrefix: 'auth:login:ip',
      maxRequests: 25,
      windowMs: FIFTEEN_MINUTES,
    });

    if (!ipLimit.allowed) {
      return tooManyRequestsResponse(ipLimit.retryAfter);
    }

    const identityLimit = checkRateLimit({
      request,
      keyPrefix: 'auth:login:identity',
      identifier: email || 'anonymous',
      maxRequests: 8,
      windowMs: FIFTEEN_MINUTES,
    });

    if (!identityLimit.allowed) {
      return tooManyRequestsResponse(identityLimit.retryAfter);
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const userId = String(user._id);
    const token = await signToken({ userId, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });

    // Set cookie for middleware access
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

