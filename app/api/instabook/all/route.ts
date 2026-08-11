import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InstaBook from '@/models/InstaBook';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await connectDB();
    const instaBooks = await InstaBook.find()
      .sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: instaBooks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
