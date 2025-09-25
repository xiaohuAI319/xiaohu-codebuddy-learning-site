import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

export interface IMembershipTier {
  id: number;
  name: string;
  level: number;
  priceRangeMin: number;
  priceRangeMax: number;
  color: string;
  icon: string;
  description: string;
  benefits: string[];
  permissions: {
    canViewBasic: boolean;
    canViewAdvanced: boolean;
    canViewPremium: boolean;
    canViewSource: boolean;
    canUploadWorks: boolean;
    canVote: boolean;
    maxUploadsPerDay: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MembershipTierCreationAttributes extends Optional<IMembershipTier, 'id' | 'createdAt' | 'updatedAt'> {}

class MembershipTier extends Model<IMembershipTier, MembershipTierCreationAttributes> implements IMembershipTier {
  public id!: number;
  public name!: string;
  public level!: number;
  public priceRangeMin!: number;
  public priceRangeMax!: number;
  public color!: string;
  public icon!: string;
  public description!: string;
  public benefits!: string[];
  public permissions!: {
    canViewBasic: boolean;
    canViewAdvanced: boolean;
    canViewPremium: boolean;
    canViewSource: boolean;
    canUploadWorks: boolean;
    canVote: boolean;
    maxUploadsPerDay: number;
  };
  public isActive!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 静态方法
  public static async getTierByAmount(amount: number): Promise<MembershipTier | null> {
    return await MembershipTier.findOne({
      where: {
        priceRangeMin: { [Op.lte]: amount },
        priceRangeMax: { [Op.gte]: amount },
        isActive: true
      },
      order: [['level', 'ASC']]
    });
  }

  public static async getActiveTiers(): Promise<MembershipTier[]> {
    return await MembershipTier.findAll({
      where: { isActive: true },
      order: [['level', 'ASC']]
    });
  }
}

MembershipTier.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      min: 1
    }
  },
  priceRangeMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  priceRangeMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('benefits') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: string[]) {
      this.setDataValue('benefits', JSON.stringify(value) as any);
    }
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('permissions') as unknown as string;
      return value ? JSON.parse(value) : {};
    },
    set(value: object) {
      this.setDataValue('permissions', JSON.stringify(value) as any);
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  modelName: 'MembershipTier',
  tableName: 'membership_tiers',
  indexes: [
    { fields: ['level'] },
    { fields: ['isActive'] },
    { fields: ['priceRangeMin', 'priceRangeMax'] }
  ],
  validate: {
    priceRangeValid() {
      const tier = this as any;
      if (tier.priceRangeMax <= tier.priceRangeMin) {
        throw new Error('最大价格必须大于最小价格');
      }
    }
  }
});

export default MembershipTier;