import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: String, default: '' },
  views: { type: String, default: '' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Reel = mongoose.model('Reel', reelSchema);
export default Reel;
