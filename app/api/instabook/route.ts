import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InstaBook from '@/models/InstaBook';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    
    const query = all ? {} : { isActive: true };
    const instaBooks = await InstaBook.find(query)
      .select('label videoUrl isInstagramReel overlayText order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json(
      { success: true, data: instaBooks },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
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
    const instaBook = await InstaBook.create(body);
    return NextResponse.json({ success: true, data: instaBook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
