import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Photo Gallery - Our Shop, Sweets & Events',
  description: 'Explore the Gopi Misthan Bhandar gallery — photos of our traditional sweet shop in Neemuch, handcrafted sweets, festive displays, and celebrations since 1968.',
  openGraph: {
    title: 'Photo Gallery | Gopi Misthan Bhandar',
    description: 'Photos of our traditional sweet shop, handcrafted sweets & festive displays.',
    url: `${BASE_URL}/gallery`,
  },
  alternates: { canonical: `${BASE_URL}/gallery` },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
