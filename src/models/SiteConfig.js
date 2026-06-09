import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

siteConfigSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
export default SiteConfig;
