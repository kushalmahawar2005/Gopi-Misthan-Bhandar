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
  image: string;
  category: 'sweets' | 'classic-sweets' | 'premium-sweets' | 'snacks' | 'namkeen' | 'dry-fruit' | 'gifting';
  featured?: boolean;
  sizes?: IProductSize[];
  defaultWeight?: string;
  shelfLife?: string;
  deliveryTime?: string;
  stock?: number;
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
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ['sweets', 'classic-sweets', 'premium-sweets', 'snacks', 'namkeen', 'dry-fruit', 'gifting'],
      required: true,
    },
    featured: { type: Boolean, default: false },
    sizes: [ProductSizeSchema],
    defaultWeight: { type: String },
    shelfLife: { type: String },
    deliveryTime: { type: String },
    stock: { type: Number, default: 0 },
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

