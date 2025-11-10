import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, password, phone } = body;

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

    // Generate token
    const userId = String(user._id);
    const token = signToken({ userId, email: user.email, role: user.role });

    return NextResponse.json(
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

