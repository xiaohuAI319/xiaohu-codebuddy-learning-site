import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取所有分类
router.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建分类（管理员）
router.post('/', [
  auth,
  body('id').isLength({ min: 1, max: 50 }).trim(),
  body('name').isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }).trim(),
  body('order').optional().isInt({ min: 0 })
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id, name, description, order = 0 } = req.body;

    // 检查ID是否已存在
    const existingCategory = await Category.findByPk(id);
    if (existingCategory) {
      res.status(400).json({ error: 'Category ID already exists' });
      return;
    }

    const category = await Category.create({
      id,
      name,
      description,
      order
    });

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
router.put('/:id', [
  auth,
  body('name').optional().isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }).trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const allowedUpdates = ['name', 'description', 'order', 'isActive'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({ error: 'Invalid updates' });
      return;
    }

    const updateData: any = {};
    updates.forEach(update => {
      updateData[update] = req.body[update];
    });

    await category.update(updateData);

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
router.delete('/:id', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;