import { Metadata } from 'next';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Read stories, festive guides, and sweet traditions from Gopi Misthan Bhandar Neemuch.',
  openGraph: {
    title: 'Blog | Gopi Misthan Bhandar',
    description:
      'Read stories, festive guides, and sweet traditions from Gopi Misthan Bhandar Neemuch.',
    url: `${BASE_URL}/blog`,
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Gopi Misthan Bhandar Blog' }],
  },
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '' }, { name: 'Blog', path: '/blog' }]} />
      {children}
    </>
  );
}
