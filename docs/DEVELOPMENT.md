# 小虎CodeBuddy学习站 - 开发文档

## 📋 目录
- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [开发环境搭建](#开发环境搭建)
- [项目结构详解](#项目结构详解)
- [数据库设计](#数据库设计)
- [API接口文档](#api接口文档)
- [前端组件说明](#前端组件说明)
- [会员体系设计](#会员体系设计)
- [权限控制机制](#权限控制机制)
- [开发规范](#开发规范)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 项目概述

小虎CodeBuddy学习站是一个专为AI编程学习者打造的作品展示平台，支持多层会员体系、智能权限控制、作品上传投票等功能。

### 核心特性
- **多层会员体系**: 5层可配置会员等级，支持动态权限控制
- **智能内容过滤**: 根据用户等级自动过滤可访问内容
- **作品管理系统**: 支持HTML文件上传、链接分享、封面展示
- **投票排序机制**: 多维度排序（投票数、浏览量、发布时间）
- **训练营分类**: 支持多个训练营的独立管理
- **支付体系**: 优惠券折扣和序列号直购系统
- **管理后台**: 完整的用户、作品、会员管理界面

## 技术架构

### 前端技术栈
```
React 18 + TypeScript + Tailwind CSS
├── React Router Dom 6.x    # 路由管理
├── Axios                   # HTTP客户端
├── Heroicons              # 图标库
└── 响应式设计              # 移动端适配
```

### 后端技术栈
```
Node.js + Express.js + TypeScript
├── MongoDB + Mongoose      # 数据库ORM
├── JWT                    # 身份认证
├── Multer                 # 文件上传
├── Bcrypt                 # 密码加密
├── Joi                    # 数据验证
└── CORS                   # 跨域处理
```

### 数据库设计
```
MongoDB Collections:
├── users              # 用户信息
├── works              # 作品数据
├── membershiptiers    # 会员等级
├── payments           # 支付记录
├── coupons            # 优惠券
├── serialcodes        # 序列号
├── votes              # 投票记录
└── bootcamps          # 训练营
```

## 开发环境搭建

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4.0
- npm >= 8.0.0
- Git >= 2.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site.git
cd xiaohu-codebuddy-learning-site
```

2. **安装依赖**
```bash
# 根目录安装
npm install

# 前端依赖
cd frontend && npm install

# 后端依赖
cd ../backend && npm install
```

3. **环境配置**
```bash
# 复制环境配置文件
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/xiaohu-codebuddy

# JWT密钥 (请更换为您自己的密钥)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务端口
PORT=5000

# 前端地址
FRONTEND_URL=http://localhost:3000

# 环境
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# 管理员默认账号
ADMIN_EMAIL=admin@xiaohu.com
ADMIN_PASSWORD=admin123456
```

4. **启动MongoDB**
```bash
# Windows
net start MongoDB

# macOS (使用Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

5. **初始化数据库**
```bash
cd backend
npm run init-db
```

6. **启动开发服务器**
```bash
# 在项目根目录，同时启动前后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端 http://localhost:3000
npm run dev:backend   # 后端 http://localhost:5000
```

## 项目结构详解

```
xiaohu-codebuddy-learning-site/
├── frontend/                    # 前端React应用
│   ├── public/                 # 静态资源
│   │   ├── index.html         # HTML模板
│   │   └── favicon.ico        # 网站图标
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── Layout.tsx     # 页面布局组件
│   │   │   ├── Sidebar.tsx    # 侧边栏组件
│   │   │   ├── WorkCard.tsx   # 作品卡片组件
│   │   │   ├── MembershipBadge.tsx  # 会员等级标识
│   │   │   ├── UpgradePrompt.tsx    # 升级提示组件
│   │   │   └── ProtectedRoute.tsx   # 路由保护组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── HomePage.tsx   # 首页
│   │   │   ├── WorksPage.tsx  # 作品展示页
│   │   │   ├── UploadPage.tsx # 作品上传页
│   │   │   ├── LoginPage.tsx  # 登录页
│   │   │   ├── RegisterPage.tsx # 注册页
│   │   │   ├── MembershipPage.tsx # 会员中心
│   │   │   ├── AdminPage.tsx  # 管理后台
│   │   │   └── AdminMembershipPage.tsx # 会员管理
│   │   ├── contexts/          # React Context
│   │   │   └── AuthContext.tsx # 认证上下文
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── services/          # API服务
│   │   │   └── api.ts         # API接口封装
│   │   ├── types/             # TypeScript类型定义
│   │   ├── utils/             # 工具函数
│   │   └── App.tsx            # 主应用组件
│   ├── package.json           # 前端依赖配置
│   └── tailwind.config.js     # Tailwind CSS配置
├── backend/                    # 后端Node.js应用
│   ├── src/
│   │   ├── models/            # 数据模型
│   │   │   ├── User.ts        # 用户模型
│   │   │   ├── Work.ts        # 作品模型
│   │   │   ├── MembershipTier.ts # 会员等级模型
│   │   │   ├── Payment.ts     # 支付记录模型
│   │   │   ├── Coupon.ts      # 优惠券模型
│   │   │   ├── SerialCode.ts  # 序列号模型
│   │   │   ├── Vote.ts        # 投票模型
│   │   │   └── Bootcamp.ts    # 训练营模型
│   │   ├── routes/            # API路由
│   │   │   ├── auth.ts        # 认证路由
│   │   │   ├── users.ts       # 用户管理路由
│   │   │   ├── works.ts       # 作品管理路由
│   │   │   ├── membership.ts  # 会员体系路由
│   │   │   └── admin.ts       # 管理员路由
│   │   ├── middleware/        # 中间件
│   │   │   ├── auth.ts        # 认证中间件
│   │   │   ├── membership.ts  # 会员权限中间件
│   │   │   └── validation.ts  # 数据验证中间件
│   │   ├── controllers/       # 控制器
│   │   ├── config/            # 配置文件
│   │   │   └── database.ts    # 数据库配置
│   │   ├── utils/             # 工具函数
│   │   │   ├── jwt.ts         # JWT工具
│   │   │   └── upload.ts      # 文件上传工具
│   │   ├── types/             # TypeScript类型定义
│   │   ├── scripts/           # 脚本文件
│   │   │   └── init-db.ts     # 数据库初始化脚本
│   │   ├── app.ts             # Express应用配置
│   │   ├── server.ts          # 服务器启动文件
│   │   └── index.ts           # 主入口文件
│   ├── uploads/               # 文件上传目录
│   ├── package.json           # 后端依赖配置
│   └── .env.example           # 环境变量示例
├── docs/                      # 文档目录
│   ├── DEVELOPMENT.md         # 开发文档
│   ├── API.md                 # API文档
│   └── DEPLOYMENT.md          # 部署文档
├── package.json               # 根目录工作空间配置
├── README.md                  # 项目说明
└── .gitignore                 # Git忽略文件
```

## 数据库设计

### 用户模型 (User)
```typescript
interface User {
  _id: ObjectId;
  username: string;           // 用户名
  email: string;              // 邮箱
  password: string;           // 加密密码
  role: 'admin' | 'coach' | 'student' | 'volunteer'; // 角色
  avatar?: string;            // 头像URL
  bio?: string;               // 个人简介
  membershipTier: ObjectId;   // 会员等级ID
  membershipExpiry?: Date;    // 会员到期时间
  totalSpent: number;         // 总消费金额
  availableCoupons: ObjectId[]; // 可用优惠券
  usedCoupons: ObjectId[];    // 已使用优惠券
  paymentHistory: ObjectId[]; // 支付历史
  createdAt: Date;
  updatedAt: Date;
}
```

### 作品模型 (Work)
```typescript
interface Work {
  _id: ObjectId;
  title: string;              // 作品标题
  description: string;        // 作品描述
  author: ObjectId;           // 作者ID
  type: 'html' | 'link';      // 作品类型
  content: string;            // HTML内容或链接URL
  coverImage: string;         // 封面图片URL
  bootcamp?: ObjectId;        // 所属训练营
  tags: string[];             // 标签
  isPublic: boolean;          // 是否公开
  isPinned: boolean;          // 是否置顶
  viewCount: number;          // 浏览次数
  voteCount: number;          // 投票数
  
  // 分层内容 - 根据会员等级显示不同内容
  contentLayers: {
    preview: string;          // 预览内容（所有用户可见）
    basic: string;            // 基础内容（学员及以上）
    advanced: string;         // 高级内容（会员及以上）
    premium: string;          // 高端内容（高级会员及以上）
    source: string;           // 源码内容（共创及以上）
  };
  
  requiredMembershipLevel: number; // 所需最低会员等级
  createdAt: Date;
  updatedAt: Date;
}
```

### 会员等级模型 (MembershipTier)
```typescript
interface MembershipTier {
  _id: ObjectId;
  name: string;               // 等级名称
  level: number;              // 等级数值（1-5）
  priceRange: {
    min: number;              // 最低价格
    max: number;              // 最高价格
  };
  color: string;              // 等级颜色
  icon: string;               // 等级图标
  description: string;        // 等级描述
  benefits: string[];         // 权益列表
  permissions: {
    canViewBasic: boolean;    // 可查看基础内容
    canViewAdvanced: boolean; // 可查看高级内容
    canViewPremium: boolean;  // 可查看高端内容
    canViewSource: boolean;   // 可查看源码
    canUploadWorks: boolean;  // 可上传作品
    canVote: boolean;         // 可投票
    maxUploadsPerDay: number; // 每日最大上传数
  };
  isActive: boolean;          // 是否启用
  createdAt: Date;
  updatedAt: Date;
}
```

### 支付记录模型 (Payment)
```typescript
interface Payment {
  _id: ObjectId;
  user: ObjectId;             // 用户ID
  amount: number;             // 支付金额
  originalAmount: number;     // 原始金额
  discount: number;           // 折扣金额
  paymentMethod: 'coupon' | 'serial'; // 支付方式
  couponUsed?: ObjectId;      // 使用的优惠券
  serialCodeUsed?: string;    // 使用的序列号
  membershipTier: ObjectId;   // 购买的会员等级
  status: 'pending' | 'completed' | 'failed'; // 支付状态
  transactionId?: string;     // 交易ID
  createdAt: Date;
  updatedAt: Date;
}
```

### 优惠券模型 (Coupon)
```typescript
interface Coupon {
  _id: ObjectId;
  code: string;               // 优惠券代码
  name: string;               // 优惠券名称
  description: string;        // 描述
  discountType: 'percentage' | 'fixed'; // 折扣类型
  discountValue: number;      // 折扣值
  minPurchaseAmount: number;  // 最低消费金额
  maxDiscountAmount?: number; // 最大折扣金额
  usageLimit: number;         // 使用次数限制
  usedCount: number;          // 已使用次数
  validFrom: Date;            // 有效期开始
  validTo: Date;              // 有效期结束
  isActive: boolean;          // 是否启用
  applicableTiers: ObjectId[]; // 适用的会员等级
  createdBy: ObjectId;        // 创建者
  createdAt: Date;
  updatedAt: Date;
}
```

### 序列号模型 (SerialCode)
```typescript
interface SerialCode {
  _id: ObjectId;
  code: string;               // 序列号
  membershipTier: ObjectId;   // 对应会员等级
  isUsed: boolean;            // 是否已使用
  usedBy?: ObjectId;          // 使用者ID
  usedAt?: Date;              // 使用时间
  validFrom: Date;            // 有效期开始
  validTo: Date;              // 有效期结束
  batchId?: string;           // 批次ID
  createdBy: ObjectId;        // 创建者
  createdAt: Date;
  updatedAt: Date;
}
```

## API接口文档

### 认证接口

#### POST /api/auth/register
注册新用户
```typescript
// 请求体
{
  username: string;
  email: string;
  password: string;
  role?: 'student' | 'volunteer';
}

// 响应
{
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}
```

#### POST /api/auth/login
用户登录
```typescript
// 请求体
{
  email: string;
  password: string;
}

// 响应
{
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}
```

### 作品管理接口

#### GET /api/works
获取作品列表
```typescript
// 查询参数
{
  page?: number;
  limit?: number;
  bootcamp?: string;
  sortBy?: 'votes' | 'views' | 'date';
  order?: 'asc' | 'desc';
}

// 响应
{
  success: boolean;
  data: {
    works: Work[];
    total: number;
    page: number;
    totalPages: number;
  };
}
```

#### POST /api/works
创建新作品
```typescript
// 请求体 (multipart/form-data)
{
  title: string;
  description: string;
  type: 'html' | 'link';
  content: string;
  coverImage: File;
  bootcamp?: string;
  tags: string[];
  contentLayers: {
    preview: string;
    basic: string;
    advanced: string;
    premium: string;
    source: string;
  };
  requiredMembershipLevel: number;
}

// 响应
{
  success: boolean;
  message: string;
  data?: Work;
}
```

### 会员体系接口

#### GET /api/membership/tiers
获取会员等级列表
```typescript
// 响应
{
  success: boolean;
  data: MembershipTier[];
}
```

#### POST /api/membership/upgrade
会员升级
```typescript
// 请求体
{
  tierLevel: number;
  paymentMethod: 'coupon' | 'serial';
  couponCode?: string;
  serialCode?: string;
}

// 响应
{
  success: boolean;
  message: string;
  data?: {
    payment: Payment;
    newMembership: MembershipTier;
  };
}
```

### 管理员接口

#### GET /api/admin/users
获取用户列表（管理员）
```typescript
// 查询参数
{
  page?: number;
  limit?: number;
  role?: string;
  membershipLevel?: number;
}

// 响应
{
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  };
}
```

#### POST /api/admin/coupons
创建优惠券（管理员）
```typescript
// 请求体
{
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  validFrom: string;
  validTo: string;
  applicableTiers: string[];
}

// 响应
{
  success: boolean;
  message: string;
  data?: Coupon;
}
```

## 前端组件说明

### 核心组件

#### Layout.tsx
页面布局组件，包含侧边栏和主内容区域
```typescript
interface LayoutProps {
  children: React.ReactNode;
}

// 功能特性
- 响应式侧边栏
- 用户认证状态显示
- 导航菜单管理
- 移动端适配
```

#### MembershipBadge.tsx
会员等级标识组件
```typescript
interface MembershipBadgeProps {
  tier: MembershipTier;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

// 功能特性
- 动态颜色显示
- 多种尺寸支持
- 等级数值显示
- 悬停提示信息
```

#### UpgradePrompt.tsx
升级提示组件
```typescript
interface UpgradePromptProps {
  requiredLevel: number;
  currentLevel: number;
  feature: string;
}

// 功能特性
- 智能权限检测
- 友好的升级引导
- 避免显示无权限内容
- 一键跳转升级页面
```

#### WorkCard.tsx
作品卡片组件
```typescript
interface WorkCardProps {
  work: Work;
  userMembershipLevel: number;
  onVote?: (workId: string) => void;
}

// 功能特性
- 分层内容展示
- 权限智能过滤
- 投票功能集成
- 响应式设计
```

### 页面组件

#### WorksPage.tsx
作品展示页面
- 作品列表展示
- 多维度排序
- 分页加载
- 训练营筛选
- 权限控制展示

#### MembershipPage.tsx
会员中心页面
- 当前等级展示
- 升级选项
- 支付历史
- 优惠券管理

#### AdminPage.tsx
管理后台页面
- 用户管理
- 作品审核
- 数据统计
- 系统配置

## 会员体系设计

### 等级体系
```
1. 学员 (Student) - 9.9-99元
   - 查看基础内容
   - 上传作品
   - 参与投票

2. 会员 (Member) - 100-999元
   - 学员所有权限
   - 查看高级内容
   - 优先展示

3. 高级会员 (Advanced Member) - 1000-4999元
   - 会员所有权限
   - 查看高端内容
   - 专属标识

4. 共创 (Co-creator) - 5000-14999元
   - 高级会员所有权限
   - 查看源码
   - 参与内容创作

5. 讲师 (Instructor) - 15000元以上
   - 共创所有权限
   - 发布课程
   - 管理学员
```

### 权限矩阵
| 功能 | 游客 | 学员 | 会员 | 高级会员 | 共创 | 讲师 |
|------|------|------|------|----------|------|------|
| 浏览预览内容 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看基础内容 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看高级内容 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 查看高端内容 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 查看源码 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 上传作品 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 参与投票 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 每日上传限制 | 0 | 3 | 5 | 10 | 20 | 无限制 |

### 升级机制
1. **优惠券升级**: 使用优惠券代码享受折扣
2. **序列号直购**: 使用序列号直接激活等级
3. **价格区间**: 每个等级对应不同价格区间，灵活定价

## 权限控制机制

### 后端权限控制
```typescript
// 会员权限中间件
export const requireMembership = (minLevel: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userTier = await MembershipTier.findById(user.membershipTier);
    
    if (!userTier || userTier.level < minLevel) {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要更高等级的会员'
      });
    }
    
    next();
  };
};

// 使用示例
router.get('/premium-content', 
  auth, 
  requireMembership(3), // 需要高级会员
  getPremiumContent
);
```

### 前端权限控制
```typescript
// 权限检查Hook
const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = (requiredLevel: number) => {
    return user?.membershipTier?.level >= requiredLevel;
  };
  
  const canViewContent = (contentLevel: string) => {
    const levelMap = {
      'preview': 0,
      'basic': 1,
      'advanced': 2,
      'premium': 3,
      'source': 4
    };
    
    return hasPermission(levelMap[contentLevel]);
  };
  
  return { hasPermission, canViewContent };
};

// 组件中使用
const WorkDetail = ({ work }) => {
  const { canViewContent } = usePermission();
  
  return (
    <div>
      {/* 预览内容 - 所有用户可见 */}
      <div>{work.contentLayers.preview}</div>
      
      {/* 基础内容 - 学员及以上 */}
      {canViewContent('basic') ? (
        <div>{work.contentLayers.basic}</div>
      ) : (
        <UpgradePrompt requiredLevel={1} feature="基础内容" />
      )}
      
      {/* 高级内容 - 会员及以上 */}
      {canViewContent('advanced') && (
        <div>{work.contentLayers.advanced}</div>
      )}
    </div>
  );
};
```

## 开发规范

### 代码规范
1. **TypeScript**: 全项目使用TypeScript，严格类型检查
2. **ESLint**: 使用ESLint进行代码质量检查
3. **Prettier**: 统一代码格式化
4. **命名规范**: 
   - 组件使用PascalCase
   - 函数和变量使用camelCase
   - 常量使用UPPER_SNAKE_CASE
   - 文件名使用kebab-case或PascalCase

### Git工作流
1. **分支策略**: 
   - `main`: 主分支，生产环境代码
   - `develop`: 开发分支
   - `feature/*`: 功能分支
   - `hotfix/*`: 热修复分支

2. **提交规范**:
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 测试规范
1. **单元测试**: 使用Jest进行单元测试
2. **集成测试**: API接口集成测试
3. **E2E测试**: 关键用户流程端到端测试
4. **测试覆盖率**: 保持80%以上的测试覆盖率

## 部署指南

### 生产环境部署

#### 1. 服务器要求
- Ubuntu 20.04 LTS 或 CentOS 8
- Node.js 16+ 
- MongoDB 4.4+
- Nginx (反向代理)
- SSL证书 (HTTPS)

#### 2. 部署步骤
```bash
# 1. 克隆代码
git clone https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site.git
cd xiaohu-codebuddy-learning-site

# 2. 安装依赖
npm install
cd frontend && npm install
cd ../backend && npm install

# 3. 构建前端
cd frontend
npm run build

# 4. 配置环境变量
cd ../backend
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 5. 初始化数据库
npm run init-db

# 6. 启动服务
npm run start
```

#### 3. Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 文件上传
    location /uploads {
        alias /path/to/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. PM2进程管理
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start backend/dist/server.js --name "xiaohu-codebuddy"

# 设置开机自启
pm2 startup
pm2 save
```

### Docker部署

#### Dockerfile
```dockerfile
# 前端构建
FROM node:16-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# 后端构建
FROM node:16-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
RUN npm run build

# 生产镜像
FROM node:16-alpine
WORKDIR /app

# 复制后端代码
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/package.json ./

# 复制前端构建文件
COPY --from=frontend-build /app/frontend/build ./public

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/xiaohu-codebuddy
      - JWT_SECRET=your-production-jwt-secret
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=xiaohu-codebuddy

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mongo_data:
```

## 常见问题

### Q1: 如何添加新的会员等级？
A: 在管理后台的"会员体系管理"中可以动态添加新等级，设置等级名称、价格区间、权限等。

### Q2: 如何自定义内容分层？
A: 在上传作品时，可以为每个内容层级设置不同的内容，系统会根据用户会员等级自动过滤显示。

### Q3: 如何批量生成序列号？
A: 在管理后台的"序列号管理"中，可以批量生成指定数量的序列号，支持设置有效期和对应等级。

### Q4: 如何配置优惠券？
A: 在管理后台创建优惠券时，可以设置折扣类型（百分比/固定金额）、使用限制、有效期等。

### Q5: 如何备份数据？
A: 使用MongoDB的mongodump工具定期备份数据库，建议设置自动备份脚本。

### Q6: 如何监控系统性能？
A: 可以集成监控工具如New Relic、DataDog或使用开源方案如Prometheus + Grafana。

### Q7: 如何扩展支付方式？
A: 在Payment模型中添加新的支付方式类型，并在相应的API中实现支付逻辑。

---

## 技术支持

如有问题，请通过以下方式联系：
- GitHub Issues: https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site/issues
- 邮箱: support@xiaohu.com
- 微信群: 小虎CodeBuddy学习群

---

*最后更新: 2024年9月25日*