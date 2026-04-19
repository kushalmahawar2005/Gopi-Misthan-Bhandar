import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { buildBlogSlug } from '@/lib/slug';

export const revalidate = 300;

async function getBlogs() {
  try {
    await connectDB();
    const blogs = await Blog.find({ isActive: true })
      .select('title description imageUrl slug publishedDate')
      .sort({ publishedDate: -1 })
      .lean();

    return blogs.map((blog: any) => ({
      ...blog,
      _id: String(blog._id),
      slug: blog.slug || buildBlogSlug(blog.title || 'blog', String(blog._id)),
    }));
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <section className="w-full px-4 pt-8 pb-4 md:pt-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-geom">Gopi Misthan Blog</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Festival guides, sweet stories, and traditional mithai insights from Neemuch.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12 md:pb-16">
        {blogs.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 rounded-xl bg-gray-50">
            <p className="text-gray-600">No blog posts are available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogs.map((blog) => (
              <article key={blog._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <Link href={`/blog/${blog.slug}`} className="block">
                  <div className="relative w-full h-56">
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-5 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {formatDate(blog.publishedDate)}
                  </p>
                  <h2 className="text-xl font-semibold text-primary-brown line-clamp-2">{blog.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-3">{blog.description}</p>
                  <Link href={`/blog/${blog.slug}`} className="inline-flex items-center text-primary-red font-medium hover:text-primary-darkRed">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
