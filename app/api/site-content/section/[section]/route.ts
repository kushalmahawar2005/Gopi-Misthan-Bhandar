import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

// GET site content by section
export async function GET(request: NextRequest, { params }: { params: { section: string } }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // For admin panel, include inactive content. For frontend, only active content
    const query = includeInactive 
      ? { section: params.section }
      : { section: params.section, isActive: true };
    
    const content = await SiteContent.findOne(query);

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }

    // Convert to plain object to ensure all fields are included
    const responseData = JSON.parse(JSON.stringify(content));
    console.log('GET Fetched content for section:', params.section);
    console.log('GET aboutCards:', responseData.aboutCards);
    console.log('GET Full response data keys:', Object.keys(responseData));

    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

