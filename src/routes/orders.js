import express from 'express';
import Joi from 'joi';
import Order from '../models/Order.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const orderUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  paymentStatus: Joi.string().trim().optional(),
  notes: Joi.string().trim().allow('').optional(),
});

router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    const skip = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([
      Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filters),
    ]);
    res.json({ orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const payload = await orderUpdateSchema.validateAsync(req.body);
    const updates = { ...payload };
    if (payload.status === 'shipped') updates.shippedAt = new Date();
    if (payload.status === 'delivered') updates.deliveredAt = new Date();
    if (payload.status === 'cancelled') updates.cancelledAt = new Date();
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted permanently' });
  } catch (error) {
    next(error);
  }
});

// Public route for customers to check their orders by email
router.get('/public/:email?', async (req, res, next) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required to look up orders' });
    }
    const orders = await Order.find({ 'customer.email': email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

export default router;
