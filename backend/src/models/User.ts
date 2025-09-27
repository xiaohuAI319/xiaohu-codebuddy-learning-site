import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { UserRole, UserLevel, FeaturePermissions, PermissionStatus } from '../types/permissions';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  joinDate: Date;
  isActive: boolean;

  // 新的权限体系字段
  userLevel: number;                              // 用户等级数字
  totalSpent: number;                            // 总消费金额（保留用于统计）
  totalPaid: number;                             // 总支付金额（保留用于统计）
  membershipExpiry?: Date;                       // 会员到期时间（保留用于兼容）

  // 优惠券相关（保留用于兼容）
  availableCoupons: string[];
  usedCoupons: number[];
  paymentHistory: string[];

  // 兼容性字段（标记为废弃）
  membershipTierId?: number;                     // 【废弃】使用userLevel替代
  levelName?: string;                             // 【废弃】使用userLevel替代

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
  public role!: UserRole;
  public avatar?: string;
  public bio?: string;
  public joinDate!: Date;
  public isActive!: boolean;

  // 新的权限体系字段
  public userLevel!: number;
  public totalSpent!: number;
  public totalPaid!: number;
  public membershipExpiry?: Date;

  // 优惠券相关字段
  public availableCoupons!: string[];
  public usedCoupons!: number[];
  public paymentHistory!: string[];

  // 兼容性字段
  public membershipTierId?: number;
  public levelName?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 实例方法
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // 获取用户权限配置
  public async getPermissions(): Promise<FeaturePermissions> {
    const LevelConfig = sequelize.models.LevelConfig as any;
    return await LevelConfig.getUserPermissions(this.userLevel);
  }

  // 检查特定功能权限状态
  public async getPermissionStatus(feature: keyof FeaturePermissions): Promise<PermissionStatus> {
    const permissions = await this.getPermissions();
    const status = permissions[feature];
    return (typeof status === 'number' ? status : status) as PermissionStatus;
  }

  // 检查是否有特定功能的可见权限
  public async hasVisiblePermission(feature: keyof FeaturePermissions): Promise<boolean> {
    const status = await this.getPermissionStatus(feature);
    return status === PermissionStatus.VISIBLE;
  }

  // 获取用户等级配置
  public async getLevelConfig() {
    const LevelConfig = sequelize.models.LevelConfig as any;
    return await LevelConfig.getConfigByLevel(this.userLevel);
  }

  // 获取用户等级名称
  public getLevelName(): string {
    const levelNames: { [key: number]: string } = {
      10: '游客',
      20: '用户',
      30: '会员',
      40: '高级会员',
      50: '共创',
      319: '创始人'
    };
    return levelNames[this.userLevel] || '未知等级';
  }

  // 检查是否为管理员
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // 检查是否为讲师
  public isCoach(): boolean {
    return this.role === UserRole.COACH;
  }

  // 兼容性方法：获取当前等级（字符串形式）
  public getCurrentLevelName(): string {
    return this.getLevelName();
  }

  // 兼容性方法：获取当前等级数字
  public getCurrentLevel(): number {
    return this.userLevel;
  }

  // 兼容性方法：权限检查（返回boolean）
  public async hasPermission(permission: string): Promise<boolean> {
    // 管理员拥有所有权限
    if (this.isAdmin()) return true;

    try {
      const permissions = await this.getPermissions();
      return permissions[permission as keyof FeaturePermissions] === PermissionStatus.VISIBLE;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }

  // 升级用户等级
  public async upgradeLevel(newLevel: number): Promise<void> {
    this.userLevel = newLevel;
    await this.save();
  }

  // 获取每日上传限制
  public async getDailyUploadLimit(): Promise<number> {
    const permissions = await this.getPermissions();
    return permissions.maxUploadsPerDay;
  }

  // 检查是否可以上传作品
  public async canUploadWork(): Promise<boolean> {
    return await this.hasVisiblePermission('uploadPermission');
  }

  // 检查是否可以投票
  public async canVote(): Promise<boolean> {
    return await this.hasVisiblePermission('votePermission');
  }

  // 检查是否可以查看提示词
  public async canViewPrompt(): Promise<boolean> {
    return await this.hasVisiblePermission('promptPermission');
  }

  // 检查是否可以查看源码
  public async canViewSourceCode(): Promise<boolean> {
    return await this.hasVisiblePermission('sourceCodePermission');
  }

  // 序列化时隐藏敏感信息
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
    type: DataTypes.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.STUDENT
  },

  // 新的权限体系字段
  userLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20, // 默认用户等级
    validate: {
      min: 10,
      isIn: [[10, 20, 30, 40, 50, 319]] // 允许的等级值
    }
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
  // 兼容性字段（标记为废弃）
  membershipTierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '[废弃] 使用userLevel替代',
    references: {
      model: 'membership_tiers',
      key: 'id'
    }
  },
  levelName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '用户',
    comment: '[废弃] 使用userLevel替代'
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