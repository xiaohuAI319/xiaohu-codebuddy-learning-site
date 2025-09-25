import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建分类（管理员）
router.post('/', adminAuth, [
  body('id').isLength({ min: 1, max: 50 }).trim(),
  body('name').isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }).trim(),
  body('order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, name, description, order = 0 } = req.body;

    // 检查ID是否已存在
    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category ID already exists' });
    }

    const category = new Category({
      id,
      name,
      description,
      order
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新分类（管理员）
router.put('/:id', adminAuth, [
  body('name').optional().isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }).trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const allowedUpdates = ['name', 'description', 'order', 'isActive'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => {
      (category as any)[update] = req.body[update];
    });

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除分类（管理员）
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await Category.deleteOne({ id: req.params.id });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;