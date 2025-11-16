import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStat {
  icon: string; // Icon name (e.g., 'award', 'heart', 'users')
  value: string;
  label: string;
}

export interface ISiteContent extends Document {
  section: 'about' | 'hero' | 'footer' | 'header' | 'marquee';
  title?: string;
  subtitle?: string;
  description?: string;
  mainImage?: string;
  images?: string[];
  stats?: IStat[];
  content?: {
    heading?: string;
    text?: string;
  };
  giftsContent?: {
    heading?: string;
    text?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StatSchema = new Schema<IStat>({
  icon: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
});

const ContentSchema = new Schema({
  heading: { type: String },
  text: { type: String },
});

const GiftsContentSchema = new Schema({
  heading: { type: String },
  text: { type: String },
});

const SiteContentSchema = new Schema<ISiteContent>(
  {
    section: {
      type: String,
      enum: ['about', 'hero', 'footer', 'header', 'marquee'],
      required: true,
      unique: true,
    },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    mainImage: { type: String },
    images: [{ type: String }],
    stats: [StatSchema],
    content: ContentSchema,
    giftsContent: GiftsContentSchema,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);

export default SiteContent;

