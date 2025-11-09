import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  isVerified: boolean; // Whether the user actually purchased the product
  isApproved: boolean; // Admin approval
  helpful: number; // Helpful votes count
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index for product and user
ReviewSchema.index({ productId: 1, userId: 1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

