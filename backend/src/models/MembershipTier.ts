import mongoose, { Document, Schema } from 'mongoose';

export interface IMembershipTier extends Document {
  name: string;
  minAmount: number;
  maxAmount: number;
  permissions: string[];
  order: number;
  isActive: boolean;
  description: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MembershipTierSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  minAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maxAmount: {
    type: Number,
    required: true,
    validate: {
      validator: function(this: IMembershipTier, value: number) {
        return value > this.minAmount;
      },
      message: 'maxAmount must be greater than minAmount'
    }
  },
  permissions: [{
    type: String,
    required: true
  }],
  order: {
    type: Number,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

// 索引
MembershipTierSchema.index({ order: 1 });
MembershipTierSchema.index({ isActive: 1 });
MembershipTierSchema.index({ minAmount: 1, maxAmount: 1 });

// 静态方法：根据金额获取会员等级
MembershipTierSchema.statics.getTierByAmount = function(amount: number) {
  return this.findOne({
    minAmount: { $lte: amount },
    maxAmount: { $gte: amount },
    isActive: true
  }).sort({ order: 1 });
};

// 静态方法：获取所有激活的等级
MembershipTierSchema.statics.getActiveTiers = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

export default mongoose.model<IMembershipTier>('MembershipTier', MembershipTierSchema);