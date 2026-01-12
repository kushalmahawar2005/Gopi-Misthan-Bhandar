import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrendingBanner extends Document {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  categorySlug?: string;
  productId: string;
  delaySeconds?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrendingBannerSchema = new Schema<ITrendingBanner>(
  {
    title: { type: String },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: 'View Product' },
    categorySlug: { type: String },
    productId: { type: String, required: true },
    delaySeconds: { type: Number, default: 12 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const TrendingBanner: Model<ITrendingBanner> =
  mongoose.models.TrendingBanner || mongoose.model<ITrendingBanner>('TrendingBanner', TrendingBannerSchema);

export default TrendingBanner;

