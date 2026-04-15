import { Metadata } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Privacy Policy of Gopi Misthan Bhandar. Learn how we collect, use, and protect your personal information when you shop on our website.',
  alternates: { canonical: `${BASE_URL}/privacy` },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
