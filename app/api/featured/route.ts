import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrendingBanner from '@/models/TrendingBanner';

// Get active trending banner (What's Trending)
export async function GET() {
  try {
    await connectDB();

    const banner = await TrendingBanner.findOne({ isActive: true }).sort({
      updatedAt: -1,
    });

    return NextResponse.json({ success: true, data: banner }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching trending banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching trending banner' },
      { status: 500 }
    );
  }
}

// Create or update trending banner
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      id,
      title,
      subtitle,
      imageUrl,
      buttonText,
      categorySlug,
      productId,
      delaySeconds,
      isActive = true,
    } = body;

    if (!imageUrl || !productId) {
      return NextResponse.json(
        { success: false, error: 'Image and product are required' },
        { status: 400 }
      );
    }

    const safeDelay =
      typeof delaySeconds === 'number' && !Number.isNaN(delaySeconds) && delaySeconds > 0
        ? delaySeconds
        : 12;

    const updateData = {
      title,
      subtitle,
      imageUrl,
      buttonText: buttonText || 'View Product',
      categorySlug,
      productId,
      delaySeconds: safeDelay,
      isActive,
    };

    let banner;

    if (id) {
      banner = await TrendingBanner.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      banner = await TrendingBanner.create(updateData);
    }

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Unable to save trending banner' },
        { status: 500 }
      );
    }

    // Ensure only one active banner at a time
    if (banner.isActive) {
      await TrendingBanner.updateMany(
        { _id: { $ne: banner._id } },
        { $set: { isActive: false } }
      );
    }

    return NextResponse.json(
      { success: true, data: banner },
      { status: id ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Error saving trending banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error saving trending banner' },
      { status: 500 }
    );
  }
}

