import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlider extends Document {
  image: string;
  mobileImage?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSliderSchema = new Schema<IHeroSlider>(
  {
    image: { type: String, required: true },
    mobileImage: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const HeroSlider: Model<IHeroSlider> = mongoose.models.HeroSlider || mongoose.model<IHeroSlider>('HeroSlider', HeroSliderSchema);

export default HeroSlider;

