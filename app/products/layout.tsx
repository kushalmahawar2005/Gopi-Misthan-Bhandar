import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Buy Indian Sweets Online — Mithai, Namkeen & Gift Boxes',
  description: 'Shop 200+ traditional Indian sweets, premium mithai, namkeen, dry fruit gift boxes & festive hampers online. Kaju Katli, Soan Papdi, Motichoor Ladoo, Milk Cake & more — pan-India delivery from Neemuch since 1968.',
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
