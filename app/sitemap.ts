import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import CategoryModel from '@/models/Category';
import Blog from '@/models/Blog';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // ── Static Pages ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/wishlist`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/refund-cancellation`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  // ── Product Pages ──
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await Product.find({}, { _id: 1, updatedAt: 1 }).lean();
    productPages = products.map((product: any) => ({
      url: `${BASE_URL}/product/${product._id.toString()}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching products:', error);
  }

  // ── Category Pages ──
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await CategoryModel.find({}, { slug: 1, updatedAt: 1 }).lean();
    categoryPages = categories.map((category: any) => ({
      url: `${BASE_URL}/category/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching categories:', error);
  }

  // ── Blog Pages (if they have dedicated detail pages) ──
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await Blog.find({}, { _id: 1, updatedAt: 1 }).lean();
    blogPages = blogs.map((blog: any) => ({
      url: `${BASE_URL}/blog/${blog._id.toString()}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching blogs:', error);
  }

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
