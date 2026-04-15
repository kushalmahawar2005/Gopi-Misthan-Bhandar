import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    const p = product as any;
    const title = `${p.name} - Buy Online`;
    const description = p.description
      ? `${p.description.slice(0, 155)}...`
      : `Buy ${p.name} online from Gopi Misthan Bhandar Neemuch. Premium traditional Indian sweets with pan-India delivery.`;
    const productUrl = `${BASE_URL}/product/${id}`;
    const productImage = p.image || '/logo.png';

    return {
      title,
      description,
      keywords: [
        p.name,
        p.category?.replace(/-/g, ' '),
        'Indian sweets',
        'buy online',
        'Gopi Misthan Bhandar',
        'Neemuch',
        'traditional sweets',
        p.defaultWeight,
      ].filter(Boolean),
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

  try {
    await connectDB();
    const product = await Product.findById(id).lean() as any;

    if (product) {
      // Product Schema (Google Rich Snippets)
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image ? [product.image, ...(product.images || [])] : ['/logo.png'],
        description: product.description || `Buy ${product.name} from Gopi Misthan Bhandar`,
        brand: {
          '@type': 'Brand',
          name: 'Gopi Misthan Bhandar',
        },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/product/${id}`,
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
        ...(product.shelfLife && { additionalProperty: { '@type': 'PropertyValue', name: 'Shelf Life', value: product.shelfLife } }),
      };

      // Breadcrumb Schema
      breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/products` },
          { '@type': 'ListItem', position: 3, name: product.category?.replace(/-/g, ' ') || 'Category', item: `${BASE_URL}/products?category=${product.category}` },
          { '@type': 'ListItem', position: 4, name: product.name, item: `${BASE_URL}/product/${id}` },
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
      {children}
    </>
  );
}
