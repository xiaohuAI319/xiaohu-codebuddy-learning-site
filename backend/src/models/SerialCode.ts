import mongoose, { Document, Schema } from 'mongoose';

export interface ISerialCode extends Document {
  code: string;
  name: string;
  description: string;
  type: 'membership' | 'course' | 'camp';
  targetId: mongoose.Types.ObjectId;
  value: number;
  isUsed: boolean;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SerialCodeSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['membership', 'course', 'camp'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 索引
SerialCodeSchema.index({ code: 1 });
SerialCodeSchema.index({ type: 1, isUsed: 1, isActive: 1 });
SerialCodeSchema.index({ usedBy: 1 });
SerialCodeSchema.index({ expiresAt: 1 });

// 实例方法：检查序列号是否有效
SerialCodeSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         !this.isUsed && 
         (!this.expiresAt || this.expiresAt > now);
};

// 实例方法：使用序列号
SerialCodeSchema.methods.use = function(userId: mongoose.Types.ObjectId) {
  if (!this.isValid()) {
    throw new Error('Serial code is not valid');
  }
  
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  return this.save();
};

// 静态方法：生成序列号
SerialCodeSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default mongoose.model<ISerialCode>('SerialCode', SerialCodeSchema);