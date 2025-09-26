import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IMembershipUpgrade {
  id: number;
  userId: number;
  fromLevel: string;
  toLevel: string;
  upgradeType: 'admin' | 'serial';
  operatorId?: number;
  serialCodeId?: number;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MembershipUpgradeCreationAttributes extends Optional<IMembershipUpgrade, 'id' | 'createdAt' | 'updatedAt'> {}

class MembershipUpgrade extends Model<IMembershipUpgrade, MembershipUpgradeCreationAttributes> implements IMembershipUpgrade {
  public id!: number;
  public userId!: number;
  public fromLevel!: string;
  public toLevel!: string;
  public upgradeType!: 'admin' | 'serial';
  public operatorId?: number;
  public serialCodeId?: number;
  public reason?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 静态方法：记录升级历史
  public static async recordUpgrade(data: {
    userId: number;
    fromLevel: string;
    toLevel: string;
    upgradeType: 'admin' | 'serial';
    operatorId?: number;
    serialCodeId?: number;
    reason?: string;
  }): Promise<MembershipUpgrade> {
    return await MembershipUpgrade.create(data);
  }

  // 静态方法：获取用户升级历史
  public static async getUserUpgradeHistory(userId: number): Promise<MembershipUpgrade[]> {
    return await MembershipUpgrade.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  // 静态方法：获取所有升级记录（管理员查看）
  public static async getAllUpgradeHistory(limit: number = 100): Promise<MembershipUpgrade[]> {
    return await MembershipUpgrade.findAll({
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

MembershipUpgrade.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fromLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '升级前等级'
  },
  toLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '升级后等级'
  },
  upgradeType: {
    type: DataTypes.ENUM('admin', 'serial'),
    allowNull: false,
    comment: '升级方式：admin-管理员手动升级，serial-序列号激活'
  },
  operatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '操作管理员ID（仅admin升级时有值）'
  },
  serialCodeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'serial_codes',
      key: 'id'
    },
    comment: '使用的序列号ID（仅serial升级时有值）'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '升级原因或备注'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'MembershipUpgrade',
  tableName: 'membership_upgrades',
  indexes: [
    { fields: ['userId'] },
    { fields: ['upgradeType'] },
    { fields: ['operatorId'] },
    { fields: ['serialCodeId'] },
    { fields: ['createdAt'] }
  ]
});

export default MembershipUpgrade;