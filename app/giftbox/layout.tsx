import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Gift Boxes - Premium Dry Fruit & Sweet Hampers',
  description: 'Order premium gift boxes from Gopi Misthan Bhandar — assorted sweet boxes, dry fruit hampers, and souvenir packs. Perfect for Diwali, weddings, Rakhi & corporate gifting. Pan-India delivery.',
  keywords: ['gift boxes', 'sweet hampers', 'dry fruit boxes', 'Diwali gifts', 'wedding sweets gift', 'corporate gifting India'],
  openGraph: {
    title: 'Gift Boxes | Gopi Misthan Bhandar',
    description: 'Premium sweet boxes, dry fruit hampers & souvenir packs for every occasion.',
    url: `${BASE_URL}/giftbox`,
  },
  alternates: { canonical: `${BASE_URL}/giftbox` },
};

export default function GiftboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
