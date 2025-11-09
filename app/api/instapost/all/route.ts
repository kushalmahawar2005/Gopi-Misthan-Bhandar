import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InstaPost from '@/models/InstaPost';

export async function GET() {
  try {
    await connectDB();
    const instaPosts = await InstaPost.find()
      .select('imageUrl caption instagramUrl order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: instaPosts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

