import express from 'express';
import Joi from 'joi';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const roleSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin').required(),
});

router.get('/admin/users', authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/users/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

router.put('/admin/users/:id/role', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { role } = await roleSchema.validateAsync(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
