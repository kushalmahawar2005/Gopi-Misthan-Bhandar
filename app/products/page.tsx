import ProductsClient from './products-client';
import connectDB from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import { buildProductSlug } from '@/lib/slug';
import { Product, Category } from '@/types';

export const revalidate = 60;

const CATEGORY_ALIASES: Record<string, string> = {
  'bakery-items': 'bakery',
};

const PAGE_LIMIT = 12;

const normalizeCategorySlug = (value: string | null | undefined): string => {
  if (!value) return 'all';
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return 'all';
  return CATEGORY_ALIASES[normalized] || normalized;
};

const toProduct = (product: any): Product => {
  const id = String(product._id);
  const normalizedSizes = Array.isArray(product.sizes)
    ? product.sizes
        .map((size: any) => {
          const weight = String(size?.weight || '').trim();
          const price = Number(size?.price);
          const label = size?.label ? String(size.label).trim() : undefined;
          if (!weight || !Number.isFinite(price)) return null;
          return { weight, price, ...(label ? { label } : {}) };
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

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

const VALID_SORTS: SortOption[] = ['default', 'price-low', 'price-high', 'name'];

interface ProductsPageProps {
  searchParams?: {
    category?: string;
    subcategory?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

async function getProductsData(searchParams: ProductsPageProps['searchParams']) {
  const categorySlug = normalizeCategorySlug(searchParams?.category);
  const subcategorySlug = (searchParams?.subcategory || 'all').trim().toLowerCase();
  const search = (searchParams?.search || '').trim();
  const rawSort = (searchParams?.sort || 'default') as SortOption;
  const sort: SortOption = VALID_SORTS.includes(rawSort) ? rawSort : 'default';
  const pageNum = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);

  try {
    await connectDB();

    const query: Record<string, any> = {};
    if (subcategorySlug && subcategorySlug !== 'all') {
      query.subcategory = subcategorySlug;
    } else if (categorySlug && categorySlug !== 'all') {
      query.category = categorySlug;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (pageNum - 1) * PAGE_LIMIT;

    const [productDocs, totalCount, categoryDocs] = await Promise.all([
      ProductModel.find(query)
        .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock giftBoxSubCategory giftBoxSize')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_LIMIT)
        .lean(),
      ProductModel.countDocuments(query),
      CategoryModel.find({})
        .select('name slug image description subCategories order')
        .sort({ order: 1, name: 1 })
        .lean(),
    ]);

    const products = productDocs.map(toProduct);
    const categories = categoryDocs.map(toCategory);

    const initialMaxPrice = products.length > 0
      ? Math.max(10000, Math.ceil(Math.max(...products.map((p) => p.price)) / 1000) * 1000)
      : 10000;

    return {
      initialProducts: products,
      initialCategories: categories,
      initialPagination: {
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / PAGE_LIMIT)),
        currentPage: pageNum,
      },
      initialMaxPrice,
      initialCategorySlug: categorySlug,
      initialSubCategorySlug: subcategorySlug,
      initialSearch: search,
      initialSort: sort,
    };
  } catch (error) {
    console.error('Error loading products page data:', error);
    return {
      initialProducts: [],
      initialCategories: [],
      initialPagination: { totalCount: 0, totalPages: 1, currentPage: pageNum },
      initialMaxPrice: 10000,
      initialCategorySlug: categorySlug,
      initialSubCategorySlug: subcategorySlug,
      initialSearch: search,
      initialSort: sort,
    };
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const data = await getProductsData(searchParams);
  return <ProductsClient {...data} />;
}
