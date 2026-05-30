import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategorySEO } from '@/lib/categoryContent';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seo = getCategorySEO(params.slug);
  if (!seo) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}/category/${seo.slug}`;
  const ogImage = `${BASE_URL}${seo.ogImage}`;

  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      type: 'website',
      url,
      title: seo.title,
      description: seo.description,
      siteName: 'Gopi Misthan Bhandar',
      images: [{ url: ogImage, width: 1200, height: 630, alt: seo.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  if (!getCategorySEO(params.slug)) {
    notFound();
  }
  return <>{children}</>;
}
