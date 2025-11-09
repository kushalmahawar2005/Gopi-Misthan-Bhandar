import mongoose from 'mongoose';

const giftBoxSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['assorted', 'dry-fruit', 'souvenir'],
    required: true,
  },
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

export default mongoose.models.GiftBox || mongoose.model('GiftBox', giftBoxSchema);

