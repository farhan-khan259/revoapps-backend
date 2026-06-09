import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDatabase from '../db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDatabase();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const newPassword = process.env.ADMIN_PASSWORD_OVERRIDE || 'Admin123!';
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const res = await User.updateOne({ email: email.toLowerCase() }, { $set: { passwordHash } });
  if (res.matchedCount === 0) {
    console.error('Admin user not found:', email);
    process.exit(1);
  }
  console.log('Admin password reset for', email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
