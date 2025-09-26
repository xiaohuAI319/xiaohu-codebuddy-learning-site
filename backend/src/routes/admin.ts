/**
 * 管理后台路由
 * 提供管理员专用的API接口
 */

import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User';
import Work from '../models/Work';
import MembershipTier from '../models/MembershipTier';
import { adminAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取管理后台统计数据
router.get('/stats', adminAuth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 基础统计
    const totalUsers = await User.count();
    const totalWorks = await Work.count();
    const totalPayments = 0; // TODO: 实现支付统计
    const totalRevenue = 0; // TODO: 实现收入统计

    // 最近7天新用户
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: ['id', 'nickname', 'currentLevel', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // 最近7天新作品
    const recentWorks = await Work.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      include: [
        {
          model: User,
          as: 'authorUser',
          attributes: ['id', 'nickname']
        }
      ],
      attributes: ['id', 'title', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // 用户等级分布
    const userLevelStats = await User.findAll({
      attributes: [
        'currentLevel',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count']
      ],
      group: ['currentLevel']
    });

    // 作品分类统计
    const workCategoryStats = await Work.findAll({
      attributes: [
        'category',
        [Work.sequelize!.fn('COUNT', Work.sequelize!.col('id')), 'count']
      ],
      group: ['category']
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalWorks,
          totalPayments,
          totalRevenue
        },
        recentUsers: recentUsers.map(user => ({
          _id: user.id,
          nickname: user.nickname,
          currentLevel: user.currentLevel,
          createdAt: user.createdAt
        })),
        recentWorks: recentWorks.map(work => ({
          _id: work.id,
          title: work.title,
          author: {
            nickname: (work as any).authorUser?.nickname || '未知用户'
          },
          createdAt: work.createdAt
        })),
        userLevelStats,
        workCategoryStats
      }
    });
  } catch (error) {
    console.error('获取管理后台统计失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 获取用户列表
router.get('/users', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词长度不能超过100'),
  query('role').optional().isIn(['admin', 'coach', 'student', 'volunteer']).withMessage('无效的角色'),
  query('level').optional().isLength({ max: 50 }).withMessage('无效的等级')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const level = req.query.level as string;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // 搜索条件
    if (search) {
      whereClause[Op.or] = [
        { nickname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (level) {
      whereClause.currentLevel = level;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'nickname', 'role', 'currentLevel', 'isActive', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          total: Math.ceil(count / limit),
          count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取作品列表
router.get('/works', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词长度不能超过100'),
  query('category').optional().isIn(['web', 'mobile', 'desktop', 'ai', 'other']).withMessage('无效的分类'),
  query('visibility').optional().isIn(['public', 'private']).withMessage('无效的可见性')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const visibility = req.query.visibility as string;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // 搜索条件
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (visibility) {
      whereClause.visibility = visibility;
    }

    const { count, rows: works } = await Work.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'authorUser',
          attributes: ['id', 'nickname', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        works,
        pagination: {
          current: page,
          total: Math.ceil(count / limit),
          count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({ error: '获取作品列表失败' });
  }
});

// 更新用户状态
router.patch('/users/:id/status', adminAuth, [
  body('isActive').isBoolean().withMessage('状态必须是布尔值')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    // 防止停用管理员账号
    if (user.role === 'admin' && !req.body.isActive) {
      res.status(403).json({ error: '不能停用管理员账号' });
      return;
    }

    await user.update({ isActive: req.body.isActive });

    res.json({
      success: true,
      message: `用户已${req.body.isActive ? '激活' : '停用'}`,
      data: user
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ error: '更新用户状态失败' });
  }
});

// 更新用户等级
router.patch('/users/:id/level', adminAuth, [
  body('currentLevel').isLength({ min: 1, max: 50 }).withMessage('等级名称长度必须在1-50字符之间')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    // 验证等级是否存在
    const tier = await MembershipTier.findOne({ where: { name: req.body.currentLevel } });
    if (!tier) {
      res.status(400).json({ error: '无效的会员等级' });
      return;
    }

    await user.update({ currentLevel: req.body.currentLevel });

    res.json({
      success: true,
      message: '用户等级更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户等级失败:', error);
    res.status(500).json({ error: '更新用户等级失败' });
  }
});

// 删除作品
router.delete('/works/:id', adminAuth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 删除相关文件
    const fs = require('fs');
    if (work.coverImage && fs.existsSync(work.coverImage)) {
      fs.unlinkSync(work.coverImage);
    }
    if (work.htmlFile && fs.existsSync(work.htmlFile)) {
      fs.unlinkSync(work.htmlFile);
    }

    await work.destroy();

    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    console.error('删除作品失败:', error);
    res.status(500).json({ error: '删除作品失败' });
  }
});

// 批量操作用户
router.post('/users/batch', adminAuth, [
  body('userIds').isArray().withMessage('用户ID列表必须是数组'),
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('无效的操作类型')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { userIds, action } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ error: '用户ID列表不能为空' });
      return;
    }

    // 检查是否包含管理员账号
    const adminUsers = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        role: 'admin'
      }
    });

    if (adminUsers.length > 0 && (action === 'deactivate' || action === 'delete')) {
      res.status(403).json({ error: '不能对管理员账号执行此操作' });
      return;
    }

    let result;
    switch (action) {
      case 'activate':
        result = await User.update(
          { isActive: true },
          { where: { id: { [Op.in]: userIds } } }
        );
        break;
      case 'deactivate':
        result = await User.update(
          { isActive: false },
          { where: { id: { [Op.in]: userIds } } }
        );
        break;
      case 'delete':
        result = await User.destroy({
          where: { id: { [Op.in]: userIds } }
        });
        break;
    }

    const affectedCount = Array.isArray(result) ? result[0] : result || 0;
    res.json({
      success: true,
      message: `批量操作完成，影响 ${affectedCount} 个用户`,
      data: { affectedCount }
    });
  } catch (error) {
    console.error('批量操作用户失败:', error);
    res.status(500).json({ error: '批量操作失败' });
  }
});

/**
 * 审核作品（通过/拒绝）
 */
router.patch('/works/:id/approve', adminAuth, [
  body('approved').isBoolean().withMessage('approved 必须是布尔值')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 使用 visibility 表示审核状态：public=已通过；private=已拒绝
    const newVisibility = req.body.approved ? 'public' : 'private';
    await work.update({ visibility: newVisibility });

    res.json({
      success: true,
      message: `作品已${req.body.approved ? '通过' : '拒绝'}`,
      data: { id: work.id, visibility: work.visibility }
    });
  } catch (error) {
    console.error('审核作品失败:', error);
    res.status(500).json({ error: '审核作品失败' });
  }
});

export default router;