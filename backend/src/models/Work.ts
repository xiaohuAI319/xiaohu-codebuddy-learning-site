import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Work属性接口
export interface WorkAttributes {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  htmlFile?: string;
  link?: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'other';
  bootcamp?: string;
  author: number;
  votes: number;
  isPinned: boolean;
  visibility: 'public' | 'private';
  // 分层内容字段
  previewContent?: string;    // 所有人可见的预览内容
  basicContent?: string;      // 学员及以上可见的基础内容
  advancedContent?: string;   // 会员及以上可见的高级内容
  premiumContent?: string;    // 高级会员及以上可见的高端内容
  sourceCode?: string;        // 源码内容，根据等级控制显示
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
  public htmlFile?: string;
  public link?: string;
  public category!: 'web' | 'mobile' | 'desktop' | 'ai' | 'other';
  public bootcamp?: string;
  public author!: number;
  public votes!: number;
  public isPinned!: boolean;
  public visibility!: 'public' | 'private';
  // 分层内容字段
  public previewContent?: string;
  public basicContent?: string;
  public advancedContent?: string;
  public premiumContent?: string;
  public sourceCode?: string;
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
    // 分层内容字段
    previewContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '所有人可见的预览内容',
    },
    basicContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '学员及以上可见的基础内容',
    },
    advancedContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '会员及以上可见的高级内容',
    },
    premiumContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '高级会员及以上可见的高端内容',
    },
    sourceCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '源码内容，根据用户等级控制显示',
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