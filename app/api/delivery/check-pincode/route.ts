import { NextRequest, NextResponse } from 'next/server';
import { checkServiceability } from '@/lib/nimbuspost';

export async function POST(req: NextRequest) {
  try {
    const { pincode, weight, orderAmount } = await req.json();

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ success: false, message: 'Invalid pincode' }, { status: 400 });
    }

    // Default weight to 0.5kg if not provided
    const weightKg = weight ? parseFloat(weight) : 0.5;

    const result = await checkServiceability({
      pincode,
      weight: weightKg,
      order_amount: orderAmount || 0,
      payment_method: 'prepaid', // COD disabled as per request
    });

    if (result.status && result.data && result.data.length > 0) {
      const couriers = result.data.map((c: any) => ({
        name: c.name,
        charge: c.total_amount,
        estimatedDays: parseInt(c.expected_delivery_days) || 5,
        id: c.id
      }));

      // Sort by charge to find cheapest
      const sorted = [...couriers].sort((a, b) => a.charge - b.charge);
      const cheapestOption = sorted[0];

      return NextResponse.json({
        success: true,
        data: {
          isServiceable: true,
          isCOD: false,
          couriers: couriers,
          cheapestOption: cheapestOption,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isServiceable: false,
        isCOD: false,
        couriers: [],
        cheapestOption: null,
      }
    });

  } catch (error: any) {
    console.error('Pincode check API error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
