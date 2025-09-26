  import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Work属性接口
export interface WorkAttributes {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  slug?: string;
  htmlFile?: string;
  link?: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'other';
  tags?: string;              // 标签，逗号分隔
  repositoryUrl?: string;     // 源码仓库链接，会员级别及以上可见
  bootcamp?: string;
  author: number;
  votes: number;
  isPinned: boolean;
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

// 创建Work时的可选属性
export interface WorkCreationAttributes extends Optional<WorkAttributes, 'id' | 'votes' | 'isPinned' | 'createdAt' | 'updatedAt'> {}

// Work模型类
class Work extends Model<WorkAttributes, WorkCreationAttributes> implements WorkAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public coverImage!: string;
  public slug?: string;
  public htmlFile?: string;
  public link?: string;
  public category!: 'web' | 'mobile' | 'desktop' | 'ai' | 'other';
  public tags?: string;
  public repositoryUrl?: string;
  public bootcamp?: string;
  public author!: number;
  public votes!: number;
  public isPinned!: boolean;
  public visibility!: 'public' | 'private';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联属性
  public readonly authorUser?: any;
}

// 定义Work模型
Work.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000],
      },
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: '用于不可枚举的详情页链接',
    },
    htmlFile: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    category: {
      type: DataTypes.ENUM('web', 'mobile', 'desktop', 'ai', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '标签，逗号分隔',
    },
    repositoryUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
      comment: '源码仓库链接，会员级别及以上可见',
    },
    bootcamp: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'public',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Work',
    tableName: 'Works',
    timestamps: true,
    indexes: [
      {
        fields: ['author'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['bootcamp'],
      },
      {
        fields: ['isPinned', 'votes'],
      },
      {
        fields: ['visibility'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Work;