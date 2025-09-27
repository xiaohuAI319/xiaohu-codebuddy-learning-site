import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { createValidationError, createDuplicateError, createAuthError, createNotFoundError, asyncHandler } from '../utils/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const router = express.Router();

// 注册
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nickname').isLength({ min: 1, max: 50 }).trim()
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('Validation failed', errors.array());
  }

  const { username, email, password, nickname } = req.body;

  // 检查用户是否已存在
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw createDuplicateError('User already exists with this email or username');
  }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      nickname,
      role: 'student',
      joinDate: new Date(),
      isActive: true,
      currentLevel: '用户',
      totalSpent: 0,
      totalPaid: 0,
      availableCoupons: [],
      usedCoupons: [],
      paymentHistory: []
    });

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id.toString() },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: user.toJSON()
  });
}));

// 登录
router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, password } = req.body;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
        isActive: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id.toString() },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.userId);
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

// 刷新token
router.post('/refresh', auth, async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 生成新的JWT token
    const token = jwt.sign(
      { userId: user.id.toString() },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Token refreshed successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;