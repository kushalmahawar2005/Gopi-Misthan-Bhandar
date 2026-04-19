import Order from '@/models/Order';

export interface CleanupExpiredPendingOrdersOptions {
  userId?: string;
  olderThanMinutes?: number;
  limit?: number;
}

export interface CleanupExpiredPendingOrdersResult {
  expiredCount: number;
  scannedCount: number;
  cutoffDate: Date;
}

export async function cleanupExpiredPendingOrders(
  options: CleanupExpiredPendingOrdersOptions = {}
): Promise<CleanupExpiredPendingOrdersResult> {
  const olderThanMinutes = Math.max(1, options.olderThanMinutes ?? 30);
  const limit = Math.min(Math.max(1, options.limit ?? 50), 200);
  const cutoffDate = new Date(Date.now() - olderThanMinutes * 60 * 1000);

  const query: Record<string, any> = {
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: { $lt: cutoffDate },
  };

  if (options.userId) {
    query.userId = options.userId;
  }

  const candidates = await Order.find(query)
    .select('_id createdAt')
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  let expiredCount = 0;

  for (const candidate of candidates) {
    const updated = await Order.findOneAndUpdate(
      {
        _id: candidate._id,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lt: cutoffDate },
      },
      {
        $set: {
          status: 'expired',
          paymentStatus: 'failed',
        },
      }
    );

    if (updated) {
      expiredCount += 1;
    }
  }

  return {
    expiredCount,
    scannedCount: candidates.length,
    cutoffDate,
  };
}
