import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GiftBox from '@/models/GiftBox';

export async function GET() {
  try {
    await connectDB();
    const giftBoxes = await GiftBox.find({ isActive: true })
      .select('category title description imageUrl size price order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: giftBoxes }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const giftBox = await GiftBox.create(body);
    return NextResponse.json({ success: true, data: giftBox }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

