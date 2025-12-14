import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  try {
    await connectDB();
    
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const subcategory = category.subCategories?.find(
      (sub: any) => sub.slug === params.subId
    );

    if (!subcategory) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subcategory }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, slug, image, description } = body;

    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    const subcategoryIndex = category.subCategories.findIndex(
      (sub: any) => sub.slug === params.subId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    // Check if new slug conflicts with another subcategory
    if (slug && slug !== category.subCategories[subcategoryIndex].slug) {
      if (category.subCategories.some((sub: any, idx: number) => idx !== subcategoryIndex && sub.slug === slug)) {
        return NextResponse.json({ success: false, error: 'Subcategory with this slug already exists' }, { status: 400 });
      }
    }

    // Update subcategory
    if (name) category.subCategories[subcategoryIndex].name = name;
    if (slug) category.subCategories[subcategoryIndex].slug = slug;
    if (image !== undefined) category.subCategories[subcategoryIndex].image = image;
    if (description !== undefined) category.subCategories[subcategoryIndex].description = description;

    await category.save();

    return NextResponse.json({ success: true, data: category.subCategories[subcategoryIndex] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  try {
    await connectDB();
    
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    const subcategoryIndex = category.subCategories.findIndex(
      (sub: any) => sub.slug === params.subId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }

    category.subCategories.splice(subcategoryIndex, 1);
    await category.save();

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

