import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAdmin } from '@/lib/auth';


// GET single site content
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const content = await SiteContent.findById(params.id);

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: content }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update site content
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    
    const body = await request.json();
    
    // Find the document first
    const existingContent = await SiteContent.findById(params.id);
    
    if (!existingContent) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }

    // Update all fields explicitly
    if (body.section !== undefined) existingContent.section = body.section;
    if (body.title !== undefined) existingContent.title = body.title;
    if (body.subtitle !== undefined) existingContent.subtitle = body.subtitle;
    if (body.description !== undefined) existingContent.description = body.description;
    if (body.mainImage !== undefined) existingContent.mainImage = body.mainImage;
    if (body.images !== undefined) existingContent.images = body.images;
    if (body.aboutCards !== undefined) {
      existingContent.aboutCards = body.aboutCards;
    }
    if (body.stats !== undefined) existingContent.stats = body.stats;
    if (body.content !== undefined) existingContent.content = body.content;
    if (body.giftsContent !== undefined) existingContent.giftsContent = body.giftsContent;
    if (body.isActive !== undefined) existingContent.isActive = body.isActive;

    // Save the document
    const savedContent = await existingContent.save();

    // Convert to plain object to ensure all fields are included
    const responseData = JSON.parse(JSON.stringify(savedContent));
    
    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating site content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE site content
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    
    const content = await SiteContent.findByIdAndDelete(params.id);

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

