import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { extractObjectIdFromSlug } from '@/lib/slug';

export const revalidate = 300;

const findBlogBySlug = async (slugOrId: string) => {
  const normalized = String(slugOrId || '').toLowerCase();
  const objectId = extractObjectIdFromSlug(normalized);

  if (objectId) {
    return Blog.findOne({ $or: [{ _id: objectId }, { slug: normalized }] }).lean();
  }

  return Blog.findOne({ slug: normalized }).lean();
};

function formatDate(dateString?: string) {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();
  const blog = (await findBlogBySlug(slug)) as any;

  if (!blog || blog.isActive === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-red">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary-red">Blog</Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{blog.title}</span>
        </nav>

        <header className="space-y-3 mb-6 md:mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500">{formatDate(blog.publishedDate)}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-geom leading-tight">
            {blog.title}
          </h1>
          <p className="text-base text-gray-600">{blog.description}</p>
        </header>

        <div className="relative w-full h-[260px] sm:h-[360px] md:h-[440px] rounded-xl overflow-hidden mb-8 border border-gray-200">
          <Image
            src={blog.imageUrl}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>

        <div className="prose prose-neutral max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
          {blog.content && blog.content.trim().length > 0 ? blog.content : blog.description}
        </div>
      </article>

      <Footer />
    </div>
  );
}
