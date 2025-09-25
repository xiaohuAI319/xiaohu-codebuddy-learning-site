import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  type: 'membership' | 'course' | 'camp';
  amount: number;
  originalAmount: number;
  discountAmount: number;
  membershipTier?: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId; // 课程或训练营ID
  serialNumber?: string;
  couponCode?: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  activatedAt?: Date;
  expiresAt?: Date;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['membership', 'course', 'camp'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  membershipTier: {
    type: Schema.Types.ObjectId,
    ref: 'MembershipTier'
  },
  targetId: {
    type: Schema.Types.ObjectId,
    refPath: 'type'
  },
  serialNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  couponCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },
  activatedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
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
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ serialNumber: 1 });
PaymentSchema.index({ type: 1, status: 1 });
PaymentSchema.index({ expiresAt: 1 });

// 实例方法：激活支付
PaymentSchema.methods.activate = function() {
  this.status = 'active';
  this.activatedAt = new Date();
  return this.save();
};

// 实例方法：检查是否过期
PaymentSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

export default mongoose.model<IPayment>('Payment', PaymentSchema);