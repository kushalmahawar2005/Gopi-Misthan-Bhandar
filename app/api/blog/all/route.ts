import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (page) {
      // Paginated response for admin dashboard
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10')));
      const skip = (pageNum - 1) * limitNum;

      const [blogs, totalBlogs] = await Promise.all([
        Blog.find(query)
          .select('title description imageUrl slug publishedDate order isActive')
          .sort({ order: 1, publishedDate: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Blog.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalBlogs / limitNum);

      return NextResponse.json({
        success: true,
        data: blogs,
        totalBlogs,
        totalPages,
        currentPage: pageNum,
      });
    }

    // Non-paginated response (for public blog listing)
    const blogs = await Blog.find(query)
      .select('title description imageUrl slug publishedDate order isActive')
      .sort({ order: 1, publishedDate: -1 })
      .lean();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

