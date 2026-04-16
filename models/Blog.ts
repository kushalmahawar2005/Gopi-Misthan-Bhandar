import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);

