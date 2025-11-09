import { NextRequest, NextResponse } from 'next/server';
import { checkPincodeServiceability } from '@/lib/delivery';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pincode = searchParams.get('pincode');
    const orderAmount = parseFloat(searchParams.get('amount') || '0');

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode is required' },
        { status: 400 }
      );
    }

    const deliveryInfo = checkPincodeServiceability(pincode, orderAmount);

    return NextResponse.json({
      success: true,
      data: deliveryInfo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

