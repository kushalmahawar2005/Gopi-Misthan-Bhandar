import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

const OG_IMAGE: Record<string, string> = {
  'assorted': '/Hamper.jpg',
  'dry-fruit': '/box-large.jpg',
  'souvenir': '/box-small1.jpg',
};

const OG_ALT: Record<string, string> = {
  'assorted': 'Assorted sweet gift box from Gopi Misthan Bhandar',
  'dry-fruit': 'Premium dry fruit gift hamper from Gopi Misthan Bhandar',
  'souvenir': 'Souvenir mithai gift box from Gopi Misthan Bhandar',
};

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const image = OG_IMAGE[category] || '/Hamper.jpg';
  const alt = OG_ALT[category] || 'Gopi Misthan Bhandar gift box';
  const absoluteImage = `${BASE_URL}${image}`;

  return {
    openGraph: {
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [absoluteImage],
    },
  };
}

export default function GiftBoxCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
