import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';
import Coupon from '../models/Coupon';
import SerialCode from '../models/SerialCode';
import OperationLog from '../models/OperationLog';
import MembershipUpgrade from '../models/MembershipUpgrade';
import MembershipService from '../utils/membershipService';
import { createValidationError, createNotFoundError, createForbiddenError, createInternalError, asyncHandler } from '../utils/errorHandler';

const router = express.Router();

// 获取所有会员等级
router.get('/tiers', asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
  const tiers = await MembershipTier.findAll({
    where: { isActive: true },
    order: [['level', 'ASC']]
  });

  res.json({ tiers });
}));

// 获取我的会员信息
router.get('/my-membership', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  const user = await User.findByPk(req.user!.userId);

  if (!user) {
    throw createNotFoundError('用户不存在');
  }

  res.json({
    currentLevel: user.currentLevel,
    membershipTierId: user.membershipTierId,
    joinDate: user.joinDate,
    isActive: user.isActive
  });
}));

// 用户激活序列号升级
router.post('/activate-serial', auth, [
  body('serialCode').isLength({ min: 1 }).withMessage('序列号不能为空')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
  }

  const { serialCode } = req.body;
  const userId = req.user!.userId;

  const result = await MembershipService.upgradeUserBySerial(userId, serialCode, req);

  if (!result.success) {
    throw createInternalError(result.message);
  }

  res.json({
    message: result.message,
    newLevel: result.newLevel,
    user: result.user
  });
}));

// 获取我的升级历史
router.get('/my-upgrade-history', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  const userId = req.user!.userId;
  const history = await MembershipUpgrade.getUserUpgradeHistory(userId);

  res.json({ history });
}));

// 验证优惠券（保留原有功能）
router.post('/validate-coupon', auth, [
  body('couponCode').isLength({ min: 1 }).withMessage('优惠券代码不能为空'),
  body('amount').isFloat({ min: 0 }).withMessage('金额必须为正数')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
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
}));

// ==================== 管理员功能 ====================

// 管理员：手动升级用户
router.post('/admin/upgrade-user', auth, [
  body('targetUserId').isInt().withMessage('目标用户ID必须为整数'),
  body('newTierLevel').isInt({ min: 1, max: 5 }).withMessage('新等级必须为1-5之间的整数'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500字符')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
  }

  const { targetUserId, newTierLevel, reason } = req.body;
  const operatorId = req.user!.userId;

  const result = await MembershipService.upgradeUserByAdmin(
    targetUserId,
    newTierLevel,
    operatorId,
    reason,
    req
  );

  if (!result.success) {
    throw createInternalError(result.message);
  }

  res.json({
    message: result.message,
    user: result.user
  });
}));

// 管理员：生成序列号
router.post('/admin/generate-serial', auth, [
  body('tierLevel').isInt({ min: 1, max: 5 }).withMessage('等级必须为1-5之间的整数'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('数量必须为1-100之间的整数'),
  body('validDays').optional().isInt({ min: 1, max: 3650 }).withMessage('有效天数必须为1-3650之间的整数')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
  }

  const { tierLevel, quantity, validDays = 365 } = req.body;
  const creatorId = req.user!.userId;

  const result = await MembershipService.generateSerialCodes(
    tierLevel,
    quantity,
    creatorId,
    validDays
  );

  if (!result.success) {
    throw createInternalError(result.message);
  }

  res.status(201).json({
    message: result.message,
    serialCodes: result.serialCodes
  });
}));

// 管理员：获取所有序列号
router.get('/admin/serial-codes', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const { page = 1, limit = 50, isUsed, tierLevel } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};
  if (isUsed !== undefined) {
    whereClause.isUsed = isUsed === 'true';
  }
  if (tierLevel) {
    whereClause.membershipTierId = Number(tierLevel);
  }

  const { count, rows: serialCodes } = await SerialCode.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
    include: [
      { model: MembershipTier, as: 'membershipTier' },
      { model: User, as: 'creator', attributes: ['id', 'username'] },
      { model: User, as: 'usedBy', attributes: ['id', 'username'] }
    ]
  });

  res.json({ 
    serialCodes,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit))
    }
  });
}));

// 管理员：获取升级历史
router.get('/admin/upgrade-history', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const { page = 1, limit = 50, userId, upgradeType } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};
  if (userId) {
    whereClause.userId = Number(userId);
  }
  if (upgradeType) {
    whereClause.upgradeType = upgradeType;
  }

  const { count, rows: history } = await MembershipUpgrade.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'nickname'] },
      { model: User, as: 'operator', attributes: ['id', 'username', 'nickname'] },
      { model: SerialCode, as: 'serialCode', attributes: ['id', 'code'] }
    ]
  });

  res.json({ 
    history,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit))
    }
  });
}));

// 管理员：获取操作日志
router.get('/admin/operation-logs', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const { page = 1, limit = 50, userId, operationType, operatorId } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};
  if (userId) {
    whereClause.userId = Number(userId);
  }
  if (operationType) {
    whereClause.operationType = operationType;
  }
  if (operatorId) {
    whereClause.operatorId = Number(operatorId);
  }

  const { count, rows: logs } = await OperationLog.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'nickname'] },
      { model: User, as: 'operator', attributes: ['id', 'username', 'nickname'] },
      { model: User, as: 'targetUser', attributes: ['id', 'username', 'nickname'] }
    ]
  });

  res.json({ 
    logs,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit))
    }
  });
}));

// 管理员：创建会员等级
router.post('/admin/tiers', auth, [
  body('name').isLength({ min: 1, max: 50 }).withMessage('等级名称必填'),
  body('level').isInt({ min: 1 }).withMessage('等级必须为正整数'),
  body('priceRangeMin').isFloat({ min: 0 }).withMessage('最低价格必须为非负数'),
  body('priceRangeMax').isFloat({ min: 0 }).withMessage('最高价格必须为非负数')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
  }

  const { name, level, description, priceRangeMin, priceRangeMax, permissions, benefits } = req.body;

  const tier = await MembershipTier.create({
    name,
    level,
    description: description || '',
    priceRangeMin,
    priceRangeMax,
    color: '#3B82F6',
    icon: '⭐',
    permissions: permissions || {
      canViewBasic: true,
      canViewAdvanced: level >= 2,
      canViewPremium: level >= 3,
      canViewSource: level >= 4,
      canUploadWorks: level >= 2,
      canVote: level >= 2,
      maxUploadsPerDay: level * 5
    },
    benefits: benefits || [],
    isActive: true
  });

  // 记录操作日志
  await MembershipService.logUserOperation(
    req.user!.userId,
    'create_membership_tier',
    `创建会员等级: ${name} (等级${level})`,
    req,
    undefined,
    JSON.stringify(tier.toJSON())
  );

  res.status(201).json({
    message: '会员等级创建成功',
    tier
  });
}));

// 管理员：更新会员等级
router.put('/admin/tiers/:id', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const tier = await MembershipTier.findByPk(req.params.id);
  if (!tier) {
    throw createNotFoundError('会员等级不存在');
  }

  const allowedUpdates = ['name', 'description', 'priceRangeMin', 'priceRangeMax', 'permissions', 'benefits', 'isActive'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw createValidationError('包含不允许的更新字段', []);
  }

  const oldValue = JSON.stringify(tier.toJSON());
  const updateData: any = {};
  updates.forEach(update => {
    updateData[update] = req.body[update];
  });

  await tier.update(updateData);

  // 记录操作日志
  await MembershipService.logUserOperation(
    req.user!.userId,
    'update_membership_tier',
    `更新会员等级: ${tier.name}`,
    req,
    oldValue,
    JSON.stringify(tier.toJSON())
  );

  res.json({
    message: '会员等级更新成功',
    tier
  });
}));

// 管理员：创建优惠券
router.post('/admin/coupons', auth, [
  body('code').isLength({ min: 1, max: 20 }).withMessage('优惠券代码必填'),
  body('discountType').isIn(['fixed', 'percentage']).withMessage('折扣类型无效'),
  body('discountValue').isFloat({ min: 0 }).withMessage('折扣值必须为非负数'),
  body('minAmount').isFloat({ min: 0 }).withMessage('最小金额必须为非负数')
], asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('验证失败', errors.array());
  }

  const { code, description, discountType, discountValue, minAmount, maxDiscount, expiresAt } = req.body;

  const coupon = await Coupon.create({
    code,
    name: code,
    description: description || '',
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

  // 记录操作日志
  await MembershipService.logUserOperation(
    req.user!.userId,
    'create_coupon',
    `创建优惠券: ${code}`,
    req,
    undefined,
    JSON.stringify(coupon.toJSON())
  );

  res.status(201).json({
    message: '优惠券创建成功',
    coupon
  });
}));

// 管理员：获取所有优惠券
router.get('/admin/coupons', auth, asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
  // 检查管理员权限
  if (req.user!.role !== 'admin') {
    throw createForbiddenError('需要管理员权限');
  }

  const coupons = await Coupon.findAll({
    order: [['createdAt', 'DESC']]
  });

  res.json({ coupons });
}));

export default router;