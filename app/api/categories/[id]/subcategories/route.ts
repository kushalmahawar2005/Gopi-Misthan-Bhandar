import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET all subcategories of a category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const category = await Category.findById(params.id).select('subCategories');
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category.subCategories || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new subcategory
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, slug, image, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if subcategory with same slug already exists
    if (category.subCategories?.some((sub: any) => sub.slug === slug)) {
      return NextResponse.json({ success: false, error: 'Subcategory with this slug already exists' }, { status: 400 });
    }

    // Add subcategory
    if (!category.subCategories) {
      category.subCategories = [];
    }

    category.subCategories.push({
      name,
      slug,
      image: image || undefined,
      description: description || undefined,
    });

    await category.save();

    return NextResponse.json({ success: true, data: category.subCategories[category.subCategories.length - 1] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

