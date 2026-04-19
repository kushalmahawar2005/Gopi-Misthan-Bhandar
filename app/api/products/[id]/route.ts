import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { buildProductSlug, slugifyText } from '@/lib/slug';

function buildLookupQuery(identifier: string) {
  const normalized = String(identifier || '').toLowerCase();

  if (!normalized) return null;
  if (mongoose.Types.ObjectId.isValid(normalized)) {
    return { $or: [{ _id: normalized }, { slug: normalized }] };
  }

  const slugMatch = normalized.match(/([a-f0-9]{24})$/);
  if (slugMatch) {
    return {
      $or: [
        { _id: slugMatch[1] },
        { slug: normalized },
      ],
    };
  }

  return { slug: normalized };
}

function buildUpdateTarget(identifier: string) {
  const normalized = String(identifier || '').toLowerCase();
  if (mongoose.Types.ObjectId.isValid(normalized)) {
    return { _id: normalized };
  }

  const slugMatch = normalized.match(/([a-f0-9]{24})$/);
  if (slugMatch) {
    return { _id: slugMatch[1] };
  }

  return { slug: normalized };
}


// GET single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const query = buildLookupQuery(params.id);
    if (!query) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const product = await Product.findOne(query);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();

    const body = await request.json();

    const updateTarget = buildUpdateTarget(params.id);
    const updateData = { ...body };

    if (typeof updateData.slug === 'string') {
      updateData.slug = slugifyText(updateData.slug);
    } else if (typeof updateData.name === 'string') {
      if (mongoose.Types.ObjectId.isValid(String(updateTarget._id || ''))) {
        updateData.slug = buildProductSlug(updateData.name, String(updateTarget._id));
      }
    }

    const product = await Product.findOneAndUpdate(updateTarget, updateData, { new: true, runValidators: true });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();

    const updateTarget = buildUpdateTarget(params.id);
    const product = await Product.findOneAndDelete(updateTarget);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

