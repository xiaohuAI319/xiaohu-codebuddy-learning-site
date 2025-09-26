import User from '../models/User';
import MembershipTier from '../models/MembershipTier';
import MembershipUpgrade from '../models/MembershipUpgrade';
import OperationLog from '../models/OperationLog';
import SerialCode from '../models/SerialCode';
import { Request } from 'express';

export class MembershipService {
  // 管理员手动升级用户
  static async upgradeUserByAdmin(
    targetUserId: number,
    newTierLevel: number,
    operatorId: number,
    reason?: string,
    req?: Request
  ): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const user = await User.findByPk(targetUserId);
      const newTier = await MembershipTier.findOne({ where: { level: newTierLevel } });
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      if (!newTier) {
        return { success: false, message: '目标会员等级不存在' };
      }

      const oldLevel = user.currentLevel;
      
      // 更新用户等级
      await user.update({
        currentLevel: newTier.name,
        membershipTierId: newTier.id
      });

      // 记录升级历史
      await MembershipUpgrade.recordUpgrade({
        userId: targetUserId,
        fromLevel: oldLevel,
        toLevel: newTier.name,
        upgradeType: 'admin',
        operatorId,
        reason
      });

      // 记录操作日志
      await OperationLog.logOperation({
        operatorId,
        operationType: 'admin_upgrade_user',
        operationDetail: `管理员将用户 ${user.username} 从 ${oldLevel} 升级到 ${newTier.name}`,
        targetUserId,
        oldValue: oldLevel,
        newValue: newTier.name,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
      });

      return {
        success: true,
        message: '用户等级升级成功',
        user: user.toJSON()
      };
    } catch (error) {
      console.error('Admin upgrade user error:', error);
      return { success: false, message: '升级失败，请稍后重试' };
    }
  }

  // 用户通过序列号升级
  static async upgradeUserBySerial(
    userId: number,
    serialCode: string,
    req?: Request
  ): Promise<{ success: boolean; message: string; user?: any; newLevel?: string }> {
    try {
      const user = await User.findByPk(userId);
      const serial = await SerialCode.findOne({
        where: { code: serialCode, isUsed: false }
      });

      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      if (!serial) {
        return { success: false, message: '序列号无效或已被使用' };
      }

      // 检查序列号是否过期
      if (serial.validTo && new Date() > serial.validTo) {
        return { success: false, message: '序列号已过期' };
      }

      // 获取目标等级
      const targetTier = await MembershipTier.findByPk(serial.membershipTierId);
      if (!targetTier) {
        return { success: false, message: '序列号对应的会员等级不存在' };
      }

      const oldLevel = user.currentLevel;

      // 更新用户等级
      await user.update({
        currentLevel: targetTier.name,
        membershipTierId: targetTier.id
      });

      // 标记序列号为已使用
      await serial.update({
        isUsed: true,
        usedById: userId,
        usedAt: new Date()
      });

      // 记录升级历史
      await MembershipUpgrade.recordUpgrade({
        userId,
        fromLevel: oldLevel,
        toLevel: targetTier.name,
        upgradeType: 'serial',
        serialCodeId: serial.id
      });

      // 记录操作日志
      await OperationLog.logOperation({
        userId,
        operationType: 'serial_activate',
        operationDetail: `用户通过序列号 ${serialCode} 从 ${oldLevel} 升级到 ${targetTier.name}`,
        oldValue: oldLevel,
        newValue: targetTier.name,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
      });

      return {
        success: true,
        message: '序列号激活成功，等级已升级',
        user: user.toJSON(),
        newLevel: targetTier.name
      };
    } catch (error) {
      console.error('Serial upgrade error:', error);
      return { success: false, message: '激活失败，请稍后重试' };
    }
  }

  // 生成序列号
  static async generateSerialCodes(
    tierLevel: number,
    quantity: number,
    creatorId: number,
    validDays: number = 365
  ): Promise<{ success: boolean; message: string; serialCodes?: any[] }> {
    try {
      const tier = await MembershipTier.findOne({ where: { level: tierLevel } });
      if (!tier) {
        return { success: false, message: '会员等级不存在' };
      }

      const serialCodes = [];
      const batchId = `BATCH-${Date.now()}`;
      const validTo = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

      for (let i = 0; i < quantity; i++) {
        const code = `${tier.name.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const serialCode = await SerialCode.create({
          code,
          membershipTierId: tier.id,
          isUsed: false,
          validFrom: new Date(),
          validTo,
          batchId,
          createdById: creatorId
        });
        
        serialCodes.push(serialCode);
      }

      // 记录操作日志
      await OperationLog.logOperation({
        operatorId: creatorId,
        operationType: 'generate_serial_codes',
        operationDetail: `生成了 ${quantity} 个 ${tier.name} 等级序列号，批次ID: ${batchId}`,
        newValue: JSON.stringify({ tierLevel, quantity, batchId })
      });

      return {
        success: true,
        message: `成功生成 ${quantity} 个序列号`,
        serialCodes
      };
    } catch (error) {
      console.error('Generate serial codes error:', error);
      return { success: false, message: '生成序列号失败，请稍后重试' };
    }
  }

  // 记录用户操作日志
  static async logUserOperation(
    userId: number,
    operationType: string,
    operationDetail: string,
    req?: Request,
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
    try {
      await OperationLog.logOperation({
        userId,
        operationType,
        operationDetail,
        oldValue,
        newValue,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
      });
    } catch (error) {
      console.error('Log user operation error:', error);
    }
  }
}

export default MembershipService;