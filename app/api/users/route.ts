import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET all users
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (page) {
      // Paginated response for admin dashboard
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10')));
      const skip = (pageNum - 1) * limitNum;

      const [users, totalUsers] = await Promise.all([
        User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        User.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalUsers / limitNum);

      return NextResponse.json({
        success: true,
        data: users,
        totalUsers,
        totalPages,
        currentPage: pageNum,
      }, { status: 200 });
    }

    // Non-paginated response
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

