import dotenv from 'dotenv';
import connectDatabase from '../db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDatabase();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const res = await User.updateOne({ email: email.toLowerCase() }, { $set: { role: 'admin' } });
  if (res.matchedCount === 0) {
    console.error('Admin user not found:', email);
    process.exit(1);
  }
  console.log('Admin role set to admin for', email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
