import express from 'express';
import Joi from 'joi';
import Category from '../models/Category.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const categorySchema = Joi.object({
  name: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
  image: Joi.string().uri().allow(''),
  description: Joi.string().trim().allow(''),
});

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const payload = await categorySchema.validateAsync(req.body);
    const category = await Category.create(payload);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const payload = await categorySchema.validateAsync(req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
