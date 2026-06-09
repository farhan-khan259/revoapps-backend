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
    const sections = await ContentSection.find({ page: 'home' }).sort({ order: 1 });
    res.json({ sections });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.put('/', async (req, res, next) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: 'Sections must be an array' });
    }

    const updatedSections = [];
    for (const section of sections) {
      const payload = await sectionSchema.validateAsync({
        ...section,
        page: 'home',
      });

      if (section._id) {
        const updated = await ContentSection.findByIdAndUpdate(section._id, payload, {
          new: true,
        });
        if (updated) updatedSections.push(updated);
      } else {
        const created = await ContentSection.create(payload);
        updatedSections.push(created);
      }
    }

    res.json({ sections: updatedSections });
  } catch (error) {
    next(error);
  }
});

export default router;
