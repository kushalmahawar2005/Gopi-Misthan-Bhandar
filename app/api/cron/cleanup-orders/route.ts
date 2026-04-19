import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cleanupExpiredPendingOrders } from '@/lib/orderCleanup';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const secretHeader = request.headers.get('x-cron-secret') || '';
    const authorizationHeader = request.headers.get('authorization') || '';
    const bearerSecret = authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.slice('Bearer '.length)
      : '';

    if (!cronSecret || (secretHeader !== cronSecret && bearerSecret !== cronSecret)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const result = await cleanupExpiredPendingOrders({
      olderThanMinutes: 30,
      limit: 200,
    });

    if (result.expiredCount === 0) {
      return NextResponse.json({ success: true, message: 'No expired orders found', count: 0 });
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.expiredCount} orders`,
      count: result.expiredCount,
      scanned: result.scannedCount,
    });

  } catch (error: any) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
