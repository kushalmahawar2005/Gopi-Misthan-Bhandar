import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the Terms & Conditions of Gopi Misthan Bhandar. By using our website and placing orders, you agree to these terms governing purchases, delivery, and usage.',
  alternates: { canonical: `${BASE_URL}/terms` },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
