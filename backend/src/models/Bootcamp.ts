import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IBootcamp {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  instructorIds: number[];
  studentIds: number[];
  maxStudents: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface BootcampCreationAttributes extends Optional<IBootcamp, 'id' | 'createdAt' | 'updatedAt'> {}

class Bootcamp extends Model<IBootcamp, BootcampCreationAttributes> implements IBootcamp {
  public id!: number;
  public name!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public isActive!: boolean;
  public instructorIds!: number[];
  public studentIds!: number[];
  public maxStudents!: number;
  public tags!: string[];
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bootcamp.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  instructorIds: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('instructorIds') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: number[]) {
      this.setDataValue('instructorIds', JSON.stringify(value) as any);
    }
  },
  studentIds: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('studentIds') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: number[]) {
      this.setDataValue('studentIds', JSON.stringify(value) as any);
    }
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 1
    }
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags') as unknown as string;
      return value ? JSON.parse(value) : [];
    },
    set(value: string[]) {
      this.setDataValue('tags', JSON.stringify(value) as any);
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
  modelName: 'Bootcamp',
  tableName: 'bootcamps',
  indexes: [
    { fields: ['name'] },
    { fields: ['isActive'] },
    { fields: ['startDate', 'endDate'] }
  ]
});

export default Bootcamp;