import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

const CATEGORY_ALIASES: Record<string, string> = {
  'bakery-items': 'bakery',
};

function normalizeCategorySlug(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || normalized;
}


// GET all products with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = normalizeCategorySlug(searchParams.get('category'));
    const subcategory = searchParams.get('subcategory');

    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isClassic = searchParams.get('isClassic');
    const isPremium = searchParams.get('isPremium');

    let query: any = {};

    if (subcategory && subcategory !== 'all') {
      // If subcategory is provided, filter by subcategory
      query.subcategory = subcategory;
    } else if (category && category !== 'all') {
      // If only category is provided, filter by category
      query.category = category;
    }


    if (featured === 'true') {
      query.featured = true;
    }

    if (isClassic === 'true') {
      query.isClassic = true;
    }

    if (isPremium === 'true') {
      query.isPremium = true;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 2. Implementation: Skip and Limit for pagination
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      { 
        success: true, 
        data: products,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          limit
        }
      },
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
  const authError = await requireAdmin(request);
  if (authError) return authError;

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

