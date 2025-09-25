import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';
import Coupon from '../models/Coupon';
import SerialCode from '../models/SerialCode';

const router = express.Router();

// 获取所有会员等级
router.get('/tiers', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const tiers = await MembershipTier.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });

    res.json({ tiers });
  } catch (error) {
    console.error('Get membership tiers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取我的会员信息
router.get('/my-membership', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      include: [{ model: MembershipTier, as: 'membershipTier' }]
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      currentLevel: user.currentLevel,
      totalSpent: user.totalSpent,
      totalPaid: user.totalPaid,
      membershipTier: user.membershipTierId,
      availableCoupons: user.availableCoupons,
      usedCoupons: user.usedCoupons
    });
  } catch (error) {
    console.error('Get my membership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 计算升级费用
router.post('/calculate-upgrade', auth, [
  body('targetTierId').isInt().withMessage('Target tier ID must be an integer')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { targetTierId, couponCode } = req.body;

    const user = await User.findByPk(req.user!.userId, {
      include: [{ model: MembershipTier, as: 'membershipTier' }]
    });
    const targetTier = await MembershipTier.findByPk(targetTierId);

    if (!user || !targetTier) {
      res.status(404).json({ error: 'User or target tier not found' });
      return;
    }

    // 计算所需金额
    const currentSpent = user.totalSpent || 0;
    const requiredAmount = Math.max(0, targetTier.priceRangeMin - currentSpent);

    let finalAmount = requiredAmount;
    let discount = 0;
    let coupon = null;

    // 如果有优惠券，计算折扣
    if (couponCode) {
      coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true
        }
      });

      if (coupon && requiredAmount >= coupon.minPurchaseAmount) {
        if (coupon.discountType === 'percentage') {
          discount = Math.min(requiredAmount * (coupon.discountValue / 100), coupon.maxDiscountAmount || Infinity);
        } else {
          discount = Math.min(coupon.discountValue, requiredAmount);
        }
        finalAmount = requiredAmount - discount;
      }
    }

    res.json({
      currentLevel: user.currentLevel,
      targetLevel: targetTier.name,
      currentSpent,
      requiredAmount,
      discount,
      finalAmount,
      coupon: coupon ? {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      } : null
    });
  } catch (error) {
    console.error('Calculate upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 升级会员等级
router.post('/upgrade', auth, [
  body('targetTierId').isInt().withMessage('Target tier ID must be an integer'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { targetTierId, amount, couponCode, paymentMethod = 'online' } = req.body;

    const user = await User.findByPk(req.user!.userId, {
      include: [{ model: MembershipTier, as: 'membershipTier' }]
    });
    const targetTier = await MembershipTier.findByPk(targetTierId);

    if (!user || !targetTier) {
      res.status(404).json({ error: 'User or target tier not found' });
      return;
    }

    // 验证升级条件
    const currentSpent = user.totalSpent || 0;
    const requiredAmount = Math.max(0, targetTier.priceRangeMin - currentSpent);

    if (amount < requiredAmount) {
      res.status(400).json({ error: 'Insufficient payment amount' });
      return;
    }

    let finalAmount = amount;
    let discount = 0;
    let coupon = null;

    // 处理优惠券
    if (couponCode) {
      coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true
        }
      });

      if (coupon && amount >= coupon.minPurchaseAmount) {
        if (coupon.discountType === 'percentage') {
          discount = Math.min(amount * (coupon.discountValue / 100), coupon.maxDiscountAmount || Infinity);
        } else {
          discount = Math.min(coupon.discountValue, amount);
        }
        finalAmount = amount - discount;
      }
    }

    // 更新用户信息
    const newTotalSpent = currentSpent + amount;
    const newTotalPaid = (user.totalPaid || 0) + finalAmount;

    await user.update({
      currentLevel: targetTier.name,
      membershipTierId: targetTier.id,
      totalSpent: newTotalSpent,
      totalPaid: newTotalPaid,
      usedCoupons: coupon ? [...(user.usedCoupons || []), coupon.id] : user.usedCoupons
    });

    res.json({
      message: 'Membership upgraded successfully',
      newLevel: targetTier.name,
      totalSpent: newTotalSpent,
      totalPaid: newTotalPaid,
      discount,
      finalAmount
    });
  } catch (error) {
    console.error('Upgrade membership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 激活序列号
router.post('/activate-serial', auth, [
  body('serialCode').isLength({ min: 1 }).withMessage('Serial code is required')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { serialCode } = req.body;

    const user = await User.findByPk(req.user!.userId, {
      include: [{ model: MembershipTier, as: 'membershipTier' }]
    });

    const serial = await SerialCode.findOne({
      where: {
        code: serialCode,
        isUsed: false
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!serial) {
      res.status(404).json({ error: 'Invalid or already used serial code' });
      return;
    }

    // 检查序列号是否过期
    if (serial.validTo && new Date() > serial.validTo) {
      res.status(400).json({ error: 'Serial code has expired' });
      return;
    }

    // 根据序列号类型处理
    // SerialCode 直接对应会员等级，不需要type字段
    if (serial.membershipTierId) {
      // 找到对应的会员等级
      const targetTier = await MembershipTier.findOne({
        where: {
          level: serial.membershipTierId
        },
        order: [['order', 'DESC']]
      });

      if (targetTier) {
        // 更新用户会员等级
        const tier = await MembershipTier.findByPk(serial.membershipTierId);
        const newTotalSpent = (user.totalSpent || 0) + (tier?.priceRangeMin || 0);
        
        await user.update({
          currentLevel: targetTier.name,
          membershipTierId: targetTier.id,
          totalSpent: newTotalSpent
        });

        // 标记序列号为已使用
        await serial.update({
          isUsed: true,
          usedById: user.id,
          usedAt: new Date()
        });

        res.json({
          message: 'Serial code activated successfully',
          newLevel: targetTier.name,
          activatedValue: tier?.priceRangeMin || 0
        });
        return;
      }
    }

    res.status(400).json({ error: 'Unable to process serial code' });
  } catch (error) {
    console.error('Activate serial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 验证优惠券
router.post('/validate-coupon', auth, [
  body('couponCode').isLength({ min: 1 }).withMessage('Coupon code is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { couponCode, amount } = req.body;

    const coupon = await Coupon.findOne({
      where: {
        code: couponCode,
        isActive: true
      }
    });

    if (!coupon) {
      res.status(404).json({ 
        valid: false,
        message: '优惠券不存在或已失效'
      });
      return;
    }

    // 检查最小金额要求
    if (amount < coupon.minPurchaseAmount) {
      res.status(400).json({
        valid: false,
        message: `订单金额需满${coupon.minPurchaseAmount}元才能使用此优惠券`
      });
      return;
    }

    // 计算折扣
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.min(amount * (coupon.discountValue / 100), coupon.maxDiscountAmount || Infinity);
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscountAmount: coupon.maxDiscountAmount
      },
      discount,
      finalAmount: amount - discount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：创建会员等级
router.post('/admin/tiers', auth, [
  body('name').isLength({ min: 1, max: 50 }).withMessage('Name is required'),
  body('level').isInt({ min: 1 }).withMessage('Level must be a positive integer'),
  body('priceRangeMin').isFloat({ min: 0 }).withMessage('Price range min must be non-negative'),
  body('priceRangeMax').isFloat({ min: 0 }).withMessage('Price range max must be non-negative')
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

    const { name, level, description, priceRangeMin, priceRangeMax, permissions, features, order } = req.body;

    const tier = await MembershipTier.create({
      name,
      level,
      description,
      priceRangeMin,
      priceRangeMax,
      color: '#3B82F6',
      icon: '⭐',
      permissions: permissions || {},
      benefits: features || [],
      isActive: true
    });

    res.status(201).json({
      message: 'Membership tier created successfully',
      tier
    });
  } catch (error) {
    console.error('Create membership tier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：更新会员等级
router.put('/admin/tiers/:id', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const tier = await MembershipTier.findByPk(req.params.id);
    if (!tier) {
      res.status(404).json({ error: 'Membership tier not found' });
      return;
    }

    const allowedUpdates = ['name', 'description', 'priceRangeMin', 'priceRangeMax', 'permissions', 'features', 'order', 'isActive'];
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

    await tier.update(updateData);

    res.json({
      message: 'Membership tier updated successfully',
      tier
    });
  } catch (error) {
    console.error('Update membership tier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：创建优惠券
router.post('/admin/coupons', auth, [
  body('code').isLength({ min: 1, max: 20 }).withMessage('Coupon code is required'),
  body('discountType').isIn(['fixed', 'percentage']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be non-negative'),
  body('minAmount').isFloat({ min: 0 }).withMessage('Min amount must be non-negative')
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

    const { code, description, discountType, discountValue, minAmount, maxDiscount, expiresAt } = req.body;

    const coupon = await Coupon.create({
      code,
      name: code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount: minAmount,
      maxDiscountAmount: maxDiscount,
      validFrom: new Date(),
      validTo: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      usedCount: 0,
      applicableTierIds: [],
      createdById: req.user!.userId,
      isActive: true
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：创建序列号
router.post('/admin/serial-codes', auth, [
  body('type').isIn(['membership', 'coupon']).withMessage('Invalid serial code type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be non-negative')
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

    const { type, value, description, expiresAt, quantity = 1 } = req.body;

    const serialCodes = [];
    for (let i = 0; i < quantity; i++) {
      const code = `SC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const serialCode = await SerialCode.create({
        code,
        membershipTierId: type,
        isUsed: false,
        validFrom: new Date(),
        validTo: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batchId: `BATCH-${Date.now()}`,
        createdById: req.user!.userId
      });
      
      serialCodes.push(serialCode);
    }

    res.status(201).json({
      message: `${quantity} serial code(s) created successfully`,
      serialCodes
    });
  } catch (error) {
    console.error('Create serial codes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：获取所有优惠券
router.get('/admin/coupons', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 管理员：获取所有序列号
router.get('/admin/serial-codes', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // 检查管理员权限
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const serialCodes = await SerialCode.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ serialCodes });
  } catch (error) {
    console.error('Get serial codes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;