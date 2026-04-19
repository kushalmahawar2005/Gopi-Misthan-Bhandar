import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { requireAdmin } from '@/lib/auth';
import { extractObjectIdFromSlug } from '@/lib/slug';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const normalized = String(params.id || '').toLowerCase();
    const objectId = extractObjectIdFromSlug(normalized);
    const query = objectId
      ? { $or: [{ _id: objectId }, { slug: normalized }] }
      : { slug: normalized };

    const blog = await Blog.findOne(query)
      .select('title description imageUrl content slug publishedDate order isActive')
      .lean();
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
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
    if (body.title !== undefined && body.title !== null) updateData.title = body.title;
    if (body.description !== undefined && body.description !== null) updateData.description = body.description;
    if (body.imageUrl !== undefined && body.imageUrl !== null) updateData.imageUrl = body.imageUrl;
    if (body.content !== undefined && body.content !== null) updateData.content = body.content;
    if (body.slug !== undefined && body.slug !== null) updateData.slug = body.slug;
    if (body.publishedDate !== undefined && body.publishedDate !== null) updateData.publishedDate = new Date(body.publishedDate);
    if (body.order !== undefined && body.order !== null) updateData.order = Number(body.order);
    if (body.isActive !== undefined && body.isActive !== null) updateData.isActive = Boolean(body.isActive);
    
    const blog = await Blog.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('title description imageUrl content slug publishedDate order isActive');
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
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
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    const blog = await Blog.findByIdAndDelete(params.id);
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

