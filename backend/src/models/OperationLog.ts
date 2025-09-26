import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IOperationLog {
  id: number;
  userId?: number;
  operatorId?: number;
  operationType: string;
  operationDetail: string;
  targetUserId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OperationLogCreationAttributes extends Optional<IOperationLog, 'id' | 'createdAt' | 'updatedAt'> {}

class OperationLog extends Model<IOperationLog, OperationLogCreationAttributes> implements IOperationLog {
  public id!: number;
  public userId?: number;
  public operatorId?: number;
  public operationType!: string;
  public operationDetail!: string;
  public targetUserId?: number;
  public oldValue?: string;
  public newValue?: string;
  public ipAddress?: string;
  public userAgent?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 静态方法：记录操作日志
  public static async logOperation(data: {
    userId?: number;
    operatorId?: number;
    operationType: string;
    operationDetail: string;
    targetUserId?: number;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<OperationLog> {
    return await OperationLog.create(data);
  }

  // 静态方法：获取用户操作历史
  public static async getUserOperations(userId: number, limit: number = 50): Promise<OperationLog[]> {
    return await OperationLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  // 静态方法：获取管理员操作历史
  public static async getAdminOperations(operatorId: number, limit: number = 100): Promise<OperationLog[]> {
    return await OperationLog.findAll({
      where: { operatorId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

OperationLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  operatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  operationType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型：register, login, upload, update_profile, admin_upgrade, serial_activate等'
  },
  operationDetail: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '操作详细描述'
  },
  targetUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '被操作的用户ID（如管理员升级其他用户时）'
  },
  oldValue: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '操作前的值'
  },
  newValue: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '操作后的值'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: '操作IP地址'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户代理信息'
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
  modelName: 'OperationLog',
  tableName: 'operation_logs',
  indexes: [
    { fields: ['userId'] },
    { fields: ['operatorId'] },
    { fields: ['operationType'] },
    { fields: ['targetUserId'] },
    { fields: ['createdAt'] }
  ]
});

export default OperationLog;