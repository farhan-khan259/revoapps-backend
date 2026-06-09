import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import connectDatabase from './src/db.js';
import authRoutes from './src/routes/auth.js';
import configRoutes from './src/routes/config.js';
import statsRoutes from './src/routes/stats.js';
import mediaRoutes from './src/routes/media.js';
import productRoutes from './src/routes/products.js';
import categoryRoutes from './src/routes/categories.js';
import orderRoutes from './src/routes/orders.js';
import userRoutes from './src/routes/users.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const uploadsFolder = path.resolve(process.cwd(), process.env.UPLOAD_FOLDER || 'uploads');
app.use('/uploads', express.static(uploadsFolder));

app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', configRoutes);
app.use('/api/admin', mediaRoutes);
app.use('/api/admin', statsRoutes);

app.use(errorHandler);

const io = new IOServer(server, { path: '/socket.io', cors: { origin: true, credentials: true } });
app.locals.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

const PORT = process.env.PORT || 4000;

connectDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Creative Imprints backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
