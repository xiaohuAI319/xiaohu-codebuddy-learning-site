import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import {
  ILevelConfig,
  FeaturePermissions,
  PermissionStatus,
  DEFAULT_PERMISSION_CONFIG,
  UPLOAD_LIMITS
} from '../types/permissions';

interface LevelConfigCreationAttributes extends Optional<ILevelConfig, 'id' | 'createdAt' | 'updatedAt'> {}

class LevelConfig extends Model<ILevelConfig, LevelConfigCreationAttributes> implements ILevelConfig {
  public id!: number;
  public level!: number;
  public name!: string;
  public description!: string;
  public color!: string;
  public icon!: string;
  public isActive!: boolean;
  public permissions!: FeaturePermissions;
  public upgradeCondition?: string;
  public priceRange?: { min: number; max: number };

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 静态方法：根据等级获取配置
  public static async getConfigByLevel(level: number): Promise<LevelConfig | null> {
    return await LevelConfig.findOne({
      where: {
        level,
        isActive: true
      }
    });
  }

  // 静态方法：获取所有激活的等级配置
  public static async getActiveConfigs(): Promise<LevelConfig[]> {
    return await LevelConfig.findAll({
      where: { isActive: true },
      order: [['level', 'ASC']]
    });
  }

  // 静态方法：获取用户权限配置
  public static async getUserPermissions(userLevel: number): Promise<FeaturePermissions> {
    // 首先尝试从数据库获取配置
    const config = await LevelConfig.getConfigByLevel(userLevel);
    if (config) {
      return config.permissions;
    }

    // 如果没有数据库配置，使用默认配置
    return LevelConfig.getDefaultPermissions(userLevel);
  }

  // 静态方法：获取默认权限配置
  public static getDefaultPermissions(userLevel: number): FeaturePermissions {
    const defaultConfig = DEFAULT_PERMISSION_CONFIG;

    return {
      promptPermission: defaultConfig.prompt?.[userLevel]?.status || PermissionStatus.HIDDEN,
      sourceCodePermission: defaultConfig.sourceCode?.[userLevel]?.status || PermissionStatus.HIDDEN,
      votePermission: defaultConfig.vote?.[userLevel]?.status || PermissionStatus.HIDDEN,
      commentPermission: defaultConfig.comment?.[userLevel]?.status || PermissionStatus.HIDDEN,
      sharePermission: defaultConfig.share?.[userLevel]?.status || PermissionStatus.HIDDEN,
      uploadPermission: defaultConfig.upload?.[userLevel]?.status || PermissionStatus.HIDDEN,
      maxUploadsPerDay: UPLOAD_LIMITS[userLevel] || 0,
      downloadPermission: defaultConfig.download?.[userLevel]?.status || PermissionStatus.HIDDEN,
      premiumContentPermission: defaultConfig.premiumContent?.[userLevel]?.status || PermissionStatus.HIDDEN,
      creatorInfoPermission: defaultConfig.creatorInfo?.[userLevel]?.status || PermissionStatus.HIDDEN
    };
  }

  // 静态方法：初始化默认等级配置
  public static async initializeDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        level: 10,
        name: '游客',
        description: '未登录游客，基础功能受限',
        color: '#9CA3AF',
        icon: '👤',
        permissions: LevelConfig.getDefaultPermissions(10),
        upgradeCondition: '注册登录成为用户',
        isActive: true
      },
      {
        level: 20,
        name: '用户',
        description: '注册用户，可使用基础功能',
        color: '#3B82F6',
        icon: '🔵',
        permissions: LevelConfig.getDefaultPermissions(20),
        upgradeCondition: '升级到会员获取更多权限',
        isActive: true
      },
      {
        level: 30,
        name: '会员',
        description: '付费会员，可查看基础内容和上传作品',
        color: '#10B981',
        icon: '🟢',
        permissions: LevelConfig.getDefaultPermissions(30),
        upgradeCondition: '升级到高级会员查看源码',
        isActive: true
      },
      {
        level: 40,
        name: '高级会员',
        description: '高级会员，可查看源码和高级内容',
        color: '#8B5CF6',
        icon: '🟣',
        permissions: LevelConfig.getDefaultPermissions(40),
        upgradeCondition: '升级到共创获得更多权限',
        isActive: true
      },
      {
        level: 50,
        name: '共创',
        description: '共创伙伴，拥有高级创作权限',
        color: '#F59E0B',
        icon: '🟡',
        permissions: LevelConfig.getDefaultPermissions(50),
        upgradeCondition: '升级到创始人获得最高权限',
        isActive: true
      },
      {
        level: 319,
        name: '创始人',
        description: '创始人级别，拥有所有权限',
        color: '#EF4444',
        icon: '👑',
        permissions: LevelConfig.getDefaultPermissions(319),
        upgradeCondition: '最高等级，拥有所有权限',
        isActive: true
      }
    ];

    for (const config of defaultConfigs) {
      await LevelConfig.findOrCreate({
        where: { level: config.level },
        defaults: config
      });
    }
  }

  // 实例方法：检查是否有特定权限
  public hasPermission(feature: keyof FeaturePermissions): boolean {
    return (this.permissions[feature] as PermissionStatus) === PermissionStatus.VISIBLE;
  }

  // 实例方法：获取权限状态
  public getPermissionStatus(feature: keyof FeaturePermissions): PermissionStatus {
    const status = this.permissions[feature];
    return (typeof status === 'number' ? status : status) as PermissionStatus;
  }

  // 实例方法：转换为JSON时的处理
  public toJSON(): Partial<ILevelConfig> {
    const values = Object.assign({}, this.get()) as any;
    return values;
  }
}

LevelConfig.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      min: 1,
      isUniqueLevel: async (value: number) => {
        const existing = await LevelConfig.findOne({ where: { level: value } });
        if (existing && existing.id !== (this as any).id) {
          throw new Error('等级必须唯一');
        }
      }
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [1, 20]
    }
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [1, 10]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('permissions') as unknown as string;
      try {
        return value ? JSON.parse(value) : LevelConfig.getDefaultPermissions(this.level);
      } catch (error) {
        console.error('解析权限配置失败:', error);
        return LevelConfig.getDefaultPermissions(this.level);
      }
    },
    set(value: FeaturePermissions) {
      try {
        this.setDataValue('permissions', JSON.stringify(value) as any);
      } catch (error) {
        console.error('设置权限配置失败:', error);
        this.setDataValue('permissions', JSON.stringify(LevelConfig.getDefaultPermissions(this.level)) as any);
      }
    }
  },
  upgradeCondition: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  priceRange: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('priceRange') as unknown as string;
      try {
        return value ? JSON.parse(value) : undefined;
      } catch (error) {
        console.error('解析价格区间失败:', error);
        return undefined;
      }
    },
    set(value: { min: number; max: number } | undefined) {
      try {
        this.setDataValue('priceRange', value ? JSON.stringify(value) as any : undefined);
      } catch (error) {
        console.error('设置价格区间失败:', error);
        this.setDataValue('priceRange', undefined);
      }
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
  modelName: 'LevelConfig',
  tableName: 'level_configs',
  indexes: [
    { fields: ['level'] },
    { fields: ['isActive'] },
    { fields: ['name'] }
  ],
  hooks: {
    beforeValidate: (config: LevelConfig) => {
      // 确保权限配置有效
      if (!config.permissions) {
        config.permissions = LevelConfig.getDefaultPermissions(config.level);
      }
    },
    afterCreate: async (config: LevelConfig) => {
      console.log(`创建等级配置: ${config.name} (Level ${config.level})`);
    },
    afterUpdate: async (config: LevelConfig) => {
      console.log(`更新等级配置: ${config.name} (Level ${config.level})`);
    }
  }
});

export default LevelConfig;