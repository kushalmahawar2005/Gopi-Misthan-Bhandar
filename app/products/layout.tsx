import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Shop All Products - Sweets, Namkeen & Gift Boxes',
  description: 'Browse our complete collection of traditional Indian sweets, premium namkeen, dry fruit boxes, and festive gift hampers. Filter by category, price & more. Pan-India delivery from Neemuch.',
  keywords: ['buy sweets online', 'Indian mithai shop', 'namkeen online', 'gift boxes', 'Gopi Misthan Bhandar products', 'Neemuch sweets'],
  openGraph: {
    title: 'Shop All Products | Gopi Misthan Bhandar',
    description: 'Browse our complete collection of traditional Indian sweets, namkeen & gift hampers.',
    url: `${BASE_URL}/products`,
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Gopi Misthan Bhandar' }],
  },
  alternates: {
    canonical: `${BASE_URL}/products`,
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
