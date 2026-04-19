import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Secure checkout for your Gopi Misthan Bhandar order.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
