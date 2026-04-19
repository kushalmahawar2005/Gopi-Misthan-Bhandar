import HomeClient from './home-client';
import connectDB from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import InstaBookModel from '@/models/InstaBook';
import GalleryModel from '@/models/Gallery';
import BlogModel from '@/models/Blog';
import { buildBlogSlug, buildProductSlug } from '@/lib/slug';
import { Product, Category, InstagramPost } from '@/types';

export const revalidate = 300;

type HomeData = {
  featuredProducts: Product[];
  classicProducts: Product[];
  premiumProducts: Product[];
  categories: Category[];
  instaBooks: InstagramPost[];
  galleryItems: Array<{
    _id: string;
    imageUrl: string;
    title: string;
    description: string;
    order: number;
    isActive: boolean;
  }>;
  blogs: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    publishedDate: string;
    order: number;
    isActive: boolean;
  }>;
};

const toProduct = (product: any): Product => {
  const id = String(product._id);
  const normalizedSizes = Array.isArray(product.sizes)
    ? product.sizes
        .map((size: any) => {
          const weight = String(size?.weight || '').trim();
          const price = Number(size?.price);
          const label = size?.label ? String(size.label).trim() : undefined;

          if (!weight || !Number.isFinite(price)) {
            return null;
          }

          return {
            weight,
            price,
            ...(label ? { label } : {}),
          };
        })
        .filter(Boolean)
    : [];

  return {
    id,
    slug: product.slug || buildProductSlug(product.name, id),
    name: product.name,
    description: product.description || '',
    price: Number(product.price) || 0,
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category,
    subcategory: product.subcategory,
    featured: Boolean(product.featured),
    isPremium: Boolean(product.isPremium),
    isClassic: Boolean(product.isClassic),
    sizes: normalizedSizes,
    defaultWeight: product.defaultWeight,
    shelfLife: product.shelfLife,
    deliveryTime: product.deliveryTime,
    stock: typeof product.stock === 'number' ? product.stock : 0,
    giftBoxSubCategory: product.giftBoxSubCategory,
    giftBoxSize: product.giftBoxSize,
  };
};

const toCategory = (category: any): Category => ({
  id: String(category._id),
  name: category.name,
  slug: category.slug,
  image: category.image,
  description: category.description,
  subCategories: Array.isArray(category.subCategories)
    ? category.subCategories
        .map((sub: any) => ({
          name: String(sub?.name || '').trim(),
          slug: String(sub?.slug || '').trim(),
          image: sub?.image ? String(sub.image) : undefined,
          description: sub?.description ? String(sub.description) : undefined,
        }))
        .filter((sub: any) => Boolean(sub.name) && Boolean(sub.slug))
    : [],
  order: category.order || 0,
});

const toInstaBook = (item: any): InstagramPost => ({
  id: String(item._id),
  videoUrl: item.videoUrl || '',
  label: item.label,
  isVideo: true,
  isInstagramReel: Boolean(item.isInstagramReel),
  overlayText: item.overlayText || '',
});

const toGalleryItem = (item: any) => ({
  _id: String(item._id),
  imageUrl: String(item.imageUrl || ''),
  title: String(item.title || ''),
  description: String(item.description || ''),
  order: Number(item.order) || 0,
  isActive: Boolean(item.isActive),
});

const toBlogItem = (blog: any) => {
  const id = String(blog._id);

  return {
    _id: id,
    title: String(blog.title || ''),
    description: String(blog.description || ''),
    imageUrl: String(blog.imageUrl || ''),
    slug: String(blog.slug || buildBlogSlug(blog.title || 'blog', id)),
    publishedDate: blog.publishedDate
      ? new Date(blog.publishedDate).toISOString()
      : new Date().toISOString(),
    order: Number(blog.order) || 0,
    isActive: Boolean(blog.isActive),
  };
};

async function getHomeData(): Promise<HomeData> {
  try {
    await connectDB();

    const [
      featuredDocs,
      categoriesDocs,
      classicDocs,
      premiumDocs,
      allDocs,
      instaBookDocs,
      galleryDocs,
      blogDocs,
    ] = await Promise.all([
      ProductModel.find({ featured: true })
        .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock giftBoxSubCategory giftBoxSize')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      CategoryModel.find({})
        .select('name slug image description subCategories order')
        .sort({ order: 1, name: 1 })
        .lean(),
      ProductModel.find({ isClassic: true })
        .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock giftBoxSubCategory giftBoxSize')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      ProductModel.find({ isPremium: true })
        .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock giftBoxSubCategory giftBoxSize')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      ProductModel.find({})
        .select('name slug category subcategory')
        .limit(300)
        .lean(),
      InstaBookModel.find({ isActive: true })
        .select('label videoUrl isInstagramReel overlayText order isActive')
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      GalleryModel.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      BlogModel.find({ isActive: true })
        .select('title description imageUrl slug publishedDate order isActive')
        .sort({ order: 1, publishedDate: -1 })
        .limit(3)
        .lean(),
    ]);

    const featuredProducts = featuredDocs.map(toProduct);
    const classicFlagged = classicDocs.map(toProduct);
    const premiumFlagged = premiumDocs.map(toProduct);
    const categoriesData = categoriesDocs.map(toCategory);

    const categoriesWithCounts = categoriesData.map((category) => {
      const subCategorySlugs = category.subCategories?.map((sub) => sub.slug) || [];
      const relevantSlugs = [category.slug, ...subCategorySlugs];

      const count = allDocs.filter((product: any) =>
        relevantSlugs.includes(product.category) ||
        (product.subcategory && relevantSlugs.includes(product.subcategory))
      ).length;

      return {
        ...category,
        productsCount: count,
      };
    });

    const sweetsCategory = categoriesWithCounts.find((c) => c.slug === 'sweets');
    const defaultSweetsSubs = ['classic-sweets', 'premium-sweets'];
    const sweetsSlugs = sweetsCategory
      ? Array.from(
          new Set([
            sweetsCategory.slug,
            ...(sweetsCategory.subCategories?.map((s) => s.slug) || []),
            ...defaultSweetsSubs,
          ])
        )
      : ['sweets', ...defaultSweetsSubs];

    const isSweetCategory = (slug: string | undefined) => !!slug && /sweet/i.test(slug);

    let classicFiltered = classicFlagged.filter(
      (p) =>
        sweetsSlugs.includes(p.category) ||
        (p.subcategory && sweetsSlugs.includes(p.subcategory)) ||
        isSweetCategory(p.category) ||
        isSweetCategory(p.subcategory)
    );

    if (classicFiltered.length === 0) {
      classicFiltered = classicFlagged;
    }

    let premiumFiltered = premiumFlagged.filter(
      (p) =>
        sweetsSlugs.includes(p.category) ||
        (p.subcategory && sweetsSlugs.includes(p.subcategory)) ||
        isSweetCategory(p.category) ||
        isSweetCategory(p.subcategory)
    );

    if (premiumFiltered.length === 0) {
      premiumFiltered = premiumFlagged;
    }

    return {
      featuredProducts,
      classicProducts: classicFiltered.slice(0, 8),
      premiumProducts: premiumFiltered.slice(0, 8),
      categories: categoriesWithCounts,
      instaBooks: instaBookDocs.map(toInstaBook),
      galleryItems: galleryDocs.map(toGalleryItem),
      blogs: blogDocs.map(toBlogItem),
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);

    return {
      featuredProducts: [],
      classicProducts: [],
      premiumProducts: [],
      categories: [],
      instaBooks: [],
      galleryItems: [],
      blogs: [],
    };
  }
}

export default async function HomePage() {
  const homeData = await getHomeData();
  return <HomeClient {...homeData} />;
}
