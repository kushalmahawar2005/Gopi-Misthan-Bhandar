import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    return NextResponse.json({ success: true, data: cart ? cart.items : [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, items, action } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'sync') {
      // Sync operation: merge local items with DB items
      const dbCart = await Cart.findOne({ userId });
      const dbItems = dbCart ? dbCart.items : [];
      let merged = [...dbItems];
      let hasChanges = false;
      
      const localItems = items || [];
      
      localItems.forEach((localItem: any) => {
        // Find if local item exists in DB cart (by ID and weight/size)
        const existsIndex = merged.findIndex((i: any) => 
          i.id === localItem.id && 
          i.selectedWeight === localItem.selectedWeight && 
          i.selectedSize === localItem.selectedSize
        );
        
        if (existsIndex === -1) {
          merged.push(localItem);
          hasChanges = true;
        } else {
          // Keep the larger quantity or overwrite
          if (localItem.quantity > merged[existsIndex].quantity) {
             merged[existsIndex].quantity = localItem.quantity;
             hasChanges = true;
          }
        }
      });

      // Avoid writing if nothing has changed.
      const finalItems = (localItems.length === 0 && dbItems.length > 0) ? dbItems : merged;
      
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
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    await Cart.findOneAndDelete({ userId });
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
