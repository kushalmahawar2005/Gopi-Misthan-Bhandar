import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAdmin } from '@/lib/auth';


// GET all site content
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');
    const isActive = searchParams.get('isActive');

    let query: any = {};

    if (section) {
      query.section = section;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const content = await SiteContent.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: content }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new site content
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();
    
    const body = await request.json();
    const content = await SiteContent.create(body);

    // Convert to plain object to ensure all fields are included
    const responseData = JSON.parse(JSON.stringify(content));

    return NextResponse.json({ success: true, data: responseData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating site content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

