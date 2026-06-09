import express from 'express';
import Joi from 'joi';
import SEOEntry from '../models/SEOEntry.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const seoSchema = Joi.object({
  page: Joi.string().required(),
  metaTitle: Joi.string().allow('').optional(),
  metaDescription: Joi.string().allow('').optional(),
  keywords: Joi.array().items(Joi.string()).optional(),
  ogTitle: Joi.string().allow('').optional(),
  ogDescription: Joi.string().allow('').optional(),
  ogImageUrl: Joi.string().allow('').optional(),
  sitemap: Joi.object({
    priority: Joi.number().min(0).max(1).default(0.5),
    changeFreq: Joi.string().allow('').default('weekly'),
    include: Joi.boolean().default(true),
  }).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const entries = await SEOEntry.find().sort({ page: 1 });
    res.json({ entries });
  } catch (error) {
    next(error);
  }
});

router.get('/:page', async (req, res, next) => {
  try {
    const entry = await SEOEntry.findOne({ page: req.params.page });
    res.json({ entry });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin']));

router.post('/', async (req, res, next) => {
  try {
    const payload = await seoSchema.validateAsync(req.body);
    const entry = await SEOEntry.findOneAndUpdate({ page: payload.page }, payload, { upsert: true, new: true });
    res.status(201).json({ entry });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = await seoSchema.validateAsync(req.body);
    const entry = await SEOEntry.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!entry) return res.status(404).json({ message: 'SEO entry not found' });
    res.json({ entry });
  } catch (error) {
    next(error);
  }
});

export default router;
