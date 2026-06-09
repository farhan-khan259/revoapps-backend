import dotenv from 'dotenv';
import connectDatabase from './src/db.js';
import Config from './src/models/Config.js';

dotenv.config();

const defaults = {
  site: {
    siteName: 'Creative Imprints',
    searchPlaceholder: 'Search products',
    brandCopy: 'Quality mobile gear.',
  },
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#ef1f1f',
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Space Grotesk, sans-serif',
    backgroundColor: '#ffffff',
  },
  ecommerce: {
    addToCartText: 'Add to cart',
    viewAllText: 'View all',
    relatedProductsHeading: 'Related Products',
  },
  homepage: {
    'new-products': { title: 'New Arrivals', subtitle: 'Latest gadgets', chips: ['Phones','Earbuds','Chargers'] },
    'best-deals': { title: 'Best Deals', subtitle: 'Top offers', chips: ['Trending','Top Rated'] },
  },
  hero: {
    badge: 'New',
    heading: 'Discover the latest in mobile tech',
    subheading: 'Premium phones and accessories',
    backgroundImage: '/uploads/hero-1.jpg',
    buttons: [ { label: 'Shop now', href: '/#new-products', variant: 'primary' } ],
  },
  footer: {
    tagline: 'Fast shipping, great prices',
    navLinks: [ { title: 'Company', links: ['About', 'Contact'] } ],
    socialLinks: [ { name: 'Instagram', href: 'https://instagram.com' } ],
  },
};

async function run() {
  await connectDatabase();
  for (const [key, value] of Object.entries(defaults)) {
    await Config.findOneAndUpdate({ key }, { value }, { upsert: true });
    console.log('Seeded', key);
  }
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
