import express from 'express';
import Order from '../models/Order.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/sales', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const start = new Date();
    start.setDate(start.getDate() - days + 1);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
        },
      },
    ]).exec();

    res.json(data.map((d) => ({ date: d.date, total: d.total })));
  } catch (error) {
    next(error);
  }
});

export default router;
