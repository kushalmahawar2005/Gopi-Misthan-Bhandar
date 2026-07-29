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
    const { items, action } = body;

    if (action === 'sync') {
      // Login-time merge: union of the saved cart and whatever this browser had,
      // keeping the larger quantity per line.
      //
      // An empty local cart must NEVER clear the saved cart. A fresh browser
      // writes localStorage.cart = "[]" before the user object resolves, so
      // trusting "local is empty" here used to delete the cart on every login
      // from a new device. Emptying a cart is done through the normal (non-sync)
      // save path instead, which is an explicit user action.
      const dbCart = await Cart.findOne({ userId }).lean();
      const dbItems: any[] = dbCart ? (dbCart as any).items || [] : [];
      const localItems = Array.isArray(items) ? items : [];
      const merged = [...dbItems];

      for (const localItem of localItems) {
        const existsIndex = merged.findIndex((i: any) => isSameCartLine(i, localItem));

        if (existsIndex === -1) {
          merged.push(localItem);
        } else if (Number(localItem?.quantity) > Number(merged[existsIndex]?.quantity)) {
          merged[existsIndex] = { ...merged[existsIndex], quantity: Number(localItem.quantity) };
        }
      }

      const newCart = await Cart.findOneAndUpdate(
        { userId },
        { items: merged },
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
