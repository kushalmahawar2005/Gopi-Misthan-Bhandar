import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HeroSlider from '@/models/HeroSlider';

// GET hero slide by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const slide = await HeroSlider.findById(params.id);
    
    if (!slide) {
      return NextResponse.json({ success: false, error: 'Hero slide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: slide }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update hero slide
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const slide = await HeroSlider.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!slide) {
      return NextResponse.json({ success: false, error: 'Hero slide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: slide }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE hero slide
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const deletedSlide = await HeroSlider.findByIdAndDelete(params.id);
    
    if (!deletedSlide) {
      return NextResponse.json({ success: false, error: 'Hero slide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

