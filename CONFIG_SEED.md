# Seeding Default Config for Creative Imprints

To ensure the frontend works immediately after the first run, seed a set of default configuration documents into the `Config` collection used by the admin/config API.

You can either use the existing seed scripts or run the example Node script below.

1) Install dependencies and ensure your `.env` contains DB connection and admin credentials:

```bash
cd revoapps-backend
npm install
# set MONGO_URL and ADMIN_EMAIL / ADMIN_PASSWORD in .env
```

2) Example script to insert default config (run with `node`): create a file `seed-config.js` with this content:

```js
import dotenv from 'dotenv';
import connectDatabase from './src/db.js';
import Config from './src/models/Config.js';

dotenv.config();

const defaults = {
  site: {
    siteName: 'Creative Imprints',
    searchPlaceholder: 'Search products',
    brandCopy: 'Quality mobile gear.'
  },
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#ef1f1f',
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Space Grotesk, sans-serif',
    backgroundColor: '#ffffff'
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
```

3) Run the script:

```bash
node seed-config.js
```

4) Optional: run the existing `src/seed.js` to create admin user and website settings:

```bash
node src/seed.js
```

5) Start the backend and frontend and log into the admin panel to verify:

```bash
# backend
npm start
# frontend
cd ../revoapps-frontend
npm install
npm start
```

Notes:
- If you prefer, insert documents directly via MongoDB Compass or `mongo` shell into the `configs` collection (schema: `{ key: String, value: Mixed }`).
- Adjust any defaults above to match your branding before seeding.

If you want I can add an automated `seed-config.js` file to the repo and wire it into `package.json` scripts. Let me know.