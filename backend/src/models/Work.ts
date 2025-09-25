import mongoose, { Document, Schema } from 'mongoose';

export interface IWork extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  workType: 'file' | 'link';
  workUrl?: string;
  filePath?: string;
  coverImage: string;
  votes: mongoose.Types.ObjectId[];
  views: number;
  isTopPinned: boolean;
  status: 'draft' | 'published' | 'pending' | 'rejected';
  
  // 权限控制相关字段
  requiredLevel: string;
  visibility: 'public' | 'members_only';
  content: {
    preview: string;
    basic?: string;
    advanced?: string;
    premium?: string;
    sourceCode?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
  canUserAccess(user: any, accessLevel: string): boolean;
}

const WorkSchema = new Schema<IWork>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['regular', 'camp1', 'camp2', 'overseas1']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  workType: {
    type: String,
    enum: ['file', 'link'],
    required: true
  },
  workUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(this: IWork, v: string) {
        if (this.workType === 'link') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'Work URL is required when work type is link'
    }
  },
  filePath: {
    type: String,
    trim: true,
    validate: {
      validator: function(this: IWork, v: string) {
        if (this.workType === 'file') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'File path is required when work type is file'
    }
  },
  coverImage: {
    type: String,
    required: true,
    trim: true
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isTopPinned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'pending', 'rejected'],
    default: 'pending'
  },
  
  // 权限控制字段
  requiredLevel: {
    type: String,
    default: '学员'
  },
  visibility: {
    type: String,
    enum: ['public', 'members_only'],
    default: 'public'
  },
  content: {
    preview: {
      type: String,
      required: true,
      default: ''
    },
    basic: {
      type: String,
      default: ''
    },
    advanced: {
      type: String,
      default: ''
    },
    premium: {
      type: String,
      default: ''
    },
    sourceCode: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// 索引
WorkSchema.index({ author: 1 });
WorkSchema.index({ category: 1 });
WorkSchema.index({ status: 1 });
WorkSchema.index({ createdAt: -1 });
WorkSchema.index({ votes: 1 });
WorkSchema.index({ requiredLevel: 1 });
WorkSchema.index({ visibility: 1 });

// 虚拟字段：投票数
WorkSchema.virtual('voteCount').get(function() {
  return this.votes.length;
});

// 实例方法：检查用户是否可以访问特定级别的内容
WorkSchema.methods.canUserAccess = function(user: any, accessLevel: string): boolean {
  // 管理员可以访问所有内容
  if (user.role === 'admin') return true;
  
  // 作者可以访问自己的所有内容
  if (this.author.toString() === user._id.toString()) return true;
  
  // 公开内容的预览所有人都可以访问
  if (this.visibility === 'public' && accessLevel === 'preview') return true;
  
  // 会员内容需要检查用户等级
  if (this.visibility === 'members_only') {
    const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
    const requiredIndex = levelHierarchy.indexOf(this.requiredLevel);
    const userIndex = levelHierarchy.indexOf(user.currentLevel);
    
    if (userIndex >= requiredIndex) {
      // 根据用户等级决定可以访问的内容级别
      const accessLevels = ['preview', 'basic', 'advanced', 'premium', 'sourceCode'];
      const accessIndex = accessLevels.indexOf(accessLevel);
      
      // 学员：预览 + 基础
      // 会员：预览 + 基础 + 高级
      // 高级会员：预览 + 基础 + 高级 + 高端
      // 共创/讲师：所有内容包括源码
      if (user.currentLevel === '学员' && accessIndex <= 1) return true;
      if (user.currentLevel === '会员' && accessIndex <= 2) return true;
      if (user.currentLevel === '高级会员' && accessIndex <= 3) return true;
      if (['共创', '讲师'].includes(user.currentLevel)) return true;
    }
  }
  
  return false;
};

// 确保虚拟字段包含在JSON输出中
WorkSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IWork>('Work', WorkSchema);