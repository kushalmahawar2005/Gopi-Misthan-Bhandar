import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { buildProductSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const absolutize = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export async function GET() {
  let entries = '';

  try {
    await connectDB();
    const products: any[] = await Product.find({}, { _id: 1, name: 1, slug: 1, image: 1, images: 1, description: 1 }).lean();

    entries = products
      .map((product) => {
        const productSlug = product.slug || buildProductSlug(product.name || 'product', String(product._id));
        const productUrl = `${BASE_URL}/product/${productSlug}`;
        const allImages = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
          .filter((url) => typeof url === 'string' && url.trim().length > 0)
          .map(absolutize);

        if (allImages.length === 0) return '';

        const imageNodes = allImages
          .slice(0, 10)
          .map((imgUrl) => {
            const caption = escapeXml(`${product.name} — Gopi Misthan Bhandar`);
            return `    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(product.name || 'Product')}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>`;
          })
          .join('\n');

        return `  <url>
    <loc>${escapeXml(productUrl)}</loc>
${imageNodes}
  </url>`;
      })
      .filter(Boolean)
      .join('\n');
  } catch (error) {
    console.error('image sitemap error:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
