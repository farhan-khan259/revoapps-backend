import express from 'express';
import Joi from 'joi';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  oldPrice: Joi.number().min(0).allow(null),
  discount: Joi.number().min(0).max(100).default(0),
  rating: Joi.number().min(0).max(5).default(0),
  sold: Joi.number().min(0).default(0),
  stock: Joi.number().min(0).default(0),
  categories: Joi.array().items(Joi.string().trim()).default([]),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  description: Joi.string().trim().allow(''),
  highlights: Joi.array().items(Joi.string().trim()).default([]),
  specs: Joi.array().items(Joi.object({ label: Joi.string().trim().required(), value: Joi.string().trim().required() })).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
});

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, tag, search, minPrice, maxPrice } = req.query;
    const filters = {};
    if (category) filters.categories = category;
    if (tag) filters.tags = tag;
    if (search) filters.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') },
    ];
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
      Product.find(filters).populate('categories').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Product.countDocuments(filters),
    ]);
    res.json({ products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('categories');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const payload = await productSchema.validateAsync(req.body);
    const product = await Product.create(payload);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const payload = await productSchema.validateAsync(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
