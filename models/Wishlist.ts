import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  items: any[]; // We'll store the full product object just like Cart
}

const WishlistItemSchema = new Schema(
  {
    id: { type: String, required: true },
  },
  { _id: false, strict: false } // strict: false allows dynamic Product properties to be saved directly
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, unique: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
