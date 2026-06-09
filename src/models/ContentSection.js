import mongoose from 'mongoose';

const contentSectionSchema = new mongoose.Schema({
  page: { type: String, required: true },
  sectionType: { type: String, required: true },
  title: String,
  subtitle: String,
  description: String,
  content: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

contentSectionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const ContentSection = mongoose.model('ContentSection', contentSectionSchema);
export default ContentSection;
