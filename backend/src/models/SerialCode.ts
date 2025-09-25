import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ISerialCode {
  id: number;
  code: string;
  membershipTierId: number;
  isUsed: boolean;
  usedById?: number;
  usedAt?: Date;
  validFrom: Date;
  validTo: Date;
  batchId: string;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SerialCodeCreationAttributes extends Optional<ISerialCode, 'id' | 'createdAt' | 'updatedAt'> {}

class SerialCode extends Model<ISerialCode, SerialCodeCreationAttributes> implements ISerialCode {
  public id!: number;
  public code!: string;
  public membershipTierId!: number;
  public isUsed!: boolean;
  public usedById?: number;
  public usedAt?: Date;
  public validFrom!: Date;
  public validTo!: Date;
  public batchId!: string;
  public createdById!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SerialCode.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  membershipTierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membership_tiers',
      key: 'id'
    }
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  usedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false
  },
  validTo: {
    type: DataTypes.DATE,
    allowNull: false
  },
  batchId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  modelName: 'SerialCode',
  tableName: 'serial_codes',
  indexes: [
    { fields: ['code'] },
    { fields: ['isUsed'] },
    { fields: ['membershipTierId'] },
    { fields: ['batchId'] },
    { fields: ['createdById'] }
  ]
});

export default SerialCode;