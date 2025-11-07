import { Product, Category, InstagramPost } from '@/types';

// Placeholder data - will be replaced with actual data later
export const categories: Category[] = [
  { id: '1', name: 'SWEETS', slug: 'sweets' },
  { id: '2', name: 'SNACKS', slug: 'snacks' },
  { id: '3', name: 'NAMKEEN', slug: 'namkeen' },
];

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Product Name',
    description: 'Product Description',
    price: 0,
    image: '',
    category: 'sweets',
    featured: true,
  },
  // Add more products as needed
];

export const instagramPosts: InstagramPost[] = [
  { id: '1', image: '', label: 'Our Store' },
  { id: '2', image: '', label: 'Hampers' },
  { id: '3', image: '', label: 'Gifting', isVideo: true },
  { id: '4', image: '', label: 'Milk Cake' },
  { id: '5', image: '', label: 'Dry Fruits' },
];
