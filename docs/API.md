# 小虎CodeBuddy学习站 - API文档

## 📋 目录
- [API概述](#api概述)
- [认证机制](#认证机制)
- [错误处理](#错误处理)
- [认证接口](#认证接口)
- [用户管理](#用户管理)
- [作品管理](#作品管理)
- [会员体系](#会员体系)
- [投票系统](#投票系统)
- [训练营管理](#训练营管理)
- [管理员接口](#管理员接口)
- [文件上传](#文件上传)
- [数据模型](#数据模型)

## API概述

### 基础信息
- **Base URL**: `http://localhost:5000/api` (开发环境)
- **Base URL**: `https://your-domain.com/api` (生产环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "error": string | null,
  "timestamp": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### HTTP状态码
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `422` - 数据验证失败
- `429` - 请求频率限制
- `500` - 服务器内部错误

## 认证机制

### JWT Token认证
API使用JWT (JSON Web Token) 进行身份认证。

#### 获取Token
通过登录接口获取访问令牌：
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 使用Token
在请求头中携带Token：
```http
Authorization: Bearer <your-jwt-token>
```

#### Token刷新
Token有效期为24小时，过期后需要重新登录。

### 权限级别
- **游客**: 无需认证，可访问公开内容
- **用户**: 需要认证，可访问基础功能
- **会员**: 需要对应会员等级，可访问高级功能
- **管理员**: 需要管理员权限，可访问管理功能

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "error": "ERROR_CODE",
  "details": {
    "field": "具体错误信息"
  },
  "timestamp": "2024-09-25T10:30:00.000Z"
}
```

### 常见错误码
- `INVALID_CREDENTIALS` - 登录凭据无效
- `TOKEN_EXPIRED` - Token已过期
- `INSUFFICIENT_PERMISSIONS` - 权限不足
- `VALIDATION_ERROR` - 数据验证失败
- `RESOURCE_NOT_FOUND` - 资源不存在
- `DUPLICATE_RESOURCE` - 资源重复
- `RATE_LIMIT_EXCEEDED` - 请求频率超限

## 认证接口

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码",
  "role": "student" // 可选: student, volunteer
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "用户名",
      "email": "邮箱地址",
      "role": "student",
      "membershipTier": {
        "name": "学员",
        "level": 1
      }
    },
    "token": "jwt_token"
  }
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱地址",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "用户名",
      "email": "邮箱地址",
      "role": "student",
      "membershipTier": {
        "name": "学员",
        "level": 1
      }
    },
    "token": "jwt_token"
  }
}
```

### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "用户名",
    "email": "邮箱地址",
    "role": "student",
    "membershipTier": {
      "name": "学员",
      "level": 1,
      "permissions": {
        "canViewBasic": true,
        "canUploadWorks": true
      }
    },
    "totalSpent": 99.9,
    "availableCoupons": []
  }
}
```

## 用户管理

### 更新用户资料
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "新用户名",
  "bio": "个人简介",
  "avatar": "头像URL"
}
```

### 修改密码
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

### 获取用户列表
```http
GET /api/users?page=1&limit=20&role=student
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `role`: 角色筛选
- `membershipLevel`: 会员等级筛选

## 作品管理

### 获取作品列表
```http
GET /api/works?page=1&limit=20&bootcamp=bootcamp_id&sortBy=votes&order=desc
```

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `bootcamp`: 训练营ID
- `sortBy`: 排序字段 (votes, views, date)
- `order`: 排序方向 (asc, desc)
- `tags`: 标签筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "works": [
      {
        "_id": "work_id",
        "title": "作品标题",
        "description": "作品描述",
        "author": {
          "_id": "user_id",
          "username": "作者名",
          "membershipTier": {
            "name": "会员",
            "level": 2
          }
        },
        "type": "html",
        "coverImage": "封面图URL",
        "bootcamp": {
          "_id": "bootcamp_id",
          "name": "训练营名称"
        },
        "tags": ["React", "TypeScript"],
        "viewCount": 150,
        "voteCount": 25,
        "isPinned": false,
        "contentLayers": {
          "preview": "预览内容",
          "basic": "基础内容"
        },
        "createdAt": "2024-09-25T10:30:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### 获取作品详情
```http
GET /api/works/:id
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "work_id",
    "title": "作品标题",
    "description": "作品描述",
    "author": {
      "_id": "user_id",
      "username": "作者名"
    },
    "type": "html",
    "content": "完整内容或链接",
    "coverImage": "封面图URL",
    "contentLayers": {
      "preview": "预览内容",
      "basic": "基础内容",
      "advanced": "高级内容"
    },
    "viewCount": 150,
    "voteCount": 25,
    "userVoted": false,
    "createdAt": "2024-09-25T10:30:00.000Z"
  }
}
```

### 创建作品
```http
POST /api/works
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: 作品标题
description: 作品描述
type: html
content: HTML内容或链接
coverImage: [文件]
bootcamp: 训练营ID (可选)
tags: React,TypeScript
contentLayers[preview]: 预览内容
contentLayers[basic]: 基础内容
contentLayers[advanced]: 高级内容
contentLayers[premium]: 高端内容
contentLayers[source]: 源码内容
requiredMembershipLevel: 2
```

### 更新作品
```http
PUT /api/works/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "description": "新描述",
  "tags": ["React", "Vue"],
  "contentLayers": {
    "preview": "更新的预览内容"
  }
}
```

### 删除作品
```http
DELETE /api/works/:id
Authorization: Bearer <token>
```

## 会员体系

### 获取会员等级列表
```http
GET /api/membership/tiers
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "tier_id",
      "name": "学员",
      "level": 1,
      "priceRange": {
        "min": 9.9,
        "max": 99
      },
      "color": "#10B981",
      "icon": "🎓",
      "description": "入门级会员",
      "benefits": [
        "查看基础内容",
        "上传作品（每日3个）"
      ],
      "permissions": {
        "canViewBasic": true,
        "canUploadWorks": true,
        "maxUploadsPerDay": 3
      }
    }
  ]
}
```

### 会员升级
```http
POST /api/membership/upgrade
Authorization: Bearer <token>
Content-Type: application/json

{
  "tierLevel": 2,
  "paymentMethod": "coupon",
  "couponCode": "WELCOME10"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "升级成功",
  "data": {
    "payment": {
      "_id": "payment_id",
      "amount": 90,
      "originalAmount": 100,
      "discount": 10,
      "paymentMethod": "coupon"
    },
    "newMembership": {
      "name": "会员",
      "level": 2
    }
  }
}
```

### 使用序列号升级
```http
POST /api/membership/activate-serial
Authorization: Bearer <token>
Content-Type: application/json

{
  "serialCode": "MEMBER-1234567890-001"
}
```

### 获取支付历史
```http
GET /api/membership/payments
Authorization: Bearer <token>
```

### 获取可用优惠券
```http
GET /api/membership/coupons
Authorization: Bearer <token>
```

## 投票系统

### 为作品投票
```http
POST /api/votes
Authorization: Bearer <token>
Content-Type: application/json

{
  "workId": "work_id"
}
```

### 取消投票
```http
DELETE /api/votes/:workId
Authorization: Bearer <token>
```

### 获取用户投票记录
```http
GET /api/votes/my-votes
Authorization: Bearer <token>
```

## 训练营管理

### 获取训练营列表
```http
GET /api/bootcamps?active=true
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "bootcamp_id",
      "name": "AI编程训练营第一期",
      "description": "首期AI编程训练营",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.000Z",
      "isActive": true,
      "maxStudents": 50,
      "currentStudents": 35,
      "tags": ["AI编程", "基础入门"]
    }
  ]
}
```

### 获取训练营详情
```http
GET /api/bootcamps/:id
```

### 加入训练营
```http
POST /api/bootcamps/:id/join
Authorization: Bearer <token>
```

### 退出训练营
```http
DELETE /api/bootcamps/:id/leave
Authorization: Bearer <token>
```

## 管理员接口

### 用户管理

#### 获取所有用户
```http
GET /api/admin/users?page=1&limit=20&role=student
Authorization: Bearer <admin-token>
```

#### 更新用户角色
```http
PUT /api/admin/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "coach"
}
```

#### 更新用户会员等级
```http
PUT /api/admin/users/:id/membership
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "tierLevel": 3,
  "expiryDate": "2025-09-25T00:00:00.000Z"
}
```

### 作品管理

#### 获取所有作品
```http
GET /api/admin/works?page=1&limit=20&status=pending
Authorization: Bearer <admin-token>
```

#### 审核作品
```http
PUT /api/admin/works/:id/review
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "reviewNote": "审核通过"
}
```

#### 置顶作品
```http
PUT /api/admin/works/:id/pin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isPinned": true
}
```

### 会员体系管理

#### 创建会员等级
```http
POST /api/admin/membership/tiers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "新等级",
  "level": 6,
  "priceRange": {
    "min": 20000,
    "max": 50000
  },
  "color": "#9333EA",
  "icon": "👑",
  "description": "超级VIP",
  "benefits": ["所有权益"],
  "permissions": {
    "canViewBasic": true,
    "canViewAdvanced": true,
    "canViewPremium": true,
    "canViewSource": true,
    "canUploadWorks": true,
    "canVote": true,
    "maxUploadsPerDay": -1
  }
}
```

#### 更新会员等级
```http
PUT /api/admin/membership/tiers/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "priceRange": {
    "min": 100,
    "max": 1000
  },
  "benefits": ["更新的权益列表"]
}
```

### 优惠券管理

#### 创建优惠券
```http
POST /api/admin/coupons
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "NEWUSER20",
  "name": "新用户20%折扣",
  "description": "新用户专享优惠",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchaseAmount": 100,
  "maxDiscountAmount": 200,
  "usageLimit": 100,
  "validFrom": "2024-09-25T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "applicableTiers": ["tier_id_1", "tier_id_2"]
}
```

#### 获取优惠券列表
```http
GET /api/admin/coupons?page=1&limit=20&active=true
Authorization: Bearer <admin-token>
```

#### 停用优惠券
```http
PUT /api/admin/coupons/:id/deactivate
Authorization: Bearer <admin-token>
```

### 序列号管理

#### 批量生成序列号
```http
POST /api/admin/serial-codes/generate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "membershipTierId": "tier_id",
  "quantity": 50,
  "validFrom": "2024-09-25T00:00:00.000Z",
  "validTo": "2025-09-25T00:00:00.000Z",
  "batchId": "BATCH-2024-09"
}
```

#### 获取序列号列表
```http
GET /api/admin/serial-codes?page=1&limit=20&used=false&tierId=tier_id
Authorization: Bearer <admin-token>
```

#### 导出序列号
```http
GET /api/admin/serial-codes/export?batchId=BATCH-2024-09&format=csv
Authorization: Bearer <admin-token>
```

### 训练营管理

#### 创建训练营
```http
POST /api/admin/bootcamps
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "AI编程训练营第三期",
  "description": "第三期训练营",
  "startDate": "2024-10-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "maxStudents": 100,
  "tags": ["AI编程", "高级进阶"]
}
```

#### 更新训练营
```http
PUT /api/admin/bootcamps/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "maxStudents": 150,
  "isActive": true
}
```

### 系统统计

#### 获取仪表板数据
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "newThisMonth": 25,
      "byRole": {
        "student": 120,
        "coach": 5,
        "admin": 2
      }
    },
    "works": {
      "total": 300,
      "newThisMonth": 45,
      "byStatus": {
        "published": 280,
        "pending": 15,
        "rejected": 5
      }
    },
    "revenue": {
      "total": 15000,
      "thisMonth": 2500,
      "byTier": {
        "学员": 3000,
        "会员": 8000,
        "高级会员": 4000
      }
    },
    "bootcamps": {
      "active": 3,
      "totalStudents": 200
    }
  }
}
```

## 文件上传

### 上传作品封面
```http
POST /api/upload/cover
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [图片文件]
```

**支持格式**: JPG, PNG, GIF, WebP
**文件大小**: 最大5MB
**推荐尺寸**: 800x600px

**响应示例**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/covers/1695632400000-cover.jpg",
    "filename": "1695632400000-cover.jpg",
    "size": 245760
  }
}
```

### 上传HTML文件
```http
POST /api/upload/html
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [HTML文件]
```

**支持格式**: HTML, HTM
**文件大小**: 最大10MB

### 上传用户头像
```http
POST /api/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [图片文件]
```

**推荐尺寸**: 200x200px

## 数据模型

### User (用户)
```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'coach' | 'student' | 'volunteer';
  avatar?: string;
  bio?: string;
  membershipTier: MembershipTier;
  membershipExpiry?: Date;
  totalSpent: number;
  availableCoupons: Coupon[];
  paymentHistory: Payment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Work (作品)
```typescript
interface Work {
  _id: string;
  title: string;
  description: string;
  author: User;
  type: 'html' | 'link';
  content: string;
  coverImage: string;
  bootcamp?: Bootcamp;
  tags: string[];
  isPublic: boolean;
  isPinned: boolean;
  viewCount: number;
  voteCount: number;
  contentLayers: {
    preview: string;
    basic: string;
    advanced: string;
    premium: string;
    source: string;
  };
  requiredMembershipLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### MembershipTier (会员等级)
```typescript
interface MembershipTier {
  _id: string;
  name: string;
  level: number;
  priceRange: {
    min: number;
    max: number;
  };
  color: string;
  icon: string;
  description: string;
  benefits: string[];
  permissions: {
    canViewBasic: boolean;
    canViewAdvanced: boolean;
    canViewPremium: boolean;
    canViewSource: boolean;
    canUploadWorks: boolean;
    canVote: boolean;
    maxUploadsPerDay: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment (支付记录)
```typescript
interface Payment {
  _id: string;
  user: User;
  amount: number;
  originalAmount: number;
  discount: number;
  paymentMethod: 'coupon' | 'serial';
  couponUsed?: Coupon;
  serialCodeUsed?: string;
  membershipTier: MembershipTier;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Coupon (优惠券)
```typescript
interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableTiers: MembershipTier[];
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### SerialCode (序列号)
```typescript
interface SerialCode {
  _id: string;
  code: string;
  membershipTier: MembershipTier;
  isUsed: boolean;
  usedBy?: User;
  usedAt?: Date;
  validFrom: Date;
  validTo: Date;
  batchId?: string;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Bootcamp (训练营)
```typescript
interface Bootcamp {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  instructors: User[];
  students: User[];
  maxStudents: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Vote (投票)
```typescript
interface Vote {
  _id: string;
  user: User;
  work: Work;
  createdAt: Date;
}
```

---

## 使用示例

### JavaScript/TypeScript客户端
```javascript
class XiaohuAPI {
  constructor(baseURL, token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return await response.json();
  }

  // 认证
  async login(email, password) {
    const result = await this.request('POST', '/auth/login', { email, password });
    if (result.success) {
      this.token = result.data.token;
    }
    return result;
  }

  // 获取作品列表
  async getWorks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request('GET', `/works?${query}`);
  }

  // 创建作品
  async createWork(workData) {
    return await this.request('POST', '/works', workData);
  }

  // 会员升级
  async upgradeMembership(tierLevel, paymentMethod, code) {
    return await this.request('POST', '/membership/upgrade', {
      tierLevel,
      paymentMethod,
      [paymentMethod === 'coupon' ? 'couponCode' : 'serialCode']: code
    });
  }
}

// 使用示例
const api = new XiaohuAPI('http://localhost:5000/api');

// 登录
await api.login('user@example.com', 'password123');

// 获取作品
const works = await api.getWorks({ page: 1, limit: 10 });

// 升级会员
await api.upgradeMembership(2, 'coupon', 'WELCOME10');
```

### Python客户端
```python
import requests
import json

class XiaohuAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
    
    def request(self, method, endpoint, data=None):
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        url = f'{self.base_url}{endpoint}'
        
        if method == 'GET':
            response = self.session.get(url, headers=headers, params=data)
        else:
            response = self.session.request(
                method, url, headers=headers, 
                data=json.dumps(data) if data else None
            )
        
        return response.json()
    
    def login(self, email, password):
        result = self.request('POST', '/auth/login', {
            'email': email, 
            'password': password
        })
        if result['success']:
            self.token = result['data']['token']
        return result
    
    def get_works(self, **params):
        return self.request('GET', '/works', params)

# 使用示例
api = XiaohuAPI('http://localhost:5000/api')
api.login('user@example.com', 'password123')
works = api.get_works(page=1, limit=10)
```

---

## 速率限制

API实施速率限制以防止滥用：

- **认证接口**: 5次/分钟
- **上传接口**: 10次/分钟
- **一般接口**: 100次/分钟
- **管理员接口**: 200次/分钟

超出限制时返回HTTP 429状态码。

---

## 版本控制

API版本通过URL路径控制：
- `v1`: `/api/v1/...` (当前版本)
- `v2`: `/api/v2/...` (未来版本)

---

*最后更新: 2024年9月25日*