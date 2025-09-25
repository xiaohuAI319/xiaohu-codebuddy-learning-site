import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import User from '../models/User';
import Work from '../models/Work';
import MembershipTier from '../models/MembershipTier';
import Payment from '../models/Payment';

const router = express.Router();

// 获取系统统计信息
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalWorks,
      totalPayments,
      recentUsers,
      recentWorks,
      membershipStats
    ] = await Promise.all([
      User.countDocuments(),
      Work.countDocuments(),
      Payment.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(10).select('nickname currentLevel createdAt'),
      Work.find().sort({ createdAt: -1 }).limit(10).populate('author', 'nickname'),
      User.aggregate([
        {
          $group: {
            _id: '$currentLevel',
            count: { $sum: 1 },
            totalSpent: { $sum: '$totalSpent' }
          }
        }
      ])
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalWorks,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentUsers,
        recentWorks,
        membershipStats
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

// 获取所有用户
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', level = '' } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { nickname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (level) {
      query.currentLevel = level;
    }

    const users = await User.find(query)
      .populate('membershipTier')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 更新用户信息
router.put('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { nickname, role, currentLevel, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nickname, role, currentLevel, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// 删除用户
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
});

// 获取所有作品（管理员视图）
router.get('/works', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '' } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const works = await Work.find(query)
      .populate('author', 'nickname currentLevel')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Work.countDocuments(query);

    res.json({
      success: true,
      data: works,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作品列表失败'
    });
  }
});

// 审核作品
router.put('/works/:id/review', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    
    const work = await Work.findByIdAndUpdate(
      req.params.id,
      { 
        reviewStatus: status,
        reviewNote,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      },
      { new: true }
    ).populate('author', 'nickname');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    res.json({
      success: true,
      message: '作品审核完成',
      data: work
    });
  } catch (error) {
    console.error('审核作品失败:', error);
    res.status(500).json({
      success: false,
      message: '审核作品失败'
    });
  }
});

// 获取支付记录
router.get('/payments', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', type = '' } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('user', 'nickname email')
      .populate('targetMembershipTier', 'name')
      .populate('coupon', 'code name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取支付记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取支付记录失败'
    });
  }
});

export default router;