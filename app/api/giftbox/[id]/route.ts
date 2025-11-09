import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GiftBox from '@/models/GiftBox';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const giftBox = await GiftBox.findById(params.id)
      .select('category title description imageUrl order isActive')
      .lean();
    if (!giftBox) {
      return NextResponse.json(
        { success: false, error: 'GiftBox not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: giftBox });
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
    
    const updateData: any = {};
    if (body.category !== undefined && body.category !== null) updateData.category = body.category;
    if (body.title !== undefined && body.title !== null) updateData.title = body.title;
    if (body.description !== undefined && body.description !== null) updateData.description = body.description;
    if (body.imageUrl !== undefined && body.imageUrl !== null) updateData.imageUrl = body.imageUrl;
    if (body.order !== undefined && body.order !== null) updateData.order = Number(body.order);
    if (body.isActive !== undefined && body.isActive !== null) updateData.isActive = Boolean(body.isActive);
    
    const giftBox = await GiftBox.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('category title description imageUrl order isActive');
    
    if (!giftBox) {
      return NextResponse.json(
        { success: false, error: 'GiftBox not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: giftBox });
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
    const giftBox = await GiftBox.findByIdAndDelete(params.id);
    if (!giftBox) {
      return NextResponse.json(
        { success: false, error: 'GiftBox not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: giftBox });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

