import express from 'express';
import Joi from 'joi';
import Config from '../models/Config.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const settingsSchema = Joi.object().unknown(true);

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.get('/', async (req, res, next) => {
  try {
    const config = await Config.findOne({ key: 'settings' });
    res.json(config ? config.value : { siteName: '', brandCopy: '', navLinks: [], footerColumns: [] });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const value = await settingsSchema.validateAsync(req.body);
    const config = await Config.findOneAndUpdate(
      { key: 'settings' },
      { value, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(config.value);
  } catch (error) {
    next(error);
  }
});

export default router;
