import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import { buildBlogSlug, buildProductSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';
const GIFTBOX_CATEGORIES = ['assorted', 'dry-fruit', 'souvenir'];

const getStaticPages = (): MetadataRoute.Sitemap => {
  const now = new Date();

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/refund-cancellation`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ...GIFTBOX_CATEGORIES.map((category) => ({
      url: `${BASE_URL}/giftbox/${category}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
};

const getProductPages = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    const products = await Product.find({}, { _id: 1, name: 1, slug: 1, updatedAt: 1 }).lean();

    return products.map((product: any) => ({
      url: `${BASE_URL}/product/${product.slug || buildProductSlug(product.name || 'product', String(product._id))}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching products:', error);
    return [];
  }
};

const getBlogPages = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    const blogs = await Blog.find({}, { _id: 1, title: 1, slug: 1, updatedAt: 1 }).lean();

    return blogs.map((blog: any) => ({
      url: `${BASE_URL}/blog/${blog.slug || buildBlogSlug(blog.title || 'blog', String(blog._id))}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching blogs:', error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = getStaticPages();

  try {
    await connectDB();
  } catch (error) {
    console.error('Sitemap: MongoDB unavailable, serving static sitemap only:', error);
    return staticPages;
  }

  const [productPages, blogPages] = await Promise.all([
    getProductPages(),
    getBlogPages(),
  ]);

  return [...staticPages, ...productPages, ...blogPages];
}
