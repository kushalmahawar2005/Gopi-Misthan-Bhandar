import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// GET all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const isClassic = searchParams.get('isClassic');
    const isPremium = searchParams.get('isPremium');

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (isClassic === 'true') {
      query.isClassic = true;
    }
    
    if (isPremium === 'true') {
      query.isPremium = true;
    }

    // Optimize query - select only needed fields and add limit early
    let productsQuery = Product.find(query)
      .select('name description price image images category featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock')
      .sort({ createdAt: -1 });

    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }

    const products = await productsQuery.lean(); // Use lean() for better performance

    // Add cache headers for better performance
    return NextResponse.json(
      { success: true, data: products },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate category (including subcategories)
    if (body.category) {
      const categories = await Category.find({});
      const categoryExists = categories.some((cat: any) => cat.slug === body.category);
      const subcategoryExists = categories.some((cat: any) => 
        cat.subCategories && cat.subCategories.some((sub: any) => sub.slug === body.category)
      );
      
      if (!categoryExists && !subcategoryExists) {
        return NextResponse.json({ 
          success: false, 
          error: `Category "${body.category}" not found. Please use a valid category or subcategory slug.` 
        }, { status: 400 });
      }
    }
    
    // Make image optional - allow empty string
    if (!body.image) {
      body.image = '';
    }
    
    const product = await Product.create(body);

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

