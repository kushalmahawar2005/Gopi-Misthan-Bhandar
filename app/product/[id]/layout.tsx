import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { buildProductSlug, extractObjectIdFromSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

interface Props {
  params: Promise<{ id: string }>;
}

const findProductByIdentifier = async (identifier: string) => {
  const normalized = String(identifier || '').toLowerCase();
  const objectId = extractObjectIdFromSlug(normalized);

  if (objectId) {
    return Product.findOne({ $or: [{ _id: objectId }, { slug: normalized }] }).lean();
  }

  return Product.findOne({ slug: normalized }).lean();
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDB();
    const product = await findProductByIdentifier(id);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    const p = product as any;
    const productSlug = p.slug || buildProductSlug(p.name, String(p._id));
    const weight = p.defaultWeight ? ` (${p.defaultWeight})` : '';
    const title = `Buy ${p.name}${weight} Online — Fresh & Pan-India Delivery`;
    const description = p.description
      ? `${p.description.slice(0, 150)} — Order ${p.name} online from Gopi Misthan Bhandar Neemuch with pan-India delivery.`
      : `Buy ${p.name} online from Gopi Misthan Bhandar Neemuch. Handcrafted traditional Indian mithai, no preservatives, 60-day shelf life. Pan-India delivery.`;
    const productUrl = `${BASE_URL}/product/${productSlug}`;
    const rawImage = p.image || `${BASE_URL}/Hamper.jpg`;
    const productImage = rawImage.startsWith('http') ? rawImage : `${BASE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        url: productUrl,
        title: `${p.name} | Gopi Misthan Bhandar`,
        description,
        siteName: 'Gopi Misthan Bhandar',
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: p.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${p.name} - ₹${p.price}`,
        description,
        images: [productImage],
      },
      alternates: {
        canonical: productUrl,
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | Gopi Misthan Bhandar',
      description: 'Premium traditional Indian sweets from Neemuch.',
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let jsonLd = null;
  let breadcrumbLd = null;
  let faqLd = null;

  try {
    await connectDB();
    const product = (await findProductByIdentifier(id)) as any;

    if (product) {
      const productSlug = product.slug || buildProductSlug(product.name, String(product._id));
      const productUrl = `${BASE_URL}/product/${productSlug}`;

      const [reviewSummary, recentReviews] = await Promise.all([
        Review.aggregate([
          {
            $match: {
              productId: String(product._id),
              isApproved: true,
            },
          },
          {
            $group: {
              _id: '$productId',
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 },
            },
          },
        ]),
        Review.find({ productId: String(product._id), isApproved: true })
          .select('userName rating title comment createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      const aggregateRating = reviewSummary[0]
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(reviewSummary[0].averageRating.toFixed(1)),
            reviewCount: reviewSummary[0].reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : null;

      const reviewLd = (recentReviews || []).map((r: any) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.userName || 'Verified Buyer' },
        datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : undefined,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        ...(r.title ? { name: r.title } : {}),
        reviewBody: r.comment,
      }));

      // Product Schema (Google Rich Snippets)
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: String(product._id),
        image: product.image ? [product.image, ...(product.images || [])] : ['/logo.png'],
        description: product.description || `Buy ${product.name} from Gopi Misthan Bhandar`,
        brand: {
          '@type': 'Brand',
          name: 'Gopi Misthan Bhandar',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: product.price,
          availability: product.stock === undefined || product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Gopi Misthan Bhandar',
          },
        },
        category: product.category?.replace(/-/g, ' '),
        ...(aggregateRating && { aggregateRating }),
        ...(reviewLd.length > 0 && { review: reviewLd }),
        ...(product.shelfLife && { additionalProperty: { '@type': 'PropertyValue', name: 'Shelf Life', value: product.shelfLife } }),
      };

      // Breadcrumb Schema
      breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/products` },
          { '@type': 'ListItem', position: 3, name: product.category?.replace(/-/g, ' ') || 'Category', item: `${BASE_URL}/category/${product.category}` },
          { '@type': 'ListItem', position: 4, name: product.name, item: productUrl },
        ],
      };

      // FAQ Schema (AI citation + topic depth)
      const shelfLifeText = product.shelfLife
        ? `${product.shelfLife}. Store the pack airtight at room temperature. Once opened, transfer to an airtight jar and consume within 7-10 days for the best taste.`
        : 'Most of our mithai stays fresh for up to 60 days when sealed and stored at room temperature. Once opened, transfer to an airtight jar and consume within 7-10 days.';

      faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${product.name} fresh and how long does it last?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes — every order is handcrafted in our Neemuch kitchen and shipped within 24 hours. Shelf life: ${shelfLifeText}`,
            },
          },
          {
            '@type': 'Question',
            name: `Do you deliver ${product.name} pan-India?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. We ship ${product.name} to every PIN code in India through trusted cold-chain courier partners. Delivery typically takes 2-5 working days depending on the destination city.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is ${product.name} pure vegetarian and free from preservatives?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes — ${product.name} is 100% pure vegetarian. No artificial preservatives, no synthetic colours, no palm oil. Made with farm-fresh milk, pure ghee, sugar and premium dry fruits.`,
            },
          },
          {
            '@type': 'Question',
            name: `Can I order ${product.name} for Diwali, Rakhi, or wedding gifting in bulk?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Absolutely. We offer custom hampers and bulk pricing for Diwali, Rakhi, weddings and corporate gifting. WhatsApp +91-9425922445 with your quantity and delivery date and our team will design a hamper within 24 hours.`,
            },
          },
        ],
      };
    }
  } catch (error) {
    console.error('Error generating product JSON-LD:', error);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {children}
    </>
  );
}
