import express from 'express';
import Joi from 'joi';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const roleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  permissions: Joi.array().items(Joi.string()).required(),
});

const permissionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
});

router.use(authenticate);
router.use(authorize(['super-admin', 'admin']));

router.get('/', async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.json({ roles });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await roleSchema.validateAsync(req.body);
    const role = await Role.create(data);
    res.status(201).json({ role });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await roleSchema.validateAsync(req.body);
    const role = await Role.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json({ role });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/permissions', async (req, res, next) => {
  try {
    const permissions = await Permission.find();
    res.json({ permissions });
  } catch (error) {
    next(error);
  }
});

router.post('/permissions', async (req, res, next) => {
  try {
    const data = await permissionSchema.validateAsync(req.body);
    const permission = await Permission.create(data);
    res.status(201).json({ permission });
  } catch (error) {
    next(error);
  }
});

export default router;
