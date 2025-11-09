import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InstaBook from '@/models/InstaBook';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const instaBook = await InstaBook.findById(params.id);
    if (!instaBook) {
      return NextResponse.json(
        { success: false, error: 'InstaBook item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaBook });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const instaBook = await InstaBook.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!instaBook) {
      return NextResponse.json(
        { success: false, error: 'InstaBook item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaBook });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const instaBook = await InstaBook.findByIdAndDelete(params.id);
    if (!instaBook) {
      return NextResponse.json(
        { success: false, error: 'InstaBook item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaBook });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

