import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Media from '../models/Media.js';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, '../uploads');

fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `${Date.now()}-${basename}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|avi|m4v/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file type'));
  },
});

const router = express.Router();

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.post('/', upload.array('file'), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'File upload failed' });
    const created = [];
    for (const file of req.files) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      const media = await Media.create({
        filename: file.filename,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
      });
      created.push(media);
    }
    res.status(201).json(created.length === 1 ? created[0] : created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:filename', async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    if (!filename || filename.includes('..')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(uploadFolder, filename);
    if (!filePath.startsWith(uploadFolder)) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    await fs.promises.stat(filePath);
    await fs.promises.unlink(filePath);

    const deletedMedia = await Media.findOneAndDelete({ filename });
    res.json({ message: 'File deleted', filename, deleted: !!deletedMedia });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'File not found' });
    }
    next(error);
  }
});

export default router;
