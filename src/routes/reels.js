import express from 'express';
import Joi from 'joi';
import Reel from '../models/Reel.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const reelSchema = Joi.object({
  title: Joi.string().trim().required(),
  category: Joi.string().trim().allow(''),
  thumbnail: Joi.string().trim().allow(''),
  duration: Joi.string().trim().allow(''),
  views: Joi.string().trim().allow(''),
  description: Joi.string().trim().allow(''),
});

router.get('/', async (req, res, next) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json({ reels });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.post('/', async (req, res, next) => {
  try {
    const payload = await reelSchema.validateAsync(req.body);
    const reel = await Reel.create(payload);
    res.status(201).json({ reel });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = await reelSchema.validateAsync(req.body);
    const reel = await Reel.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    res.json({ reel });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    res.json({ message: 'Reel deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
