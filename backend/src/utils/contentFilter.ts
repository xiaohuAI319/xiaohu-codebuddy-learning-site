/**
 * 内容过滤工具 - 根据用户等级控制作品内容显示
 */

// 用户等级枚举
export enum UserLevel {
  VISITOR = 0,      // 访客（未登录）
  STUDENT = 1,      // 学员
  MEMBER = 2,       // 会员
  ADVANCED = 3,     // 高级会员
  PREMIUM = 4,      // 共创
  INSTRUCTOR = 5    // 讲师
}

// 等级映射
const LEVEL_MAP: { [key: string]: UserLevel } = {
  '学员': UserLevel.STUDENT,
  '会员': UserLevel.MEMBER,
  '高级会员': UserLevel.ADVANCED,
  '共创': UserLevel.PREMIUM,
  '讲师': UserLevel.INSTRUCTOR
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
    bootcamp: work.bootcamp,
    votes: work.votes,
    isPinned: work.isPinned,
    visibility: work.visibility,
    createdAt: work.createdAt,
    author: work.author,
    // 基础内容
    link: work.link,
    htmlFile: work.htmlFile
  };

  // 根据用户等级添加相应内容
  
  // 所有人都可以看到预览内容
  if (work.previewContent) {
    filteredWork.previewContent = work.previewContent;
  }

  // 学员及以上可以看到基础内容
  if (userLevel >= UserLevel.STUDENT && work.basicContent) {
    filteredWork.basicContent = work.basicContent;
  }

  // 会员及以上可以看到高级内容
  if (userLevel >= UserLevel.MEMBER && work.advancedContent) {
    filteredWork.advancedContent = work.advancedContent;
  }

  // 高级会员及以上可以看到高端内容
  if (userLevel >= UserLevel.ADVANCED && work.premiumContent) {
    filteredWork.premiumContent = work.premiumContent;
  }

  // 源码显示控制：会员级别不显示源码，其他级别可以显示
  if (userLevel !== UserLevel.MEMBER && work.sourceCode) {
    // 学员、高级会员、共创、讲师可以看到源码
    if (userLevel === UserLevel.STUDENT || userLevel >= UserLevel.ADVANCED) {
      filteredWork.sourceCode = work.sourceCode;
    }
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