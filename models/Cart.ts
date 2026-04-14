import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  id: string; // Product id
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedWeight?: string;
  defaultWeight?: string;
  [key: string]: any; // Catch-all for other Product fields
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
}

const CartItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String },
    selectedWeight: { type: String },
    defaultWeight: { type: String },
  },
  { _id: false, strict: false } // strict: false allows dynamic Product properties
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
