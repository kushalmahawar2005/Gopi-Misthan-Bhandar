import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subCategories?: ISubCategory[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    description: { type: String },
    subCategories: { type: [SubCategorySchema], default: [] },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Add index for slug lookups
CategorySchema.index({ slug: 1 });
// Add index for ordering
CategorySchema.index({ order: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

