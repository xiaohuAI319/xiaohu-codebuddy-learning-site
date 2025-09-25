import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Category属性接口
export interface CategoryAttributes {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 创建Category时的可选属性
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'order' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// Category模型类
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public order!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 定义Category模型
Category.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200],
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
    indexes: [
      {
        fields: ['order'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Category;