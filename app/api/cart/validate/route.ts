import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Re-price a cart against the live catalogue.
 *
 * Cart lines are persisted in localStorage/Mongo with the price captured at
 * add-time, so they go stale whenever a price changes. This endpoint returns
 * the CURRENT name/price/image/stock for each line so the client can refresh
 * what the customer sees. It is read-only and safe for guests (it exposes only
 * public catalogue data), so no auth - just a rate limit.
 */

/** "250 gm" / "250gm" / "250 GM" all compare equal. */
function normalizeWeight(value: unknown): string {
  return String(value ?? '').toLowerCase().replace(/\s+/g, '').trim();
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit({
    request,
    keyPrefix: 'cart-validate',
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const rawLines = Array.isArray(body?.items) ? body.items : [];

    if (rawLines.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const lines = rawLines.slice(0, 100).map((line: any) => ({
      id: String(line?.id ?? line?.productId ?? '').trim(),
      weight: String(line?.weight ?? line?.selectedWeight ?? line?.selectedSize ?? '').trim(),
    }));

    const ids = Array.from(new Set(lines.map((l: any) => l.id).filter(Boolean)));
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    await connectDB();

    const products = await Product.find({ _id: { $in: ids } })
      .select('name slug price image sizes stock isActive defaultWeight')
      .lean();

    const byId = new Map(products.map((p: any) => [String(p._id), p]));

    const data = lines.map((line: any) => {
      const product: any = byId.get(line.id);

      // Product deleted or hidden -> tell the client to drop the line.
      if (!product || product.isActive === false) {
        return { id: line.id, weight: line.weight, available: false };
      }

      const sizes = Array.isArray(product.sizes) ? product.sizes : [];
      const match = line.weight
        ? sizes.find((s: any) => normalizeWeight(s?.weight) === normalizeWeight(line.weight))
        : null;

      const price = Number(match?.price ?? product.price);

      return {
        id: line.id,
        weight: line.weight,
        available: true,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: Number.isFinite(price) ? price : Number(product.price) || 0,
        stock: typeof product.stock === 'number' ? product.stock : null,
        // A weight that no longer exists on the product (size was removed).
        weightAvailable: line.weight ? Boolean(match) || sizes.length === 0 : true,
      };
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
