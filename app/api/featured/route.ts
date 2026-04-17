import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrendingBanner from '@/models/TrendingBanner';
import { getRequestAuth } from '@/lib/auth';

// Get active trending banner (What's Trending)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const includeInactiveRequested =
      request.nextUrl.searchParams.get('includeInactive') === 'true';
    let includeInactive = false;

    if (includeInactiveRequested) {
      try {
        const auth = await getRequestAuth(request);
        includeInactive = auth.isAuthenticated && auth.isAdmin;
      } catch {
        includeInactive = false;
      }
    }

    const banner = await TrendingBanner.findOne(includeInactive ? {} : { isActive: true }).sort({
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

    const requestedActiveState = isActive !== false;

    const safeDelay =
      typeof delaySeconds === 'number' && !Number.isNaN(delaySeconds) && delaySeconds > 0
        ? delaySeconds
        : 12;

    let banner;

    if (id) {
      const existingBanner = await TrendingBanner.findById(id);

      if (!existingBanner) {
        return NextResponse.json(
          { success: false, error: 'Banner not found' },
          { status: 404 }
        );
      }

      const resolvedImageUrl = imageUrl || existingBanner.imageUrl;
      const resolvedProductId = productId || existingBanner.productId;

      if (!resolvedImageUrl || !resolvedProductId) {
        return NextResponse.json(
          { success: false, error: 'Image and product are required' },
          { status: 400 }
        );
      }

      banner = await TrendingBanner.findByIdAndUpdate(
        id,
        {
          title,
          subtitle,
          imageUrl: resolvedImageUrl,
          buttonText: buttonText || existingBanner.buttonText || 'View Product',
          categorySlug: categorySlug ?? existingBanner.categorySlug,
          productId: resolvedProductId,
          delaySeconds: safeDelay,
          isActive: requestedActiveState,
        },
        {
        new: true,
        runValidators: true,
        }
      );
    } else {
      if (!imageUrl || !productId) {
        return NextResponse.json(
          { success: false, error: 'Image and product are required' },
          { status: 400 }
        );
      }

      banner = await TrendingBanner.create({
        title,
        subtitle,
        imageUrl,
        buttonText: buttonText || 'View Product',
        categorySlug,
        productId,
        delaySeconds: safeDelay,
        isActive: requestedActiveState,
      });
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

