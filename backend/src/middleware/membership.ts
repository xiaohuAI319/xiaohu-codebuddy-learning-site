import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 检查会员等级中间件
export const checkMembershipLevel = (requiredLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '请先登录'
        });
      }

      // 管理员拥有所有权限
      if (req.user.role === 'admin') {
        return next();
      }

      const user = await User.findById(req.user.id).populate('membershipTier');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取等级层次
      const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
      const requiredIndex = levelHierarchy.indexOf(requiredLevel);
      const userIndex = levelHierarchy.indexOf(user.currentLevel);

      if (userIndex >= requiredIndex) {
        return next();
      }

      // 返回升级提示
      const nextTier = await MembershipTier.findOne({
        order: { $gt: user.membershipTier?.order || 0 },
        isActive: true
      }).sort({ order: 1 });

      return res.status(403).json({
        success: false,
        message: '权限不足，需要升级会员',
        data: {
          currentLevel: user.currentLevel,
          requiredLevel,
          nextTier: nextTier ? {
            name: nextTier.name,
            minAmount: nextTier.minAmount,
            features: nextTier.features
          } : null
        }
      });

    } catch (error) {
      console.error('Membership check error:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  };
};

// 检查特定权限中间件
export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '请先登录'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const hasPermission = await user.hasPermission(permission);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足',
          data: {
            requiredPermission: permission,
            currentLevel: user.currentLevel
          }
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  };
};

// 内容访问权限中间件
export const checkContentAccess = (accessLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workId } = req.params;
      
      if (!req.user) {
        // 未登录用户只能访问预览内容
        if (accessLevel === 'preview') {
          return next();
        }
        return res.status(401).json({
          success: false,
          message: '请先登录以查看完整内容'
        });
      }

      const user = await User.findById(req.user.id);
      const Work = require('../models/Work').default;
      const work = await Work.findById(workId);

      if (!work) {
        return res.status(404).json({
          success: false,
          message: '作品不存在'
        });
      }

      const canAccess = work.canUserAccess(user, accessLevel);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: '权限不足，无法访问此内容',
          data: {
            currentLevel: user.currentLevel,
            requiredLevel: work.requiredLevel,
            accessLevel
          }
        });
      }

      next();
    } catch (error) {
      console.error('Content access check error:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  };
};

// 会员到期检查中间件
export const checkMembershipExpiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next();
    }

    // 检查会员是否过期
    if (user.membershipExpiry && user.membershipExpiry < new Date()) {
      // 重置为基础等级
      user.currentLevel = '学员';
      user.membershipTier = null;
      user.membershipExpiry = null;
      await user.save();

      return res.status(403).json({
        success: false,
        message: '会员已过期，请续费',
        data: {
          expiredAt: user.membershipExpiry,
          currentLevel: user.currentLevel
        }
      });
    }

    next();
  } catch (error) {
    console.error('Membership expiry check error:', error);
    next();
  }
};