/**
 * 内容过滤工具 - 根据用户等级控制作品内容显示
 */

// 用户等级枚举
export enum UserLevel {
  VISITOR = 0,      // 访客（未登录）
  USER = 1,         // 用户
  STUDENT = 2,      // 学员
  ADVANCED_STUDENT = 3, // 高级学员
  INSTRUCTOR = 4,   // 讲师
  ADMIN = 5         // 管理员
}

// 等级映射
const LEVEL_MAP: { [key: string]: UserLevel } = {
  '用户': UserLevel.USER,
  '学员': UserLevel.STUDENT,
  '高级学员': UserLevel.ADVANCED_STUDENT,
  '讲师': UserLevel.INSTRUCTOR,
  '管理员': UserLevel.ADMIN
};

/**
 * 获取用户等级数值
 */
export function getUserLevelValue(userLevel?: string, isLoggedIn: boolean = false): UserLevel {
  if (!isLoggedIn || !userLevel) {
    return UserLevel.VISITOR;
  }
  
  return LEVEL_MAP[userLevel] || UserLevel.VISITOR;
}

/**
 * 根据用户等级过滤作品内容
 */
export function filterWorkContent(work: any, userLevel: UserLevel, isAdmin: boolean = false): any {
  // 管理员可以看到所有内容
  if (isAdmin) {
    return work;
  }

  const filteredWork: any = {
    id: work.id,
    title: work.title,
    description: work.description,
    coverImage: work.coverImage,
    category: work.category,
    tags: work.tags,
    bootcamp: work.bootcamp,
    votes: work.votes,
    isPinned: work.isPinned,
    visibility: work.visibility,
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    author: work.author,
    authorUser: (work as any).authorUser,
    // 基础内容 - 所有人都可以看到
    link: work.link,
    htmlFile: work.htmlFile
  };

  // 提示词权限控制：学员级别及以上可以看到
  if (userLevel >= UserLevel.STUDENT && work.prompt) {
    filteredWork.prompt = work.prompt;
  }

  // 源码仓库链接权限控制：学员级别及以上可以看到，但前端会控制显示
  if (userLevel >= UserLevel.STUDENT && work.repositoryUrl) {
    filteredWork.repositoryUrl = work.repositoryUrl;
  }

  return filteredWork;
}

/**
 * 批量过滤作品列表内容
 */
export function filterWorksList(works: any[], userLevel: UserLevel, isAdmin: boolean = false): any[] {
  return works.map(work => filterWorkContent(work, userLevel, isAdmin));
}

/**
 * 检查用户是否有权限查看作品
 */
export function canViewWork(work: any, userLevel: UserLevel, isAdmin: boolean = false, isAuthor: boolean = false): boolean {
  // 管理员和作者可以查看所有作品
  if (isAdmin || isAuthor) {
    return true;
  }

  // 私有作品只有作者和管理员可以查看
  if (work.visibility === 'private') {
    return false;
  }

  // 公开作品所有人都可以查看
  return true;
}