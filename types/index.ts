export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'sweets' | 'snacks' | 'namkeen' | 'dry-fruit' | 'gifting';
  featured?: boolean;
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
}
