import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

// GET all reviews (with filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const approved = searchParams.get('approved');
    const limit = searchParams.get('limit');

    let query: any = {};

    if (productId) {
      query.productId = productId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (approved !== null) {
      query.isApproved = approved === 'true';
    }

    let reviewsQuery = Review.find(query)
      .sort({ createdAt: -1 });

    if (limit) {
      reviewsQuery = reviewsQuery.limit(parseInt(limit));
    }

    const reviews = await reviewsQuery.lean();

    // Calculate average rating for product if productId is provided
    if (productId) {
      const stats = await Review.aggregate([
        { $match: { productId, isApproved: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (stats.length > 0 && stats[0].ratingDistribution) {
        stats[0].ratingDistribution.forEach((rating: number) => {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
        });
      }

      return NextResponse.json({
        success: true,
        data: reviews,
        stats: stats.length > 0 ? {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews,
          ratingDistribution,
        } : {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution,
        },
      });
    }

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productId, userId, userName, userEmail, rating, title, comment } = body;

    // Validate required fields
    if (!productId || !userId || !userName || !userEmail || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      isApproved: false, // Require admin approval
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

