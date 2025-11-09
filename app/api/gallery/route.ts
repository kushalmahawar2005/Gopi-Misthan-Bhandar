import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET() {
  try {
    await connectDB();
    const galleryItems = await Gallery.find({ isActive: true })
      .select('imageUrl title description order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: galleryItems }, {
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
    const galleryItem = await Gallery.create(body);
    return NextResponse.json({ success: true, data: galleryItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

