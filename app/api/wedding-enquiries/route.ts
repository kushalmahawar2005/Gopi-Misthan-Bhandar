import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WeddingEnquiry from '@/models/WeddingEnquiry';
import { sendWeddingEnquiryEmails } from '@/lib/email';

const sanitizeString = (value?: string) => (typeof value === 'string' ? value.trim() : undefined);

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let query = WeddingEnquiry.find().sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }

    const enquiries = await query.lean();

    return NextResponse.json(
      {
        success: true,
        data: enquiries.map((enquiry: any) => ({
          id: enquiry._id ? String(enquiry._id) : enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          location: enquiry.location,
          giftType: enquiry.giftType,
          quantityPreference: enquiry.quantityPreference,
          description: enquiry.description,
          createdAt: enquiry.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching wedding enquiries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const name = sanitizeString(body.name);
    const email = sanitizeString(body.email);
    const phone = sanitizeString(body.phone);
    const location = sanitizeString(body.location);
    const giftType = sanitizeString(body.giftType);
    const quantityPreference = sanitizeString(body.quantityPreference);
    const description = sanitizeString(body.description);

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Either email or phone is required' },
        { status: 400 }
      );
    }

    const enquiry = await WeddingEnquiry.create({
      name,
      email,
      phone,
      location,
      giftType,
      quantityPreference: quantityPreference || 'small',
      description,
    });

    sendWeddingEnquiryEmails({
      name,
      email,
      phone,
      location,
      giftType,
      quantityPreference: quantityPreference || 'small',
      description,
      createdAt: enquiry.createdAt instanceof Date ? enquiry.createdAt.toISOString() : new Date().toISOString(),
    }).catch((error) => {
      console.error('Failed to send enquiry emails:', error);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: enquiry._id ? String(enquiry._id) : enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          location: enquiry.location,
          giftType: enquiry.giftType,
          quantityPreference: enquiry.quantityPreference,
          description: enquiry.description,
          createdAt: enquiry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating wedding enquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


