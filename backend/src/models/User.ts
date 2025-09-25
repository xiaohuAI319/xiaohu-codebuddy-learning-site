import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname: string;
  role: 'admin' | 'coach' | 'student' | 'volunteer';
  avatar?: string;
  bio?: string;
  joinDate: Date;
  isActive: boolean;
  
  // 会员体系相关字段
  membershipTierId?: number;
  currentLevel: string;
  totalSpent: number;
  totalPaid: number;
  membershipExpiry?: Date;
  availableCoupons: string[];
  usedCoupons: number[];
  paymentHistory: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname!: string;
  public role!: 'admin' | 'coach' | 'student' | 'volunteer';
  public avatar?: string;
  public bio?: string;
  public joinDate!: Date;
  public isActive!: boolean;
  
  public membershipTierId?: number;
  public currentLevel!: string;
  public totalSpent!: number;
  public totalPaid!: number;
  public membershipExpiry?: Date;
  public availableCoupons!: string[];
  public usedCoupons!: number[];
  public paymentHistory!: string[];
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 实例方法
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async getCurrentTier(): Promise<any> {
    if (!this.membershipTierId) {
      const MembershipTier = sequelize.models.MembershipTier as any;
      return await MembershipTier.getTierByAmount(this.totalSpent);
    }
    const MembershipTier = sequelize.models.MembershipTier;
    return await MembershipTier.findByPk(this.membershipTierId);
  }

  public async hasPermission(permission: string): Promise<boolean> {
    if (this.role === 'admin') return true;
    
    const tier = await this.getCurrentTier();
    if (!tier) return false;
    
    return tier.permissions[permission] === true;
  }

  public toJSON(): Partial<IUser> {
    const values = Object.assign({}, this.get()) as any;
    delete values.password;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'coach', 'student', 'volunteer'),
    allowNull: false,
    defaultValue: 'student'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  membershipTierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'membership_tiers',
      key: 'id'
    }
  },
  currentLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '学员'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  totalPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  membershipExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  availableCoupons: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('availableCoupons') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: string[]) {
      this.setDataValue('availableCoupons', JSON.stringify(value) as any);
    }
  },
  usedCoupons: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('usedCoupons') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: number[]) {
      this.setDataValue('usedCoupons', JSON.stringify(value) as any);
    }
  },
  paymentHistory: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('paymentHistory') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: string[]) {
      this.setDataValue('paymentHistory', JSON.stringify(value) as any);
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
  modelName: 'User',
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['membershipTierId'] },
    { fields: ['role'] }
  ],
  hooks: {
    beforeSave: async (user: User) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User;