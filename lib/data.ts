import { Product, Category, InstagramPost } from '@/types';

// Placeholder image URLs using Unsplash and Picsum
const getPlaceholderImage = (id: number, width: number = 400, height: number = 400) => {
  // Using Picsum Photos for variety - each ID gives a different image
  return `https://picsum.photos/seed/sweets${id}/${width}/${height}`;
};

// Placeholder data - will be replaced with actual data later
export const categories: Category[] = [
  { id: '1', name: 'SWEETS', slug: 'sweets', image: getPlaceholderImage(1, 380, 500) },
  { id: '2', name: 'SNACKS', slug: 'snacks', image: getPlaceholderImage(2, 380, 500) },
  { id: '3', name: 'NAMKEEN', slug: 'namkeen', image: getPlaceholderImage(3, 380, 500) },
];

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'ASSORTED LADDOOS BOX',
    description: 'Product Description',
    price: 775,
    image: getPlaceholderImage(10, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '2',
    name: 'ARTISANAL GOURMET LADDOO IN TREE BOX',
    description: 'Product Description',
    price: 1349,
    image: getPlaceholderImage(11, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '3',
    name: 'SUPREME BAKLAVA BOX',
    description: 'Product Description',
    price: 925,
    image: getPlaceholderImage(12, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '4',
    name: 'ALL TIME FAVOURITE MITHAI BOX',
    description: 'Product Description',
    price: 745,
    image: getPlaceholderImage(13, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '5',
    name: 'PREMIUM GULAB JAMUN BOX',
    description: 'Product Description',
    price: 850,
    image: getPlaceholderImage(14, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '6',
    name: 'TRADITIONAL BARFI COLLECTION',
    description: 'Product Description',
    price: 680,
    image: getPlaceholderImage(15, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '7',
    name: 'DRY FRUIT DELIGHT BOX',
    description: 'Product Description',
    price: 1200,
    image: getPlaceholderImage(16, 306, 309),
    category: 'sweets',
    featured: true,
  },
  {
    id: '8',
    name: 'FESTIVAL SPECIAL SWEET BOX',
    description: 'Product Description',
    price: 995,
    image: getPlaceholderImage(17, 306, 309),
    category: 'sweets',
    featured: true,
  },
];

export const instagramPosts: InstagramPost[] = [
  { id: '1', image: getPlaceholderImage(20, 200, 360), label: 'Our Store' },
  { id: '2', image: getPlaceholderImage(21, 200, 360), label: 'Hampers' },
  { id: '3', image: getPlaceholderImage(22, 200, 360), label: 'Gifting', isVideo: true },
  { id: '4', image: getPlaceholderImage(23, 200, 360), label: 'Milk Cake' },
  { id: '5', image: getPlaceholderImage(24, 200, 360), label: 'Dry Fruits' },
];
