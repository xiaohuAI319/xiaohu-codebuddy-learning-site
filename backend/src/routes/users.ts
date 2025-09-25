import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// 获取用户列表（管理员）
router.get('/', adminAuth, [
  // 可选的查询参数验证
], async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // 构建查询条件
    const whereClause: any = {};
    
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个用户信息
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新用户信息
router.put('/:id', auth, [
  body('nickname').optional().isLength({ min: 1, max: 50 }).trim(),
  body('bio').optional().isLength({ max: 500 }).trim(),
  body('avatar').optional().isURL()
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 检查权限：只能修改自己的信息或管理员可以修改任何人
    const currentUser = req as any;
    if (currentUser.user.userId !== user.id && currentUser.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { nickname, bio, avatar } = req.body;
    
    await user.update({
      ...(nickname && { nickname }),
      ...(bio !== undefined && { bio }),
      ...(avatar && { avatar })
    });

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新用户角色（管理员）
router.patch('/:id/role', adminAuth, [
  body('role').isIn(['admin', 'coach', 'student', 'volunteer'])
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await user.update({ role: req.body.role });

    res.json({
      message: 'User role updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 激活/停用用户（管理员）
router.patch('/:id/status', adminAuth, [
  body('isActive').isBoolean()
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await user.update({ isActive: req.body.isActive });

    res.json({
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除用户（管理员）
router.delete('/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 防止删除管理员账号
    if (user.role === 'admin') {
      res.status(403).json({ error: 'Cannot delete admin user' });
      return;
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;