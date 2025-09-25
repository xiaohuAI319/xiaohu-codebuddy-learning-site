import sequelize from '../config/database';
import User from './User';
import MembershipTier from './MembershipTier';
import Bootcamp from './Bootcamp';
import Coupon from './Coupon';
import SerialCode from './SerialCode';

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

// 导出所有模型和数据库连接
export {
  sequelize,
  User,
  MembershipTier,
  Bootcamp,
  Coupon,
  SerialCode
};

export default sequelize;