import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { buildBlogSlug, extractObjectIdFromSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

interface Props {
  params: Promise<{ slug: string }>;
}

const findBlogBySlug = async (slugOrId: string) => {
  const normalized = String(slugOrId || '').toLowerCase();
  const objectId = extractObjectIdFromSlug(normalized);

  if (objectId) {
    return Blog.findOne({ $or: [{ _id: objectId }, { slug: normalized }] }).lean();
  }

  return Blog.findOne({ slug: normalized }).lean();
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    await connectDB();
    const blog = (await findBlogBySlug(slug)) as any;

    if (!blog) {
      return {
        title: 'Blog Not Found',
        description: 'The blog post you are looking for does not exist.',
      };
    }

    const blogSlug = blog.slug || buildBlogSlug(blog.title || 'blog', String(blog._id));
    const blogUrl = `${BASE_URL}/blog/${blogSlug}`;

    return {
      title: blog.title,
      description: blog.description || `Read ${blog.title} on Gopi Misthan Bhandar Blog.`,
      openGraph: {
        type: 'article',
        url: blogUrl,
        title: blog.title,
        description: blog.description,
        images: blog.imageUrl
          ? [{ url: blog.imageUrl, width: 1200, height: 630, alt: blog.title }]
          : [{ url: '/logo.png', width: 512, height: 512, alt: 'Gopi Misthan Bhandar' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.description,
        images: blog.imageUrl ? [blog.imageUrl] : ['/logo.png'],
      },
      alternates: {
        canonical: blogUrl,
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog | Gopi Misthan Bhandar',
      description: 'Read stories and updates from Gopi Misthan Bhandar.',
    };
  }
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let articleJsonLd: Record<string, any> | null = null;

  try {
    await connectDB();
    const blog = (await findBlogBySlug(slug)) as any;

    if (blog) {
      const blogSlug = blog.slug || buildBlogSlug(blog.title || 'blog', String(blog._id));

      articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.title,
        description: blog.description,
        image: blog.imageUrl ? [blog.imageUrl] : [`${BASE_URL}/logo.png`],
        datePublished: blog.publishedDate || blog.createdAt,
        dateModified: blog.updatedAt || blog.publishedDate || blog.createdAt,
        mainEntityOfPage: `${BASE_URL}/blog/${blogSlug}`,
        author: {
          '@type': 'Organization',
          name: 'Gopi Misthan Bhandar',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Gopi Misthan Bhandar',
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/logo.png`,
          },
        },
      };
    }
  } catch (error) {
    console.error('Error generating blog JSON-LD:', error);
  }

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
