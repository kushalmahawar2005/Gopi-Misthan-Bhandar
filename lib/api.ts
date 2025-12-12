import { Product, Category, InstagramPost } from '@/types';

// Transform MongoDB document to frontend format
const transformProduct = (product: any): Product => {
  return {
    id: product._id ? String(product._id) : product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category,
    featured: product.featured || false,
    isPremium: product.isPremium || false,
    isClassic: product.isClassic || false,
    sizes: product.sizes || [],
    defaultWeight: product.defaultWeight,
    shelfLife: product.shelfLife,
    deliveryTime: product.deliveryTime,
    stock: product.stock || 0,
  };
};

const transformCategory = (category: any): Category => {
  return {
    id: category._id ? String(category._id) : category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
  };
};

const transformInstaBook = (item: any): InstagramPost => {
  return {
    id: item._id ? String(item._id) : item.id,
    image: item.videoUrl || item.image || '', // Support old 'image' field for migration
    label: item.label,
    isVideo: true, // InstaBook is always video now
    isInstagramReel: item.isInstagramReel || false,
    overlayText: item.overlayText || '',
  };
};

// API Functions
export const fetchProducts = async (params?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/products?${queryParams.toString()}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.map(transformProduct);
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      return transformProduct(data.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.map(transformCategory);
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await fetch(`/api/categories/slug/${slug}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      return transformCategory(data.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const fetchInstaBooks = async (): Promise<InstagramPost[]> => {
  try {
    const response = await fetch('/api/instabook');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.map(transformInstaBook);
    }
    return [];
  } catch (error) {
    console.error('Error fetching InstaBook items:', error);
    return [];
  }
};

export const fetchInstaPosts = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/instapost');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching InstaPost items:', error);
    return [];
  }
};

export const fetchAboutContent = async () => {
  try {
    const response = await fetch('/api/site-content/section/about', {
      cache: 'no-store', // Always fetch fresh data
    });
    const data = await response.json();
    
    if (data.success && data.data) {
      // Ensure aboutCards is an array
      if (data.data.aboutCards && Array.isArray(data.data.aboutCards)) {
        return data.data;
      }
      // If no aboutCards but has legacy data, return it
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return null;
  }
};

export interface HeroSlide {
  id: string;
  image: string;
  mobileImage?: string;
  order: number;
  isActive: boolean;
}

export const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    const response = await fetch('/api/hero-slider');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.map((slide: any) => ({
        id: slide._id ? String(slide._id) : slide.id,
        image: slide.image,
        mobileImage: slide.mobileImage,
        order: slide.order || 0,
        isActive: slide.isActive !== false,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
};

export interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  try {
    const response = await fetch('/api/gallery');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return [];
  }
};

export interface GiftBoxItem {
  _id: string;
  category: 'assorted' | 'dry-fruit' | 'souvenir';
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export const fetchGiftBoxes = async (): Promise<GiftBoxItem[]> => {
  try {
    const response = await fetch('/api/giftbox');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching gift boxes:', error);
    return [];
  }
};

export interface BlogItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  publishedDate: string;
  order: number;
  isActive: boolean;
}

export const fetchBlogs = async (): Promise<BlogItem[]> => {
  try {
    const response = await fetch('/api/blog');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

