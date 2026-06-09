import express from 'express';
import Joi from 'joi';
import FormSubmission from '../models/FormSubmission.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const contactSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('').optional(),
  message: Joi.string().allow('').optional(),
});

router.post('/contact', async (req, res, next) => {
  try {
    const submission = await contactSchema.validateAsync(req.body);
    const form = await FormSubmission.create({
      formType: 'contact',
      data: submission,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ message: 'Submission received', submission: form });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin', 'editor']));

router.get('/', async (req, res, next) => {
  try {
    const submissions = await FormSubmission.find().sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const submission = await FormSubmission.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await FormSubmission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Submission deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
