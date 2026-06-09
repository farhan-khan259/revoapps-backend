import mongoose from 'mongoose';

const websiteSettingSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  settings: {
    websiteName: { type: String, default: 'Creative Imprints' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#111111' },
    secondaryColor: { type: String, default: '#ef1f1f' },
    backgroundColor: { type: String, default: '#ffffff' },
    accentColor: { type: String, default: '#ef1f1f' },
    headingFont: { type: String, default: 'Space Grotesk, sans-serif' },
    bodyFont: { type: String, default: 'Manrope, sans-serif' },
    contactEmail: { type: String, default: 'support@example.com' },
    contactPhone: { type: String, default: '+1 800 123 4567' },
    address: { type: String, default: '123 Main Street, City, Country' },
    socialLinks: [
      {
        provider: String,
        url: String,
      },
    ],
    copyrightText: { type: String, default: '© 2026 Creative Imprints. All rights reserved.' },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

websiteSettingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const WebsiteSetting = mongoose.model('WebsiteSetting', websiteSettingSchema);
export default WebsiteSetting;
