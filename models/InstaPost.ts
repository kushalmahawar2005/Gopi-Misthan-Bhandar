import mongoose from 'mongoose';

const instaPostSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  instagramUrl: {
    type: String,
    required: true, // Required - clicking will redirect here
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

export default mongoose.models.InstaPost || mongoose.model('InstaPost', instaPostSchema);

