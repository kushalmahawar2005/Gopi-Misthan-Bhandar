import mongoose from 'mongoose';

const instaBookSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true, // Video URL (uploaded video or Instagram Reel link)
  },
  isInstagramReel: {
    type: Boolean,
    default: false, // true if it's an Instagram Reel link, false if uploaded video
  },
  overlayText: {
    type: String,
    default: '',
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

export default mongoose.models.InstaBook || mongoose.model('InstaBook', instaBookSchema);

