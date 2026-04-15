import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const wishlist = await Wishlist.findOne({ userId });
    return NextResponse.json({ success: true, data: wishlist ? wishlist.items : [] }, { status: 200 });
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
      // Sync operation: merge local items with DB items avoiding duplicates
      const dbWishlist = await Wishlist.findOne({ userId });
      const dbItems = dbWishlist ? dbWishlist.items : [];
      let merged = [...dbItems];
      let hasChanges = false;
      
      const localItems = items || [];
      
      localItems.forEach((localItem: any) => {
        const exists = merged.find((i: any) => i.id === localItem.id);
        if (!exists) {
          merged.push(localItem);
          hasChanges = true;
        }
      });

      const finalItems = (localItems.length === 0 && dbItems.length > 0) ? dbItems : merged;
      
      const newWishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { items: finalItems },
        { new: true, upsert: true }
      );
      
      return NextResponse.json({ success: true, data: newWishlist.items }, { status: 200 });
    } else {
      // Normal overwrite operation (called on every update)
      const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { items: items || [] },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, data: wishlist.items }, { status: 200 });
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

    await Wishlist.findOneAndDelete({ userId });
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
