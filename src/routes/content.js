import express from 'express';
import Joi from 'joi';
import ContentSection from '../models/ContentSection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const sectionSchema = Joi.object({
  page: Joi.string().required(),
  sectionType: Joi.string().required(),
  title: Joi.string().allow('').optional(),
  subtitle: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  content: Joi.any().optional(),
  metadata: Joi.any().optional(),
  order: Joi.number().default(0),
  isVisible: Joi.boolean().default(true),
});

router.get('/', async (req, res, next) => {
  try {
    const sections = await ContentSection.find({}).sort({ page: 1, order: 1 });
    res.json({ sections });
  } catch (error) {
    next(error);
  }
});

router.get('/page/:page', async (req, res, next) => {
  try {
    const sections = await ContentSection.find({ page: req.params.page, isVisible: true }).sort({ order: 1 });
    res.json({ sections });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.post('/', async (req, res, next) => {
  try {
    const payload = await sectionSchema.validateAsync(req.body);
    const section = await ContentSection.create(payload);
    res.status(201).json({ section });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = await sectionSchema.validateAsync(req.body);
    const section = await ContentSection.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json({ section });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await ContentSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
