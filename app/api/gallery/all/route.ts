import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await connectDB();
    const galleryItems = await Gallery.find()
      .select('imageUrl title description order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: galleryItems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
