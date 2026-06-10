import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import http from 'http';
import connectDatabase from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import contentRoutes from './routes/content.js';
import settingsRoutes from './routes/settings.js';
import configRoutes from './routes/config.js';
import adminUploadRoutes from './routes/adminUpload.js';
import mediaRoutes from './routes/media.js';
import formsRoutes from './routes/forms.js';
import rolesRoutes from './routes/roles.js';
import seoRoutes from './routes/seo.js';
import statsRoutes from './routes/stats.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import reelsRoutes from './routes/reels.js';
import homepageRoutes from './routes/homepage.js';
import adminSettingsRoutes from './routes/adminSettings.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet());
const frontendOrigin = process.env.FRONTEND_URL || 'https://c.cimprints.com';
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? frontendOrigin : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
} else {
  console.log('Rate limiter disabled (not production)');
}

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/categories', categoriesRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin/config', configRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/media/upload', adminUploadRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/admin/reels', reelsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/seo', seoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDatabase()
  .then(() => {
    const server = http.createServer(app);

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Exiting.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`Creative Imprints backend running on http://localhost:${PORT}`);
    });

    // expose server on app.locals in case other modules (sockets) need it
    app.locals.server = server;
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
