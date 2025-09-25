import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User';
import Work from '../models/Work';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// 获取用户列表（管理员）
router.get('/', adminAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('role').optional().isIn(['admin', 'coach', 'student', 'volunteer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    // 获取每个用户的作品数量
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const worksCount = await Work.countDocuments({ author: user._id });
        return {
          ...user.toObject(),
          worksCount
        };
      })
    );

    res.json({
      users: usersWithStats,
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

// 获取用户详情
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 获取用户的作品
    const works = await Work.find({ 
      author: req.params.id, 
      status: 'published' 
    })
    .select('title coverImage votes views createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    const worksCount = await Work.countDocuments({ author: req.params.id });

    res.json({
      user,
      works,
      worksCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新用户信息
router.put('/:id', auth, [
  body('nickname').optional().isLength({ min: 1, max: 50 }).trim(),
  body('bio').optional().isLength({ max: 500 }).trim(),
  body('avatar').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查权限：只能更新自己的信息或管理员可以更新任何人
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allowedUpdates = ['nickname', 'bio', 'avatar'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => {
      (user as any)[update] = req.body[update];
    });

    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：更新用户角色
router.patch('/:id/role', adminAuth, [
  body('role').isIn(['admin', 'coach', 'student', 'volunteer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = req.body.role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：激活/停用用户
router.patch('/:id/status', adminAuth, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除用户（管理员）
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 删除用户的所有作品
    await Work.deleteMany({ author: req.params.id });
    
    // 删除用户
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated works deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;