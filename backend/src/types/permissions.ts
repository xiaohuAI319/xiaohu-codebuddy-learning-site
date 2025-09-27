/**
 * 权限系统类型定义
 * 支持精细化权限控制
 */

// 权限状态枚举
export enum PermissionStatus {
  HIDDEN = 'hidden',           // 完全隐藏，用户不知道有这个功能
  PROMPT = 'prompt',           // 提示状态（登录提示或升级提示）
  VISIBLE = 'visible'         // 正常显示/可访问
}

// 提示类型枚举
export enum PromptType {
  LOGIN = 'login',            // 提示登录
  UPGRADE = 'upgrade'         // 提示升级
}

// 用户等级枚举
export enum UserLevel {
  GUEST = 10,                 // 游客
  USER = 20,                  // 用户
  MEMBER = 30,                // 会员
  PREMIUM = 40,               // 高级会员
  CO_CREATOR = 50,            // 共创
  FOUNDER = 319               // 创始人
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',            // 管理员
  COACH = 'coach',            // 讲师
  STUDENT = 'student',        // 学员
  VOLUNTEER = 'volunteer'     // 志愿者
}

// 具体功能权限配置
export interface FeaturePermissions {
  // 作品内容权限
  promptPermission: PermissionStatus;          // 提示词查看权限
  sourceCodePermission: PermissionStatus;     // 源码仓库链接权限

  // 互动功能权限
  votePermission: PermissionStatus;           // 投票权限
  commentPermission: PermissionStatus;       // 评论权限
  sharePermission: PermissionStatus;         // 分享权限

  // 上传功能权限
  uploadPermission: PermissionStatus;         // 上传作品权限
  maxUploadsPerDay: number;                    // 每日上传限制（-1表示无限制）

  // 其他功能权限
  downloadPermission: PermissionStatus;       // 下载资源权限
  premiumContentPermission: PermissionStatus; // 高级内容访问权限
  creatorInfoPermission: PermissionStatus;   // 创作者信息查看权限
}

// 权限状态信息
export interface PermissionStatusInfo {
  status: PermissionStatus;
  promptType?: PromptType;
  message: string;
  targetLevel?: number;
  targetLevelName?: string;
}

// 功能权限状态信息
export interface FeaturePermissionStatus {
  prompt: PermissionStatusInfo;
  sourceCode: PermissionStatusInfo;
  vote: PermissionStatusInfo;
  comment: PermissionStatusInfo;
  share: PermissionStatusInfo;
  upload: PermissionStatusInfo & {
    remainingUploads?: number;
  };
  download: PermissionStatusInfo;
  premiumContent: PermissionStatusInfo;
  creatorInfo: PermissionStatusInfo;
}

// 用户等级信息
export interface UserLevelInfo {
  current: number;
  name: string;
  nextLevel?: {
    level: number;
    name: string;
    requiredAction: string;
  };
}

// LevelConfig接口
export interface ILevelConfig {
  id: number;
  level: number;                              // 等级数字
  name: string;                               // 等级名称
  description: string;                        // 等级描述
  color: string;                              // 显示颜色
  icon: string;                               // 显示图标
  isActive: boolean;                          // 是否启用

  // 细粒度权限配置
  permissions: FeaturePermissions;

  // 升级规则
  upgradeCondition?: string;                  // 升级条件描述
  priceRange?: {                              // 价格区间（如果需要付费升级）
    min: number;
    max: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// 作品详情页权限响应
export interface WorkDetailPermissionResponse {
  // 基本信息（所有用户可见）
  id: number;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  author: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  votes: number;
  createdAt: Date;

  // 权限控制内容（根据状态决定显示内容）
  prompt?: string;
  repositoryUrl?: string;

  // 权限状态信息（只包含需要显示的权限状态）
  permissionStatus: {
    // 只返回非HIDDEN状态的权限信息
    prompt?: PermissionStatusInfo;
    sourceCode?: PermissionStatusInfo;
    vote?: PermissionStatusInfo;
    comment?: PermissionStatusInfo;
    upload?: PermissionStatusInfo & {
      remainingUploads?: number;
    };
    premiumContent?: PermissionStatusInfo;
  };

  // 用户当前等级信息
  userLevel: UserLevelInfo;
}

// 权限检查请求接口
export interface FeatureRequest {
  user?: {
    userId: number;
    userLevel: number;
    role: UserRole;
  };
  featureAccess?: {
    status: PermissionStatus;
    message?: string;
    action?: string;
    userLevel?: number;
    levelName?: string;
    isLoggedIn?: boolean;
  };
}

// 权限配置映射类型
export type PermissionConfigType = {
  [key: string]: {
    [level: number]: {
      status: PermissionStatus;
      targetLevel?: number;
    };
  };
};

// 预定义的权限配置
export const DEFAULT_PERMISSION_CONFIG: PermissionConfigType = {
  prompt: {
    10: { status: PermissionStatus.PROMPT },      // 游客：提示登录
    20: { status: PermissionStatus.PROMPT, targetLevel: 30 }, // 用户：提示升级到会员
    30: { status: PermissionStatus.VISIBLE },      // 会员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  sourceCode: {
    10: { status: PermissionStatus.HIDDEN },      // 游客：隐藏
    20: { status: PermissionStatus.HIDDEN },      // 用户：隐藏
    30: { status: PermissionStatus.PROMPT, targetLevel: 40 }, // 学员：提示升级到高级会员
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  vote: {
    10: { status: PermissionStatus.PROMPT },      // 游客：提示登录
    20: { status: PermissionStatus.VISIBLE },      // 用户：可见
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  comment: {
    10: { status: PermissionStatus.PROMPT },      // 游客：提示登录
    20: { status: PermissionStatus.VISIBLE },      // 用户：可见
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  share: {
    10: { status: PermissionStatus.HIDDEN },      // 游客：隐藏
    20: { status: PermissionStatus.VISIBLE },      // 用户：可见
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  upload: {
    10: { status: PermissionStatus.HIDDEN },      // 游客：隐藏
    20: { status: PermissionStatus.PROMPT, targetLevel: 30 }, // 用户：提示升级到学员
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  download: {
    10: { status: PermissionStatus.HIDDEN },      // 游客：隐藏
    20: { status: PermissionStatus.HIDDEN },      // 用户：隐藏
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  premiumContent: {
    10: { status: PermissionStatus.HIDDEN },      // 游客：隐藏
    20: { status: PermissionStatus.HIDDEN },      // 用户：隐藏
    30: { status: PermissionStatus.PROMPT, targetLevel: 40 }, // 学员：提示升级到高级会员
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  },
  creatorInfo: {
    10: { status: PermissionStatus.VISIBLE },      // 游客：可见
    20: { status: PermissionStatus.VISIBLE },      // 用户：可见
    30: { status: PermissionStatus.VISIBLE },      // 学员：可见
    40: { status: PermissionStatus.VISIBLE },      // 高级会员：可见
    50: { status: PermissionStatus.VISIBLE },      // 共创：可见
    319: { status: PermissionStatus.VISIBLE }     // 创始人：可见
  }
};

// 每日上传限制配置
export const UPLOAD_LIMITS: { [level: number]: number } = {
  10: 0,     // 游客：不能上传
  20: 0,     // 用户：不能上传
  30: 3,     // 学员：3个/天
  40: 10,    // 高级会员：10个/天
  50: 20,    // 共创：20个/天
  319: -1    // 创始人：无限制
};

// 等级名称映射
export const LEVEL_NAMES: { [level: number]: string } = {
  10: '游客',
  20: '用户',
  30: '会员',
  40: '高级会员',
  50: '共创',
  319: '创始人'
};