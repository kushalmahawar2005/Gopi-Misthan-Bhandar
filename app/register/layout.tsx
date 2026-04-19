import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Gopi Misthan Bhandar account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
