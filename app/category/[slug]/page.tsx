import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProductCard from '@/components/ProductCard';
import { buildProductSlug } from '@/lib/slug';
import { getCategorySEO, resolveCategorySlug } from '@/lib/categoryContent';
import { Product } from '@/types';

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

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

interface Props {
  params: { slug: string };
}

async function getCategoryProducts(canonicalSlug: string) {
  await connectDB();

  const categoryDoc: any = await CategoryModel.findOne({ slug: canonicalSlug }).lean();
  const subSlugs = categoryDoc?.subCategories?.map((s: any) => s?.slug).filter(Boolean) || [];
  const matchSlugs = [canonicalSlug, ...subSlugs];

  const productDocs = await ProductModel.find({
    isActive: { $ne: false },
    $or: [
      { category: { $in: matchSlugs } },
      { subcategory: { $in: matchSlugs } },
    ],
  })
    .select('name slug description price image images category subcategory featured isPremium isClassic sizes defaultWeight shelfLife deliveryTime stock giftBoxSubCategory giftBoxSize')
    .sort({ featured: -1, createdAt: -1 })
    .limit(48)
    .lean();

  return {
    products: productDocs.map(toProduct),
    subCategories: (categoryDoc?.subCategories || []).map((s: any) => ({
      name: String(s?.name || ''),
      slug: String(s?.slug || ''),
    })),
    categoryName: categoryDoc?.name || canonicalSlug,
  };
}

export default async function CategoryPage({ params }: Props) {
  const canonical = resolveCategorySlug(params.slug);
  const seo = canonical ? getCategorySEO(canonical) : null;

  if (!canonical || !seo) {
    notFound();
  }

  const { products, subCategories, categoryName } = await getCategoryProducts(canonical);

  const url = `${BASE_URL}/category/${seo.slug}`;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seo.title,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${BASE_URL}/product/${p.slug || p.id}`,
      name: p.name,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: categoryName, item: url },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 py-3 px-4" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-[#FE8E02]">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-gray-600 hover:text-[#FE8E02]">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#fff7eb] via-white to-[#fff1d8] px-4 py-10 md:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b58a3a] mb-3">
              Category · Since 1968
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-[#1f1a17] leading-tight mb-5">
              {seo.h1}
            </h1>
            <p className="text-base md:text-lg text-[#5e4a3b] leading-relaxed mb-6">
              {seo.intro}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {seo.popular.map((p) => (
                <span key={p} className="px-3 py-1.5 bg-white border border-[#ead8c3] rounded-full text-xs font-semibold text-[#5e4a3b]">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#products" className="bg-[#FE8E02] hover:bg-[#e07e00] text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition">
                Shop {categoryName}
              </Link>
              <Link href="/products" className="border border-[#1f1a17] text-[#1f1a17] hover:bg-[#1f1a17] hover:text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition">
                View Full Catalog
              </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-white">
            <Image
              src={seo.ogImage}
              alt={seo.h1}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-4 py-10 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f1a17] mb-6">Why shop {categoryName} from Gopi Misthan Bhandar</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {seo.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 p-4 rounded-xl border border-[#f0e5d8] bg-[#fffbf5]">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#FE8E02] flex-shrink-0" />
                <span className="text-sm text-[#3f3228]">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Subcategory pills */}
      {subCategories.length > 0 && (
        <section className="px-4 pb-2">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
            <Link
              href={`/products?category=${seo.slug}`}
              className="px-5 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold uppercase text-gray-600 hover:border-[#FE8E02] hover:text-[#FE8E02]"
            >
              All {categoryName}
            </Link>
            {subCategories.map((sub: { name: string; slug: string }) => (
              <Link
                key={sub.slug}
                href={`/products?category=${seo.slug}&subcategory=${sub.slug}`}
                className="px-5 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold uppercase text-gray-600 hover:border-[#FE8E02] hover:text-[#FE8E02]"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products grid */}
      <section id="products" className="px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1f1a17]">
                Shop {categoryName} ({products.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">Fresh, handcrafted, shipped pan-India.</p>
            </div>
            <Link href="/products" className="hidden sm:inline text-sm font-bold text-[#FE8E02] hover:underline">
              View all products →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl text-gray-400 font-bold uppercase tracking-widest">
              Coming soon — check back shortly
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Long-form SEO copy */}
      <section className="px-4 py-10 md:py-12 bg-[#fffbf5]">
        <div className="max-w-4xl mx-auto prose prose-stone">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f1a17] mb-5">About our {categoryName}</h2>
          {seo.longCopy.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-[#3f3228] mb-4">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-10 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f1a17] mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {seo.faqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-[#eadfce] bg-white p-5 group">
                <summary className="cursor-pointer font-semibold text-[#1f1a17] list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="text-[#FE8E02] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-[#5e4a3b] leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
