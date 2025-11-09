import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GiftBox from '@/models/GiftBox';

export async function GET() {
  try {
    await connectDB();
    const giftBoxes = await GiftBox.find()
      .select('category title description imageUrl order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: giftBoxes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

