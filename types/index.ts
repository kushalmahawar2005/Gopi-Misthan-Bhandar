export interface ProductSize {
  weight: string;
  price: number;
  label?: string; // Optional label like "Small", "Medium", "Large"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'sweets' | 'classic-sweets' | 'premium-sweets' | 'snacks' | 'namkeen' | 'dry-fruit' | 'gifting';
  featured?: boolean;
  sizes?: ProductSize[]; // Array of available sizes/weights
  defaultWeight?: string; // Default weight display
  shelfLife?: string;
  deliveryTime?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  label: string;
  isVideo?: boolean;
  isInstagramReel?: boolean;
  overlayText?: string;
}
