import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Read the Refund and Cancellation Policy of Gopi Misthan Bhandar. Learn about our return policy for perishable food items, cancellation window, and refund process.',
  alternates: { canonical: `${BASE_URL}/refund-cancellation` },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
