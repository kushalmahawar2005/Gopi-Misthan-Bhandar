import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import CategoryModel from '@/models/Category';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    await connectDB();
    const category = await CategoryModel.findOne({ slug }).lean();

    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The category you are looking for does not exist.',
      };
    }

    const c = category as any;
    const prettyName = c.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const title = `${prettyName} - Shop Online`;
    const description = c.description
      ? `${c.description.slice(0, 155)}`
      : `Browse our collection of ${prettyName} online at Gopi Misthan Bhandar. Traditional Indian sweets & snacks from Neemuch with pan-India delivery.`;
    const categoryUrl = `${BASE_URL}/category/${slug}`;
    const categoryImage = c.image || '/logo.png';

    return {
      title,
      description,
      keywords: [
        prettyName,
        'Indian sweets',
        'buy online',
        'Gopi Misthan Bhandar',
        'Neemuch',
        slug.replace(/-/g, ' '),
      ],
      openGraph: {
        type: 'website',
        url: categoryUrl,
        title: `${prettyName} | Gopi Misthan Bhandar`,
        description,
        siteName: 'Gopi Misthan Bhandar',
        images: [
          {
            url: categoryImage,
            width: 800,
            height: 600,
            alt: prettyName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${prettyName} | Gopi Misthan Bhandar`,
        description,
        images: [categoryImage],
      },
      alternates: {
        canonical: categoryUrl,
      },
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Shop | Gopi Misthan Bhandar',
      description: 'Browse our collection of traditional Indian sweets from Neemuch.',
    };
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
