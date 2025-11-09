import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InstaPost from '@/models/InstaPost';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const instaPost = await InstaPost.findById(params.id)
      .select('imageUrl caption instagramUrl order isActive')
      .lean();
    if (!instaPost) {
      return NextResponse.json(
        { success: false, error: 'InstaPost not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaPost });
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
    if (body.caption !== undefined && body.caption !== null) updateData.caption = body.caption;
    if (body.instagramUrl !== undefined && body.instagramUrl !== null) updateData.instagramUrl = body.instagramUrl;
    if (body.order !== undefined && body.order !== null) updateData.order = Number(body.order);
    if (body.isActive !== undefined && body.isActive !== null) updateData.isActive = Boolean(body.isActive);
    
    const instaPost = await InstaPost.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('imageUrl caption instagramUrl order isActive');
    
    if (!instaPost) {
      return NextResponse.json(
        { success: false, error: 'InstaPost not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaPost });
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
    const instaPost = await InstaPost.findByIdAndDelete(params.id);
    if (!instaPost) {
      return NextResponse.json(
        { success: false, error: 'InstaPost not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: instaPost });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

