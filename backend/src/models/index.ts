import sequelize from '../config/database';
import User from './User';
import Work from './Work';
import MembershipTier from './MembershipTier';
import Bootcamp from './Bootcamp';
import Coupon from './Coupon';
import SerialCode from './SerialCode';
import OperationLog from './OperationLog';
import MembershipUpgrade from './MembershipUpgrade';
import Vote from './Vote';

// 定义模型关联
User.belongsTo(MembershipTier, { 
  foreignKey: 'membershipTierId', 
  as: 'membershipTier' 
});

MembershipTier.hasMany(User, { 
  foreignKey: 'membershipTierId', 
  as: 'users' 
});

SerialCode.belongsTo(MembershipTier, { 
  foreignKey: 'membershipTierId', 
  as: 'membershipTier' 
});

SerialCode.belongsTo(User, { 
  foreignKey: 'createdById', 
  as: 'creator' 
});

SerialCode.belongsTo(User, { 
  foreignKey: 'usedById', 
  as: 'usedBy' 
});

Coupon.belongsTo(User, { 
  foreignKey: 'createdById', 
  as: 'creator' 
});

// Work和User关联
Work.belongsTo(User, {
  foreignKey: 'author',
  as: 'authorUser'
});

User.hasMany(Work, {
  foreignKey: 'author',
  as: 'works'
});

// 操作日志关联
OperationLog.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

OperationLog.belongsTo(User, { 
  foreignKey: 'operatorId', 
  as: 'operator' 
});

OperationLog.belongsTo(User, { 
  foreignKey: 'targetUserId', 
  as: 'targetUser' 
});

// 会员升级记录关联
MembershipUpgrade.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

MembershipUpgrade.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator'
});

MembershipUpgrade.belongsTo(SerialCode, {
  foreignKey: 'serialCodeId',
  as: 'serialCode'
});

// 投票记录关联
Vote.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Vote.belongsTo(Work, {
  foreignKey: 'workId',
  as: 'work'
});

User.hasMany(Vote, {
  foreignKey: 'userId',
  as: 'userVotes'
});

Work.hasMany(Vote, {
  foreignKey: 'workId',
  as: 'voteRecords'
});

// 导出所有模型和数据库连接
export {
  sequelize,
  User,
  Work,
  MembershipTier,
  Bootcamp,
  Coupon,
  SerialCode,
  OperationLog,
  MembershipUpgrade,
  Vote
};

export default sequelize;