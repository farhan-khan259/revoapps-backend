import mongoose from 'mongoose';

const seoEntrySchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  ogTitle: String,
  ogDescription: String,
  ogImageUrl: String,
  sitemap: {
    priority: { type: Number, default: 0.5 },
    changeFreq: { type: String, default: 'weekly' },
    include: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

seoEntrySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const SEOEntry = mongoose.model('SEOEntry', seoEntrySchema);
export default SEOEntry;
