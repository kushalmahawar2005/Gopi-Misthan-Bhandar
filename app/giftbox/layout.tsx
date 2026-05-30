import { Metadata } from 'next';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Gift Boxes - Premium Dry Fruit & Sweet Hampers',
  description: 'Order premium gift boxes from Gopi Misthan Bhandar — assorted sweet boxes, dry fruit hampers, and souvenir packs. Perfect for Diwali, weddings, Rakhi & corporate gifting. Pan-India delivery.',
  openGraph: {
    title: 'Gift Boxes | Gopi Misthan Bhandar',
    description: 'Premium sweet boxes, dry fruit hampers & souvenir packs for every occasion.',
    url: `${BASE_URL}/giftbox`,
    images: [
      {
        url: `${BASE_URL}/Hamper.jpg`,
        width: 1200,
        height: 630,
        alt: 'Gopi Misthan Bhandar premium gift hampers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Gift Boxes | Gopi Misthan Bhandar',
    description: 'Sweet boxes, dry fruit hampers & souvenir packs for every occasion.',
    images: [`${BASE_URL}/Hamper.jpg`],
  },
  alternates: { canonical: `${BASE_URL}/giftbox` },
};

export default function GiftboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '' }, { name: 'Gift Boxes', path: '/giftbox' }]} />
      {children}
    </>
  );
}
