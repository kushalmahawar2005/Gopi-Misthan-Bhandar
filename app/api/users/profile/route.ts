import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getRequestAuth } from '@/lib/auth';

interface ProfileAuthResult {
  id: string;
  email?: string;
  role?: string;
  isAdmin: boolean;
}

function normalizeAddressType(value: any): 'home' | 'work' | 'other' {
  if (value === 'work' || value === 'other') {
    return value;
  }
  return 'home';
}

function normalizeAddresses(addresses: any[]): any[] {
  return addresses
    .map((address) => ({
      type: normalizeAddressType(address?.type),
      street: String(address?.street || '').trim(),
      city: String(address?.city || '').trim(),
      state: String(address?.state || '').trim(),
    }))
    .filter((address) => address.street || address.city || address.state)
    .map((address) => {
      if (!address.street || !address.city || !address.state) {
        return null;
      }
      return address;
    })
    .filter(Boolean) as any[];
}

async function getProfileAuth(request: NextRequest): Promise<ProfileAuthResult | null> {
  const auth = await getRequestAuth(request);
  if (auth.isAuthenticated && auth.user?.id) {
    return {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.user.role,
      isAdmin: auth.isAdmin,
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getProfileAuth(request);
    if (!auth?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.id).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getProfileAuth(request);
    if (!auth?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const updateData: any = {};

    if (auth.isAdmin) {
      const { _id, password, ...rest } = body;
      Object.assign(updateData, rest);

      const adminUser = await User.findByIdAndUpdate(auth.id, updateData, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!adminUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      if (password) {
        adminUser.password = password;
        await adminUser.save();
      }

      return NextResponse.json({ success: true, data: adminUser }, { status: 200 });
    }

    if (body.name !== undefined) {
      updateData.name = String(body.name || '').trim();
    }

    if (body.phone !== undefined) {
      updateData.phone = String(body.phone || '').trim();
    }

    if (Array.isArray(body.addresses)) {
      updateData.addresses = normalizeAddresses(body.addresses);
    } else {
      const hasLegacyAddressFields =
        body.address !== undefined ||
        body.city !== undefined ||
        body.state !== undefined;

      if (hasLegacyAddressFields) {
        const street = String(body.address || '').trim();
        const city = String(body.city || '').trim();
        const state = String(body.state || '').trim();

        if (street || city || state) {
          if (!street || !city || !state) {
            return NextResponse.json(
              { success: false, error: 'Address, city, and state are required to save address' },
              { status: 400 }
            );
          }

          updateData.addresses = [
            {
              type: 'home',
              street,
              city,
              state,
            },
          ];
        } else {
          updateData.addresses = [];
        }
      }
    }

    const user = await User.findByIdAndUpdate(auth.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
