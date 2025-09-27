import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import LevelConfig from '../models/LevelConfig';
import {
  PermissionStatus,
  FeaturePermissions,
  PermissionStatusInfo,
  PromptType,
  WorkDetailPermissionResponse,
  UserLevelInfo
} from '../types/permissions';

export interface PermissionRequest extends Request {
  user?: any;
}

// 权限检查结果接口
export interface PermissionCheckResult {
  hasAccess: boolean;
  status: PermissionStatus;
  statusInfo: PermissionStatusInfo;
}

// 检查用户特定功能权限
export const checkFeaturePermission = (feature: keyof FeaturePermissions) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 未登录用户处理
      if (!req.user) {
        const result = await checkPermissionForLevel(10, feature); // 游客权限
        if (result.status === PermissionStatus.VISIBLE) {
          next();
        } else {
          res.status(401).json({
            error: 'Authentication required',
            permissionStatus: result.statusInfo
          });
        }
        return;
      }

      const user = await User.findByPk(req.user.userId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // 管理员拥有所有权限
      if (user.isAdmin()) {
        next();
        return;
      }

      // 检查用户等级权限
      const result = await checkPermissionForLevel(user.userLevel, feature);
      if (result.status === PermissionStatus.VISIBLE) {
        next();
      } else {
        res.status(403).json({
          error: 'Insufficient permissions',
          permissionStatus: result.statusInfo
        });
      }
    } catch (error) {
      console.error('Feature permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// 检查特定等级的功能权限
export const checkPermissionForLevel = async (
  userLevel: number,
  feature: keyof FeaturePermissions
): Promise<PermissionCheckResult> => {
  try {
    const permissions = await LevelConfig.getUserPermissions(userLevel);
    const status: PermissionStatus = permissions[feature] as PermissionStatus;

    // 构建权限状态信息
    const statusInfo: PermissionStatusInfo = {
      status,
      message: getPermissionMessage(feature, status, userLevel),
      promptType: getPromptType(status, userLevel)
    };

    // 设置目标等级信息
    if (status === PermissionStatus.PROMPT) {
      const targetLevel = getTargetLevelForFeature(feature, userLevel);
      if (targetLevel) {
        statusInfo.targetLevel = targetLevel;
        statusInfo.targetLevelName = getLevelName(targetLevel);
      }
    }

    return {
      hasAccess: status === PermissionStatus.VISIBLE,
      status,
      statusInfo
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      hasAccess: false,
      status: PermissionStatus.HIDDEN,
      statusInfo: {
        status: PermissionStatus.HIDDEN,
        message: 'Permission check failed'
      }
    };
  }
};

// 获取权限提示信息
const getPermissionMessage = (
  feature: keyof FeaturePermissions,
  status: PermissionStatus,
  userLevel: number
): string => {
  const levelName = getLevelName(userLevel);

  switch (feature) {
    case 'promptPermission':
      if (status === PermissionStatus.PROMPT) {
        return userLevel === 10
          ? '登录后查看提示词'
          : '升级到会员查看提示词';
      }
      break;
    case 'sourceCodePermission':
      if (status === PermissionStatus.PROMPT) {
        return '升级到高级会员查看源码';
      }
      break;
    case 'uploadPermission':
      if (status === PermissionStatus.PROMPT) {
        return '升级到会员上传作品';
      }
      break;
    case 'votePermission':
      if (status === PermissionStatus.PROMPT) {
        return '登录后参与投票';
      }
      break;
  }

  return status === PermissionStatus.HIDDEN ? '功能不可用' : '权限正常';
};

// 获取提示类型
const getPromptType = (status: PermissionStatus, userLevel: number): PromptType | undefined => {
  if (status !== PermissionStatus.PROMPT) return undefined;
  return userLevel === 10 ? PromptType.LOGIN : PromptType.UPGRADE;
};

// 获取功能需要的目标等级
const getTargetLevelForFeature = (
  feature: keyof FeaturePermissions,
  currentLevel: number
): number | undefined => {
  switch (feature) {
    case 'promptPermission':
      return currentLevel < 30 ? 30 : undefined;
    case 'sourceCodePermission':
      return currentLevel < 40 ? 40 : undefined;
    case 'uploadPermission':
      return currentLevel < 30 ? 30 : undefined;
    case 'votePermission':
      return currentLevel < 20 ? 20 : undefined;
    default:
      return undefined;
  }
};

// 获取等级名称
const getLevelName = (level: number): string => {
  const levelNames: { [key: number]: string } = {
    10: '游客',
    20: '用户',
    30: '会员',
    40: '高级会员',
    50: '共创',
    319: '创始人'
  };
  return levelNames[level] || '未知等级';
};

// 为作品详情页构建权限响应
export const buildWorkDetailPermissionResponse = async (
  user: User | null,
  workData: any
): Promise<WorkDetailPermissionResponse> => {
  const userLevel = user ? user.userLevel : 10; // 游客等级10
  const permissions = await LevelConfig.getUserPermissions(userLevel);

  // 构建用户等级信息
  const userLevelInfo: UserLevelInfo = {
    current: userLevel,
    name: getLevelName(userLevel),
    nextLevel: getNextLevelInfo(userLevel)
  };

  // 构建权限状态响应
  const permissionStatus: any = {};

  // 检查各个功能的权限状态
  const features: (keyof FeaturePermissions)[] = [
    'promptPermission',
    'sourceCodePermission',
    'votePermission',
    'commentPermission',
    'uploadPermission',
    'premiumContentPermission'
  ];

  for (const feature of features) {
    const result = await checkPermissionForLevel(userLevel, feature);
    if (result.status !== PermissionStatus.HIDDEN) {
      permissionStatus[feature] = result.statusInfo;

      // 特殊处理上传权限，添加剩余次数
      if (feature === 'uploadPermission' && result.status === PermissionStatus.VISIBLE) {
        // TODO: 实现每日上传限制检查
        permissionStatus[feature].remainingUploads = permissions.maxUploadsPerDay;
      }
    }
  }

  return {
    // 基本信息
    id: workData.id,
    title: workData.title,
    description: workData.description,
    coverImage: workData.coverImage,
    category: workData.category,
    author: workData.author,
    votes: workData.votes,
    createdAt: workData.createdAt,

    // 权限控制内容
    prompt: permissions.promptPermission === PermissionStatus.VISIBLE ? workData.prompt : undefined,
    repositoryUrl: permissions.sourceCodePermission === PermissionStatus.VISIBLE ? workData.repositoryUrl : undefined,

    // 权限状态信息
    permissionStatus,

    // 用户等级信息
    userLevel: userLevelInfo
  };
};

// 获取下一等级信息
const getNextLevelInfo = (currentLevel: number) => {
  const levels = [
    { level: 10, name: '游客', next: 20 },
    { level: 20, name: '用户', next: 30 },
    { level: 30, name: '会员', next: 40 },
    { level: 40, name: '高级会员', next: 50 },
    { level: 50, name: '共创', next: 319 },
    { level: 319, name: '创始人', next: undefined }
  ];

  const current = levels.find(l => l.level === currentLevel);
  if (!current || !current.next) return undefined;

  const next = levels.find(l => l.level === current.next);
  if (!next) return undefined;

  return {
    level: next.level,
    name: next.name,
    requiredAction: getUpgradeAction(currentLevel, next.level)
  };
};

// 获取升级操作描述
const getUpgradeAction = (fromLevel: number, toLevel: number): string => {
  const actions: { [key: number]: string } = {
    20: '注册登录成为用户',
    30: '升级到会员获取更多权限',
    40: '升级到高级会员查看源码',
    50: '升级到共创获得更多权限',
    319: '升级到创始人获得最高权限'
  };
  return actions[toLevel] || '升级获取更多权限';
};