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
      const couriers = result.data.map((c: any) => {
        // Calculate estimated days from edd (format: "19-04-2026")
        let days = 5;
        if (c.edd) {
          try {
            const [d, m, y] = c.edd.split('-').map(Number);
            const eddDate = new Date(y, m - 1, d);
            const diffTime = eddDate.getTime() - new Date().getTime();
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          } catch (e) {
            days = 5;
          }
        }

        return {
          name: c.name,
          charge: c.total_charges || c.freight_charges || 0,
          estimatedDays: days > 0 ? days : 5,
          id: c.id
        };
      });

      // Sort by charge to find cheapest
      const sortedByPrice = [...couriers].sort((a, b) => a.charge - b.charge);

      const cheapest = sortedByPrice[0];

      // Only return the absolute cheapest option as requested
      const topOptions = [cheapest];

      return NextResponse.json({
        success: true,
        data: {
          isServiceable: true,
          isCOD: false,
          couriers: topOptions,
          cheapestOption: cheapest,
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
