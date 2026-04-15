import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'My Wishlist - Saved Products',
  description: 'View and manage your wishlist at Gopi Misthan Bhandar. Save your favourite sweets, namkeen, and gift boxes for later.',
  robots: { index: false, follow: true }, // Private page, no SEO indexing
  alternates: { canonical: `${BASE_URL}/wishlist` },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
