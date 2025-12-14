import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Optimize query - select only needed fields and use lean
    const categories = await Category.find()
      .select('name slug image description subCategories order')
      .sort({ order: 1, name: 1 })
      .lean();

    // Add cache headers for better performance
    return NextResponse.json(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // If order is not provided or is 0, auto-assign the next order number (1-based)
    if (!body.order || body.order === 0) {
      const maxOrderCategory = await Category.findOne().sort({ order: -1 }).select('order').lean();
      const maxOrder = maxOrderCategory && maxOrderCategory.order !== undefined ? maxOrderCategory.order : 0;
      body.order = maxOrder + 1;
    }
    
    const category = await Category.create(body);

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

