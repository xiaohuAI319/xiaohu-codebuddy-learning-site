import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';

export interface MembershipRequest extends Request {
  user?: any;
}

export const checkMembershipPermission = (permission: string) => {
  return async (req: MembershipRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await User.findByPk(req.user.userId, {
        include: [{ model: MembershipTier, as: 'membershipTier' }]
      });

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // 管理员有所有权限
      if (user.role === 'admin') {
        next();
        return;
      }

      // 检查会员权限
      let tier = null;
      if (user.membershipTierId) {
        tier = await MembershipTier.findByPk(user.membershipTierId);
      }
      
      if (!tier) {
        tier = await MembershipTier.findOne({
          where: { level: 1 } // 默认学员等级
        });
      }

      if (!tier) {
        res.status(403).json({ error: 'No membership tier found' });
        return;
      }

      const permissions = tier.permissions as any;
      if (!permissions[permission]) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          current: user.currentLevel
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Membership permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};