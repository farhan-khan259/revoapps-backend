import express from 'express';
import Joi from 'joi';
import WebsiteSetting from '../models/WebsiteSetting.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const settingsSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  settings: Joi.object({
    websiteName: Joi.string().allow('').required(),
    logoUrl: Joi.string().allow('').required(),
    faviconUrl: Joi.string().allow('').required(),
    primaryColor: Joi.string().allow('').required(),
    secondaryColor: Joi.string().allow('').required(),
    backgroundColor: Joi.string().allow('').required(),
    accentColor: Joi.string().allow('').required(),
    headingFont: Joi.string().allow('').required(),
    bodyFont: Joi.string().allow('').required(),
    contactEmail: Joi.string().allow('').required(),
    contactPhone: Joi.string().allow('').required(),
    address: Joi.string().allow('').required(),
    socialLinks: Joi.array().items(
      Joi.object({ provider: Joi.string().allow('').required(), url: Joi.string().allow('').required() })
    ),
    copyrightText: Joi.string().allow('').required(),
  }),
});

router.get('/', async (req, res, next) => {
  try {
    const settings = await WebsiteSetting.findOne({ slug: 'website-settings' });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin']));

router.post('/', async (req, res, next) => {
  try {
    const payload = await settingsSchema.validateAsync(req.body);
    const settings = await WebsiteSetting.findOneAndUpdate({ slug: payload.slug }, payload, { upsert: true, new: true });
    res.status(201).json({ settings });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = await settingsSchema.validateAsync(req.body);
    const settings = await WebsiteSetting.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

export default router;
