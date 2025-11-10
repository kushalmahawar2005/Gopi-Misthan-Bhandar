import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HeroSlider from '@/models/HeroSlider';

// GET all hero slides
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    
    const query = all ? {} : { isActive: true };
    const slides = await HeroSlider.find(query)
      .select('image mobileImage order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json(
      { success: true, data: slides },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new hero slide
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const slide = await HeroSlider.create(body);
    
    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

