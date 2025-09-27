import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VoteAttributes {
  id: number;
  userId: number;
  workId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VoteCreationAttributes extends Optional<VoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Vote extends Model<VoteAttributes, VoteCreationAttributes> implements VoteAttributes {
  public id!: number;
  public userId!: number;
  public workId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    workId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'works',
        key: 'id',
      },
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
    modelName: 'Vote',
    tableName: 'votes',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'workId'],
      },
    ],
  }
);

export default Vote;