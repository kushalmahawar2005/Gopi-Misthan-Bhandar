import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlider extends Document {
  title?: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSliderSchema = new Schema<IHeroSlider>(
  {
    title: { type: String },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const HeroSlider: Model<IHeroSlider> = mongoose.models.HeroSlider || mongoose.model<IHeroSlider>('HeroSlider', HeroSliderSchema);

export default HeroSlider;

