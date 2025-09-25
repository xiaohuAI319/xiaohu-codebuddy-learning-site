import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引
CategorySchema.index({ order: 1 });
CategorySchema.index({ isActive: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);