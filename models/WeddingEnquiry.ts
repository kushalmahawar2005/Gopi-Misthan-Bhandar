import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeddingEnquiry extends Document {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  giftType?: string;
  quantityPreference?: 'small' | 'medium' | 'bulk' | 'custom';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeddingEnquirySchema = new Schema<IWeddingEnquiry>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    giftType: { type: String },
    quantityPreference: {
      type: String,
      enum: ['small', 'medium', 'bulk', 'custom'],
      default: 'small',
    },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

WeddingEnquirySchema.index({ createdAt: -1 });

const WeddingEnquiry: Model<IWeddingEnquiry> =
  mongoose.models.WeddingEnquiry || mongoose.model<IWeddingEnquiry>('WeddingEnquiry', WeddingEnquirySchema);

export default WeddingEnquiry;


