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
  image: string; // Main image (for backward compatibility)
  images?: string[]; // Multiple images array
  category: string; // Can be category slug or subcategory slug
  featured?: boolean;
  isPremium?: boolean;
  isClassic?: boolean;
  sizes?: ProductSize[]; // Array of available sizes/weights
  defaultWeight?: string; // Default weight display
  shelfLife?: string;
  deliveryTime?: string;
  stock?: number; // Stock quantity
}

export interface SubCategory {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subCategories?: SubCategory[];
  order?: number;
}

export interface InstagramPost {
  id: string;
  image: string;
  label: string;
  isVideo?: boolean;
  isInstagramReel?: boolean;
  overlayText?: string;
}

export interface WeddingEnquiry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  giftType?: string;
  quantityPreference?: 'small' | 'medium' | 'bulk' | 'custom';
  description?: string;
  createdAt: string;
}
