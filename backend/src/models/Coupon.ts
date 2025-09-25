import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  applicableTypes: string[];
  applicableTiers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema({
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
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    default: 1,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  applicableTypes: [{
    type: String,
    enum: ['membership', 'course', 'camp']
  }],
  applicableTiers: [{
    type: Schema.Types.ObjectId,
    ref: 'MembershipTier'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 索引
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
CouponSchema.index({ createdBy: 1 });

// 实例方法：检查优惠券是否有效
CouponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTo >= now && 
         this.usedCount < this.usageLimit;
};

// 实例方法：计算折扣金额
CouponSchema.methods.calculateDiscount = function(amount: number) {
  if (!this.isValid() || amount < this.minAmount) {
    return 0;
  }

  let discount = 0;
  if (this.discountType === 'percent') {
    discount = amount * (this.discountValue / 100);
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, amount);
};

// 实例方法：使用优惠券
CouponSchema.methods.use = function() {
  this.usedCount += 1;
  return this.save();
};

export default mongoose.model<ICoupon>('Coupon', CouponSchema);