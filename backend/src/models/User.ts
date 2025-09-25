import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  nickname: string;
  role: 'admin' | 'coach' | 'student' | 'volunteer';
  avatar?: string;
  bio?: string;
  joinDate: Date;
  isActive: boolean;
  
  // 会员体系相关字段
  membershipTier?: mongoose.Types.ObjectId;
  currentLevel: string;
  totalPaid: number;
  membershipExpiry?: Date;
  coupons: Array<{
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minAmount: number;
    used: boolean;
    expiry: Date;
  }>;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  getCurrentTier(): Promise<any>;
  hasPermission(permission: string): Promise<boolean>;
  updateMembershipLevel(amount: number): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'coach', 'student', 'volunteer'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 会员体系字段
  membershipTier: {
    type: Schema.Types.ObjectId,
    ref: 'MembershipTier',
    default: null
  },
  currentLevel: {
    type: String,
    default: '学员'
  },
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  membershipExpiry: {
    type: Date,
    default: null
  },
  coupons: [{
    code: {
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
    used: {
      type: Boolean,
      default: false
    },
    expiry: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
});

// 索引
UserSchema.index({ membershipTier: 1 });
UserSchema.index({ currentLevel: 1 });
UserSchema.index({ totalPaid: 1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 获取当前会员等级
UserSchema.methods.getCurrentTier = async function() {
  if (!this.membershipTier) {
    const MembershipTier = mongoose.model('MembershipTier');
    return await MembershipTier.getTierByAmount(this.totalPaid);
  }
  return await mongoose.model('MembershipTier').findById(this.membershipTier);
};

// 检查权限
UserSchema.methods.hasPermission = async function(permission: string): Promise<boolean> {
  // 管理员拥有所有权限
  if (this.role === 'admin') return true;
  
  const tier = await this.getCurrentTier();
  if (!tier) return false;
  
  return tier.permissions.includes(permission);
};

// 更新会员等级
UserSchema.methods.updateMembershipLevel = async function(amount: number): Promise<void> {
  this.totalPaid += amount;
  
  const MembershipTier = mongoose.model('MembershipTier');
  const newTier = await MembershipTier.getTierByAmount(this.totalPaid);
  
  if (newTier) {
    this.membershipTier = newTier._id;
    this.currentLevel = newTier.name;
    
    // 设置会员到期时间（1年）
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.membershipExpiry = expiry;
  }
  
  await this.save();
};

// 删除密码字段在JSON序列化时
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);