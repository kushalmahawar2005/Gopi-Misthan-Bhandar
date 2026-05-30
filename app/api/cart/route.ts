import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { getRequestAuth } from '@/lib/auth';

// Mirror CartContext: a line is identified by product id + a single normalized
// variant (selectedWeight || selectedSize || defaultWeight), not strict equality
// on both size and weight separately.
function normalizeLineVariant(item: any): string {
  return String(item?.selectedWeight || item?.selectedSize || item?.defaultWeight || '').trim();
}

function isSameCartLine(a: any, b: any): boolean {
  return a?.id === b?.id && normalizeLineVariant(a) === normalizeLineVariant(b);
}

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const auth = await getRequestAuth(request);
  if (!auth.isAuthenticated || !auth.user?.id) {
    return null;
  }
  return auth.user.id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ userId });
    return NextResponse.json({ success: true, data: cart ? cart.items : [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { items, action, hasLocalCart } = body;

    if (action === 'sync') {
      // Sync operation: merge local items with DB items
      const dbCart = await Cart.findOne({ userId });
      const dbItems = dbCart ? dbCart.items : [];
      const shouldTrustLocal = Boolean(hasLocalCart);
      const localItems = Array.isArray(items) ? items : [];
      let merged = shouldTrustLocal && localItems.length === 0 ? [] : [...dbItems];

      if (localItems.length > 0) {
        localItems.forEach((localItem: any) => {
          // Find if local item exists in DB cart (by ID + normalized variant)
          const existsIndex = merged.findIndex((i: any) => isSameCartLine(i, localItem));

          if (existsIndex === -1) {
            merged.push(localItem);
          } else {
            // Keep the larger quantity or overwrite
            if (localItem.quantity > merged[existsIndex].quantity) {
              merged[existsIndex].quantity = localItem.quantity;
            }
          }
        });
      }

      const finalItems = shouldTrustLocal ? merged : dbItems;
      
      const newCart = await Cart.findOneAndUpdate(
        { userId },
        { items: finalItems },
        { new: true, upsert: true }
      );
      
      return NextResponse.json({ success: true, data: newCart.items }, { status: 200 });
    } else {
      // Normal overwrite operation (called on every cart update)
      const cart = await Cart.findOneAndUpdate(
        { userId },
        { items: items || [] },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, data: cart.items }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    await Cart.findOneAndDelete({ userId });
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
