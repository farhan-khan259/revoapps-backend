import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDatabase from './db.js';
import User from './models/User.js';
import WebsiteSetting from './models/WebsiteSetting.js';
import ContentSection from './models/ContentSection.js';

dotenv.config();

export const createDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.create({
    name: 'Super Admin',
    email: adminEmail,
    role: 'super-admin',
    passwordHash,
  });
  console.log(`Super admin account created: ${adminEmail}`);
};

export const createDefaultSettings = async () => {
  const existing = await WebsiteSetting.findOne({ slug: 'website-settings' });
  if (existing) {
    console.log('Website settings already exist');
    return;
  }

  await WebsiteSetting.create({
    name: 'Website Settings',
    slug: 'website-settings',
    settings: {
      websiteName: 'Creative Imprints',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#111111',
      secondaryColor: '#ef1f1f',
      backgroundColor: '#ffffff',
      accentColor: '#ef1f1f',
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Manrope, sans-serif',
      contactEmail: 'support@creativeimprints.com',
      contactPhone: '+1 800 123 4567',
      address: '123 Main Street, City, Country',
      socialLinks: [
        { provider: 'facebook', url: 'https://facebook.com' },
        { provider: 'instagram', url: 'https://instagram.com' },
        { provider: 'twitter', url: 'https://twitter.com' },
      ],
      copyrightText: '© 2026 Creative Imprints. All rights reserved.',
    },
  });
  console.log('Default website settings created');
};

const createDefaultContent = async () => {
  const count = await ContentSection.countDocuments();
  if (count > 0) {
    console.log('Content sections already exist');
    return;
  }

  const sections = [
    {
      page: 'home',
      sectionType: 'hero',
      title: 'Find the best tech for your lifestyle',
      subtitle: 'Browse premium accessories, phones, and gadgets for every moment.',
      content: {
        slides: [
          { key: 'slide-1', image: '/uploads/hero-1.jpg' },
          { key: 'slide-2', image: '/uploads/hero-2.jpg' },
        ],
      },
      order: 1,
    },
    {
      page: 'home',
      sectionType: 'categories',
      title: 'Shop by category',
      subtitle: 'Discover top-selling categories and mobile accessories.',
      content: { categories: [] },
      order: 2,
    },
  ];

  await ContentSection.insertMany(sections);
  console.log('Default content sections created');
};

const run = async () => {
  await connectDatabase();
  await createDefaultAdmin();
  await createDefaultSettings();
  await createDefaultContent();
  process.exit(0);
};

if (process.argv[1].endsWith('seed.js')) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
