import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductSize {
  weight: string;
  price: number;
  label?: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string; // Main image (for backward compatibility)
  images?: string[]; // Multiple images array
  category: string; // Can be category slug or subcategory slug
  featured?: boolean;
  isPremium?: boolean;
  isClassic?: boolean;
  sizes?: IProductSize[];
  defaultWeight?: string;
  shelfLife?: string;
  deliveryTime?: string;
  stock?: number;
  giftBoxSubCategory?: 'assorted' | 'dry-fruit' | 'souvenir'; // For Gift Box products
  giftBoxSize?: 'small' | 'large'; // For Gift Box products
  createdAt: Date;
  updatedAt: Date;
}

const ProductSizeSchema = new Schema<IProductSize>({
  weight: { type: String, required: true },
  price: { type: Number, required: true },
  label: { type: String },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false, default: '' },
    images: { type: [String], default: [] }, // Multiple images array
    category: {
      type: String,
      required: true,
      // Allow any string - validation happens in API to support subcategories
    },
    featured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isClassic: { type: Boolean, default: false },
    sizes: [ProductSizeSchema],
    defaultWeight: { type: String },
    shelfLife: { type: String },
    deliveryTime: { type: String },
    stock: { type: Number, default: 0 },
    giftBoxSubCategory: {
      type: String,
      enum: ['assorted', 'dry-fruit', 'souvenir'],
    },
    giftBoxSize: {
      type: String,
      enum: ['small', 'large'],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ProductSchema.index({ category: 1, featured: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

