import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { checkMembershipPermission } from '../middleware/membership';
import MembershipTier from '../models/MembershipTier';
import User from '../models/User';
import Payment from '../models/Payment';
import Coupon from '../models/Coupon';
import SerialCode from '../models/SerialCode';

const router = express.Router();

// 获取所有会员等级（公开）
router.get('/tiers', async (req, res) => {
  try {
    const tiers = await MembershipTier.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('获取会员等级失败:', error);
    res.status(500).json({
      success: false,
      message: '获取会员等级失败'
    });
  }
});

// 获取用户会员信息
router.get('/my-membership', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('membershipTier')
      .populate('availableCoupons');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        currentLevel: user.currentLevel,
        membershipTier: user.membershipTier,
        totalSpent: user.totalSpent,
        availableCoupons: user.availableCoupons,
        paymentHistory: user.paymentHistory.slice(-10) // 最近10条记录
      }
    });
  } catch (error) {
    console.error('获取用户会员信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户会员信息失败'
    });
  }
});

// 计算升级价格
router.post('/calculate-upgrade', auth, async (req, res) => {
  try {
    const { targetTierId, couponCode } = req.body;
    
    const user = await User.findById(req.user.id).populate('membershipTier');
    const targetTier = await MembershipTier.findById(targetTierId);
    
    if (!user || !targetTier) {
      return res.status(404).json({
        success: false,
        message: '用户或目标等级不存在'
      });
    }

    // 检查是否可以升级到目标等级
    const currentTierOrder = user.membershipTier?.order || 0;
    if (targetTier.order <= currentTierOrder) {
      return res.status(400).json({
        success: false,
        message: '无法降级或升级到相同等级'
      });
    }

    // 计算需要支付的金额（目标等级最低金额 - 用户已支付金额）
    let requiredAmount = Math.max(0, targetTier.minAmount - user.totalSpent);
    let discount = 0;
    let coupon = null;

    // 应用优惠券
    if (couponCode) {
      coupon = await Coupon.findOne({ 
        code: couponCode, 
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        usedCount: { $lt: '$usageLimit' }
      });

      if (coupon && requiredAmount >= coupon.minAmount) {
        if (coupon.discountType === 'percent') {
          discount = requiredAmount * (coupon.discountValue / 100);
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, requiredAmount);
      }
    }

    const finalAmount = requiredAmount - discount;

    res.json({
      success: true,
      data: {
        targetTier,
        requiredAmount,
        discount,
        finalAmount,
        coupon: coupon ? {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        } : null
      }
    });
  } catch (error) {
    console.error('计算升级价格失败:', error);
    res.status(500).json({
      success: false,
      message: '计算升级价格失败'
    });
  }
});

// 处理会员升级支付
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { targetTierId, couponCode, paymentMethod } = req.body;
    
    const user = await User.findById(req.user.id).populate('membershipTier');
    const targetTier = await MembershipTier.findById(targetTierId);
    
    if (!user || !targetTier) {
      return res.status(404).json({
        success: false,
        message: '用户或目标等级不存在'
      });
    }

    // 重新计算价格
    const currentTierOrder = user.membershipTier?.order || 0;
    if (targetTier.order <= currentTierOrder) {
      return res.status(400).json({
        success: false,
        message: '无法降级或升级到相同等级'
      });
    }

    let requiredAmount = Math.max(0, targetTier.minAmount - user.totalSpent);
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ 
        code: couponCode, 
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        usedCount: { $lt: '$usageLimit' }
      });

      if (coupon && requiredAmount >= coupon.minAmount) {
        if (coupon.discountType === 'percent') {
          discount = requiredAmount * (coupon.discountValue / 100);
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, requiredAmount);
      }
    }

    const finalAmount = requiredAmount - discount;

    // 创建支付记录
    const payment = new Payment({
      user: user._id,
      amount: finalAmount,
      originalAmount: requiredAmount,
      discount,
      coupon: coupon?._id,
      type: 'membership_upgrade',
      targetMembershipTier: targetTier._id,
      paymentMethod,
      status: 'completed' // 在实际项目中，这里应该调用支付接口
    });

    await payment.save();

    // 更新用户信息
    user.totalSpent += finalAmount;
    user.currentLevel = targetTier.name;
    user.membershipTier = targetTier._id;
    user.paymentHistory.push(payment._id);

    // 移除使用的优惠券
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
      
      user.availableCoupons = user.availableCoupons.filter(
        c => c.toString() !== coupon._id.toString()
      );
    }

    await user.save();

    res.json({
      success: true,
      message: '会员升级成功',
      data: {
        newLevel: user.currentLevel,
        totalSpent: user.totalSpent,
        payment: payment
      }
    });
  } catch (error) {
    console.error('会员升级失败:', error);
    res.status(500).json({
      success: false,
      message: '会员升级失败'
    });
  }
});

// 使用序列号激活
router.post('/activate-serial', auth, async (req, res) => {
  try {
    const { serialCode } = req.body;
    
    const user = await User.findById(req.user.id).populate('membershipTier');
    const serial = await SerialCode.findOne({ 
      code: serialCode, 
      isActive: true, 
      isUsed: false 
    });
    
    if (!serial) {
      return res.status(404).json({
        success: false,
        message: '序列号无效或已使用'
      });
    }

    // 检查序列号是否过期
    if (serial.expiresAt && new Date() > serial.expiresAt) {
      return res.status(400).json({
        success: false,
        message: '序列号已过期'
      });
    }

    if (serial.type === 'membership') {
      // 根据序列号价值确定会员等级
      const targetTier = await MembershipTier.findOne({
        minAmount: { $lte: serial.value },
        maxAmount: { $gte: serial.value },
        isActive: true
      }).sort({ order: -1 });

      if (targetTier) {
        // 创建支付记录
        const payment = new Payment({
          user: user._id,
          amount: serial.value,
          originalAmount: serial.value,
          discount: 0,
          type: 'serial_activation',
          targetMembershipTier: targetTier._id,
          serialCode: serial._id,
          paymentMethod: 'serial_code',
          status: 'completed'
        });

        await payment.save();

        // 更新用户信息
        user.totalSpent += serial.value;
        user.currentLevel = targetTier.name;
        user.membershipTier = targetTier._id;
        user.paymentHistory.push(payment._id);
        await user.save();

        // 标记序列号为已使用
        serial.isUsed = true;
        serial.usedBy = user._id;
        serial.usedAt = new Date();
        await serial.save();

        res.json({
          success: true,
          message: '序列号激活成功',
          data: {
            newLevel: user.currentLevel,
            totalSpent: user.totalSpent,
            activatedValue: serial.value
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '无法找到对应的会员等级'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: '该序列号不是会员激活码'
      });
    }
  } catch (error) {
    console.error('序列号激活失败:', error);
    res.status(500).json({
      success: false,
      message: '序列号激活失败'
    });
  }
});

// 验证优惠券
router.post('/validate-coupon', auth, async (req, res) => {
  try {
    const { couponCode, amount } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: couponCode, 
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
      usedCount: { $lt: '$usageLimit' }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券无效或已过期'
      });
    }

    if (amount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `订单金额需满${coupon.minAmount}元才能使用此优惠券`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = amount * (coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, amount);

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        },
        discount,
        finalAmount: amount - discount
      }
    });
  } catch (error) {
    console.error('验证优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '验证优惠券失败'
    });
  }
});

// ===== 管理员接口 =====

// 创建会员等级
router.post('/admin/tiers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, minAmount, maxAmount, permissions, order, description, features } = req.body;
    
    const tier = new MembershipTier({
      name,
      minAmount,
      maxAmount,
      permissions,
      order,
      description,
      features
    });

    await tier.save();

    res.json({
      success: true,
      message: '会员等级创建成功',
      data: tier
    });
  } catch (error) {
    console.error('创建会员等级失败:', error);
    res.status(500).json({
      success: false,
      message: '创建会员等级失败'
    });
  }
});

// 更新会员等级
router.put('/admin/tiers/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const tier = await MembershipTier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: '会员等级不存在'
      });
    }

    res.json({
      success: true,
      message: '会员等级更新成功',
      data: tier
    });
  } catch (error) {
    console.error('更新会员等级失败:', error);
    res.status(500).json({
      success: false,
      message: '更新会员等级失败'
    });
  }
});

// 创建优惠券
router.post('/admin/coupons', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, discountType, discountValue, minAmount, usageLimit, validFrom, validTo } = req.body;
    
    // 生成优惠券代码
    const code = 'COUPON' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const coupon = new Coupon({
      code,
      name,
      description,
      discountType,
      discountValue,
      minAmount,
      usageLimit,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo)
    });

    await coupon.save();

    res.json({
      success: true,
      message: '优惠券创建成功',
      data: coupon
    });
  } catch (error) {
    console.error('创建优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '创建优惠券失败'
    });
  }
});

// 创建序列号
router.post('/admin/serial-codes', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, type, targetId, value, quantity, expiresAt } = req.body;
    
    const serialCodes = [];
    
    for (let i = 0; i < quantity; i++) {
      const code = type.toUpperCase() + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const serial = new SerialCode({
        code,
        name,
        description,
        type,
        targetId,
        value,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      await serial.save();
      serialCodes.push(serial);
    }

    res.json({
      success: true,
      message: `成功创建 ${quantity} 个序列号`,
      data: serialCodes
    });
  } catch (error) {
    console.error('创建序列号失败:', error);
    res.status(500).json({
      success: false,
      message: '创建序列号失败'
    });
  }
});

// 获取所有优惠券（管理员）
router.get('/admin/coupons', auth, requireRole('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('获取优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '获取优惠券失败'
    });
  }
});

// 获取所有序列号（管理员）
router.get('/admin/serial-codes', auth, requireRole('admin'), async (req, res) => {
  try {
    const serialCodes = await SerialCode.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: serialCodes
    });
  } catch (error) {
    console.error('获取序列号失败:', error);
    res.status(500).json({
      success: false,
      message: '获取序列号失败'
    });
  }
});

export default router;