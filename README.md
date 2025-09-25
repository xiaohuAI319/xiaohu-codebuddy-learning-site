# 小虎CodeBuddy学习站

一个展示AI编程学习成果的现代化Web平台，支持作品展示、会员体系、投票系统等功能。

## 🚀 快速开始

### 方法1：使用Docker（推荐）

1. **启动MongoDB数据库**
```bash
# 启动MongoDB和管理界面
docker-compose up -d

# 查看服务状态
docker-compose ps
```

2. **初始化数据库**
```bash
cd backend
npm install
npm run init-db
```

3. **启动后端服务**
```bash
npm run dev
```

4. **启动前端服务**
```bash
cd ../frontend
npm install
npm start
```

### 方法2：本地MongoDB

1. **安装MongoDB**
   - 下载：https://www.mongodb.com/try/download/community
   - 启动MongoDB服务

2. **配置环境变量**
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件中的数据库连接信息
```

3. **初始化并启动**
```bash
npm install
npm run init-db
npm run dev
```

## 📱 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5000
- **MongoDB管理**: http://localhost:8081 (仅Docker方式)

## 🔑 默认账号

- **邮箱**: admin@xiaohu.com
- **密码**: admin123456

⚠️ **重要**: 首次登录后请立即修改默认密码！

## 🏗️ 项目结构

```
xiaohu-codebuddy/
├── frontend/          # React前端应用
├── backend/           # Node.js后端API
├── docs/             # 项目文档
├── docker-compose.yml # Docker配置
└── README.md         # 项目说明
```

## 🎯 主要功能

### 🎓 会员体系
- **5级会员等级**: 学员 → 会员 → 高级会员 → 共创 → 讲师
- **智能权限控制**: 根据会员等级显示相应内容
- **优惠券系统**: 支持百分比和固定金额折扣
- **序列号激活**: 直接购买会员等级

### 📚 作品展示
- **多种上传方式**: HTML文件上传 + 链接提交
- **训练营分类**: 支持多个训练营作品分类展示
- **投票排序**: 作品按票数排序，支持管理员置顶
- **封面图片**: 统一规格的作品封面展示

### 👥 用户管理
- **角色系统**: 管理员、教练、学员、志愿者
- **个人资料**: 头像、简介、加入时间等
- **权限控制**: 基于角色和会员等级的细粒度权限

### 🛠️ 管理后台
- **会员等级管理**: 配置价格、权限、福利
- **训练营管理**: 创建和管理不同训练营
- **优惠券管理**: 创建和分发优惠券
- **用户管理**: 用户信息和权限管理
- **作品管理**: 审核、置顶、删除作品

## 🔧 开发指南

### 技术栈
- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: MongoDB + Mongoose
- **认证**: JWT + bcryptjs

### 开发命令
```bash
# 后端开发
cd backend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run init-db      # 初始化数据库

# 前端开发
cd frontend
npm start            # 启动开发服务器
npm run build        # 构建生产版本
npm test             # 运行测试
```

### API文档
详细的API文档请查看：[docs/API.md](docs/API.md)

### 部署指南
生产环境部署请查看：[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📖 更多文档

- [开发文档](docs/DEVELOPMENT.md) - 详细的开发指南
- [API文档](docs/API.md) - 完整的API接口说明
- [用户手册](docs/USER_GUIDE.md) - 平台使用说明
- [部署指南](docs/DEPLOYMENT.md) - 生产环境部署

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- **项目作者**: 小虎
- **邮箱**: admin@xiaohu.com
- **学习群**: 小虎CodeBuddy学习群

---

⭐ 如果这个项目对你有帮助，请给它一个星标！