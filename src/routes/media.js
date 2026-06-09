import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Media from '../models/Media.js';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsFolder = path.resolve(process.cwd(), process.env.UPLOAD_FOLDER || 'uploads');
fs.mkdirSync(uploadsFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${Date.now()}-${safeName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|avi|m4v/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Unsupported file type'));
  },
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [media, total] = await Promise.all([
      Media.find().sort({ uploadedAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(),
    ]);
    res.json({ media, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.post('/upload', upload.array('file'), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'File upload failed' });
    const created = [];
    for (const file of req.files) {
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      const media = await Media.create({
        filename: file.filename,
        originalName: file.originalname,
        url,
        size: file.size,
      });
      created.push(media);
    }
    res.status(201).json(Array.isArray(created) && created.length === 1 ? created[0] : created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    const filePath = path.join(uploadsFolder, media.filename);
    await fs.promises.unlink(filePath).catch(() => null);
    res.json({ message: 'Media deleted', id: media._id });
  } catch (error) {
    next(error);
  }
});

export default router;
