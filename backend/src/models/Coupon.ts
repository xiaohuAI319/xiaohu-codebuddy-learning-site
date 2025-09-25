import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ICoupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableTierIds: number[];
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CouponCreationAttributes extends Optional<ICoupon, 'id' | 'createdAt' | 'updatedAt'> {}

class Coupon extends Model<ICoupon, CouponCreationAttributes> implements ICoupon {
  public id!: number;
  public code!: string;
  public name!: string;
  public description!: string;
  public discountType!: 'percentage' | 'fixed';
  public discountValue!: number;
  public minPurchaseAmount!: number;
  public maxDiscountAmount?: number;
  public usageLimit!: number;
  public usedCount!: number;
  public validFrom!: Date;
  public validTo!: Date;
  public isActive!: boolean;
  public applicableTierIds!: number[];
  public createdById!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false
  },
  validTo: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  applicableTierIds: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('applicableTierIds') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: number[]) {
      this.setDataValue('applicableTierIds', JSON.stringify(value) as any);
    }
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
  modelName: 'Coupon',
  tableName: 'coupons',
  indexes: [
    { fields: ['code'] },
    { fields: ['isActive'] },
    { fields: ['validFrom', 'validTo'] },
    { fields: ['createdById'] }
  ]
});

export default Coupon;