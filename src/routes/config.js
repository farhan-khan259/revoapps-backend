import express from 'express';
import Joi from 'joi';
import Config from '../models/Config.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const configSchema = Joi.object({
  value: Joi.any().required(),
});

const themeSchema = Joi.object({
  theme: Joi.object().required(),
});

// Public endpoints for config retrieval (used by frontend and public)
router.get('/all', async (req, res, next) => {
  try {
    const items = await Config.find();
    const payload = items.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/theme', async (req, res, next) => {
  try {
    const config = await Config.findOne({ key: 'theme' });
    if (!config) return res.status(404).json({ message: 'Theme not found' });
    res.json({ key: config.key, value: config.value, updatedAt: config.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (!config) return res.status(404).json({ message: 'Configuration not found' });
    res.json({ key: config.key, value: config.value, updatedAt: config.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.use(authenticate, authorize(['admin', 'super-admin']));

router.post('/', async (req, res, next) => {
  try {
    const patch = req.body;
    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ message: 'Invalid configuration payload' });
    }

    const payload = {};
    for (const [key, value] of Object.entries(patch)) {
      const config = await Config.findOneAndUpdate(
        { key },
        { value, updatedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      payload[config.key] = config.value;
      try {
        const io = req.app && req.app.locals && req.app.locals.io;
        if (io) io.emit('config.updated', { key: config.key, value: config.value });
      } catch (e) {
        console.warn('Socket emit failed', e);
      }
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.put('/theme', async (req, res, next) => {
  try {
    const { theme } = await themeSchema.validateAsync(req.body);
    const config = await Config.findOneAndUpdate(
      { key: 'theme' },
      { value: theme, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    try {
      const io = req.app && req.app.locals && req.app.locals.io;
      if (io) io.emit('config.updated', { key: config.key, value: config.value });
    } catch (e) {
      console.warn('Socket emit failed', e);
    }
    res.json({ key: config.key, value: config.value, updatedAt: config.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.put('/:key', async (req, res, next) => {
  try {
    const { value } = await configSchema.validateAsync(req.body);
    const config = await Config.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    try {
      const io = req.app && req.app.locals && req.app.locals.io;
      if (io) io.emit('config.updated', { key: config.key, value: config.value });
    } catch (e) {
      console.warn('Socket emit failed', e);
    }
    res.json({ key: config.key, value: config.value, updatedAt: config.updatedAt });
  } catch (error) {
    next(error);
  }
});

export default router;
