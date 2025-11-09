import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const galleryItem = await Gallery.findById(params.id)
      .select('imageUrl title description order isActive')
      .lean();
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: galleryItem });
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
    
    // Only update fields that are provided and valid
    const updateData: any = {};
    if (body.imageUrl !== undefined && body.imageUrl !== null) updateData.imageUrl = body.imageUrl;
    if (body.title !== undefined && body.title !== null) updateData.title = body.title;
    if (body.description !== undefined && body.description !== null) updateData.description = body.description;
    if (body.order !== undefined && body.order !== null) updateData.order = Number(body.order);
    if (body.isActive !== undefined && body.isActive !== null) updateData.isActive = Boolean(body.isActive);
    
    const galleryItem = await Gallery.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('imageUrl title description order isActive');
    
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: galleryItem });
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
    const galleryItem = await Gallery.findByIdAndDelete(params.id);
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: galleryItem });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

