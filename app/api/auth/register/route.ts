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
      error: 'Too many registration attempts. Please try again later.',
      retryAfter,
    },
    { status: 429 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const phone = body?.phone ? String(body.phone).trim() : undefined;

    const ipLimit = checkRateLimit({
      request,
      keyPrefix: 'auth:register:ip',
      maxRequests: 10,
      windowMs: FIFTEEN_MINUTES,
    });

    if (!ipLimit.allowed) {
      return tooManyRequestsResponse(ipLimit.retryAfter);
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user',
    });

    const userId = String(user._id);
    const token = await signToken({ userId, email: user.email, role: user.role });

    const response = NextResponse.json(
      {
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
      },
      { status: 201 }
    );

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

