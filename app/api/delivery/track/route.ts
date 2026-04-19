import { NextRequest, NextResponse } from 'next/server';
import { trackShipment } from '@/lib/nimbuspost';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const awb = req.nextUrl.searchParams.get('awb');

    if (!awb) {
      return NextResponse.json({ success: false, message: 'AWB is required' }, { status: 400 });
    }

    const result = await trackShipment(awb);

    if (result.status && result.data) {
      const trackingData = result.data;
      
      // Map NimbusPost status to our structure
      // Note: NimbusPost tracking structure can vary, but usually has status_history or similar
      const history = trackingData.history || trackingData.scans || [];
      
      return NextResponse.json({
        success: true,
        data: {
          currentStatus: trackingData.status || trackingData.current_status || 'In Transit',
          location: trackingData.location || '',
          estimatedDelivery: trackingData.edd || '',
          timeline: history.map((h: any) => ({
            status: h.status || h.activity || '',
            location: h.location || '',
            timestamp: h.date || h.time || h.event_at || '',
          }))
        }
      });
    }

    return NextResponse.json({ success: false, message: result.message || 'Tracking information not found' }, { status: 404 });

  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
