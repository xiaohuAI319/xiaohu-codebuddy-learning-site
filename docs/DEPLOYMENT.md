# 小虎CodeBuddy学习站 - 部署文档

## 📋 目录
- [部署概述](#部署概述)
- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [云服务器部署](#云服务器部署)
- [数据库配置](#数据库配置)
- [SSL证书配置](#ssl证书配置)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [备份策略](#备份策略)
- [故障排除](#故障排除)

## 部署概述

小虎CodeBuddy学习站采用前后端分离架构，支持多种部署方式：
- **开发环境**: 本地开发和测试
- **生产环境**: 云服务器部署
- **容器化**: Docker部署
- **CDN**: 静态资源加速

## 环境要求

### 基础环境
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MongoDB**: >= 4.4.0
- **Git**: >= 2.0.0

### 服务器要求（生产环境）
- **操作系统**: Ubuntu 20.04 LTS / CentOS 8 / Amazon Linux 2
- **内存**: 最低2GB，推荐4GB+
- **存储**: 最低20GB，推荐50GB+
- **网络**: 公网IP，支持HTTP/HTTPS

### 可选组件
- **Nginx**: 反向代理和静态文件服务
- **PM2**: Node.js进程管理
- **Redis**: 缓存和会话存储
- **Let's Encrypt**: 免费SSL证书

## 本地开发部署

### 1. 克隆项目
```bash
git clone https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site.git
cd xiaohu-codebuddy-learning-site
```

### 2. 安装依赖
```bash
# 根目录安装
npm install

# 前端依赖
cd frontend
npm install

# 后端依赖
cd ../backend
npm install
```

### 3. 环境配置
```bash
# 复制环境配置文件
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/xiaohu-codebuddy

# JWT密钥
JWT_SECRET=your-development-jwt-secret

# 服务端口
PORT=5000

# 前端地址
FRONTEND_URL=http://localhost:3000

# 环境
NODE_ENV=development

# 文件上传
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 管理员账号
ADMIN_EMAIL=admin@xiaohu.com
ADMIN_PASSWORD=admin123456
```

### 4. 启动MongoDB
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:4.4
```

### 5. 初始化数据库
```bash
cd backend
npm run init-db
```

### 6. 启动开发服务器
```bash
# 在项目根目录
npm run dev

# 或分别启动
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:5000
```

### 7. 验证部署
- 前端: http://localhost:3000
- 后端API: http://localhost:5000/api/health
- 管理后台: http://localhost:3000/admin

## 生产环境部署

### 1. 服务器准备

#### Ubuntu 20.04 LTS
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim ufw

# 安装Node.js 16
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org

# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装Nginx
sudo apt install -y nginx

# 安装PM2
sudo npm install -g pm2
```

#### CentOS 8
```bash
# 更新系统
sudo dnf update -y

# 安装基础工具
sudo dnf install -y curl wget git vim

# 安装Node.js 16
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo dnf install -y nodejs

# 安装MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-4.4.repo << EOF
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

sudo dnf install -y mongodb-org

# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装Nginx
sudo dnf install -y nginx

# 安装PM2
sudo npm install -g pm2
```

### 2. 部署应用

```bash
# 创建应用目录
sudo mkdir -p /var/www/xiaohu-codebuddy
sudo chown $USER:$USER /var/www/xiaohu-codebuddy

# 克隆代码
cd /var/www/xiaohu-codebuddy
git clone https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site.git .

# 安装依赖
npm install
cd frontend && npm install
cd ../backend && npm install

# 构建前端
cd frontend
npm run build

# 配置后端环境
cd ../backend
cp .env.example .env
```

编辑生产环境配置：
```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/xiaohu-codebuddy-prod

# JWT密钥 (请使用强密钥)
JWT_SECRET=your-super-secure-production-jwt-secret-change-this

# 服务端口
PORT=5000

# 前端地址
FRONTEND_URL=https://your-domain.com

# 环境
NODE_ENV=production

# 文件上传
UPLOAD_PATH=/var/www/xiaohu-codebuddy/uploads
MAX_FILE_SIZE=10485760

# 管理员账号
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 3. 初始化生产数据库
```bash
cd backend
npm run init-db
```

### 4. 构建后端
```bash
npm run build
```

### 5. 配置PM2
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'xiaohu-codebuddy',
    script: './backend/dist/index.js',
    cwd: '/var/www/xiaohu-codebuddy',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

启动应用：
```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 6. 配置Nginx

创建 `/etc/nginx/sites-available/xiaohu-codebuddy`：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 前端静态文件
    location / {
        root /var/www/xiaohu-codebuddy/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 文件上传
    location /uploads {
        alias /var/www/xiaohu-codebuddy/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 文件大小限制
        client_max_body_size 10M;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

启用站点：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/xiaohu-codebuddy /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7. 配置防火墙
```bash
# Ubuntu (UFW)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Docker部署

### 1. 创建Dockerfile

根目录 `Dockerfile`：
```dockerfile
# 多阶段构建

# 前端构建阶段
FROM node:16-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# 后端构建阶段
FROM node:16-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
RUN npm run build

# 生产镜像
FROM node:16-alpine
WORKDIR /app

# 安装dumb-init
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制后端代码
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/dist ./dist
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/node_modules ./node_modules
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/package.json ./

# 复制前端构建文件
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/build ./public

# 创建上传目录
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# 切换用户
USER nextjs

EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 使用dumb-init启动
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 2. 创建docker-compose.yml
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
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongo
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    environment:
      - MONGO_INITDB_DATABASE=xiaohu-codebuddy
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - uploads:/var/www/uploads:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

  # 可选：Redis缓存
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongo_data:
  redis_data:
  uploads:
  logs:

networks:
  app-network:
    driver: bridge
```

### 3. 环境变量配置

创建 `.env` 文件：
```env
# 应用配置
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://your-domain.com

# MongoDB配置
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-mongo-password

# 其他配置
COMPOSE_PROJECT_NAME=xiaohu-codebuddy
```

### 4. 启动Docker服务
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 初始化数据库
docker-compose exec app npm run init-db

# 停止服务
docker-compose down

# 完全清理
docker-compose down -v --rmi all
```

## 云服务器部署

### AWS EC2部署

#### 1. 创建EC2实例
```bash
# 选择AMI: Amazon Linux 2
# 实例类型: t3.medium (生产环境推荐t3.large+)
# 安全组: 开放22, 80, 443端口
```

#### 2. 连接并配置服务器
```bash
# 连接服务器
ssh -i your-key.pem ec2-user@your-ec2-ip

# 更新系统
sudo yum update -y

# 安装Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# 安装MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-4.4.repo << EOF
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装其他工具
sudo yum install -y nginx git
sudo npm install -g pm2
```

#### 3. 配置域名和SSL
```bash
# 安装Certbot
sudo yum install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 阿里云ECS部署

#### 1. 创建ECS实例
- 操作系统: Ubuntu 20.04 LTS
- 实例规格: ecs.c6.large (2核4GB)
- 网络: 专有网络VPC
- 安全组: 开放22, 80, 443端口

#### 2. 配置域名解析
在阿里云DNS控制台添加A记录：
```
@ -> your-ecs-ip
www -> your-ecs-ip
```

#### 3. 部署应用
按照前面的Ubuntu部署步骤进行。

### 腾讯云CVM部署

类似阿里云ECS，选择合适的实例规格和操作系统。

## 数据库配置

### MongoDB优化配置

编辑 `/etc/mongod.conf`：
```yaml
# 网络配置
net:
  port: 27017
  bindIp: 127.0.0.1

# 存储配置
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # 根据服务器内存调整

# 系统日志
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: rename

# 进程管理
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

# 安全配置
security:
  authorization: enabled

# 操作分析
operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
```

### 创建数据库用户
```bash
# 连接MongoDB
mongo

# 创建管理员用户
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# 创建应用用户
use xiaohu-codebuddy
db.createUser({
  user: "app_user",
  pwd: "your-app-password",
  roles: ["readWrite"]
})
```

更新应用配置：
```env
MONGODB_URI=mongodb://app_user:your-app-password@localhost:27017/xiaohu-codebuddy
```

## SSL证书配置

### Let's Encrypt免费证书

#### 1. 安装Certbot
```bash
# Ubuntu
sudo apt install -y certbot python3-certbot-nginx

# CentOS
sudo yum install -y certbot python3-certbot-nginx
```

#### 2. 获取证书
```bash
# 自动配置Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 仅获取证书
sudo certbot certonly --webroot -w /var/www/xiaohu-codebuddy/frontend/build -d your-domain.com
```

#### 3. 自动续期
```bash
# 测试续期
sudo certbot renew --dry-run

# 设置定时任务
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### 商业SSL证书

如果使用商业SSL证书，将证书文件放置在安全位置：
```bash
sudo mkdir -p /etc/nginx/ssl
sudo chmod 700 /etc/nginx/ssl

# 复制证书文件
sudo cp your-domain.crt /etc/nginx/ssl/
sudo cp your-domain.key /etc/nginx/ssl/
sudo chmod 600 /etc/nginx/ssl/*
```

## 性能优化

### 1. Node.js优化
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'xiaohu-codebuddy',
    script: './backend/dist/index.js',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: [
      '--max_old_space_size=1024',
      '--optimize-for-size'
    ],
    env: {
      NODE_ENV: 'production',
      UV_THREADPOOL_SIZE: 128
    }
  }]
};
```

### 2. Nginx优化
```nginx
# 工作进程数
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 缓冲区优化
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # 缓存配置
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 3. MongoDB优化
```javascript
// 数据库连接优化
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// 索引优化
// 在模型中添加适当的索引
userSchema.index({ email: 1 });
workSchema.index({ author: 1, createdAt: -1 });
workSchema.index({ bootcamp: 1, isPinned: -1, voteCount: -1 });
```

### 4. 缓存策略
```javascript
// Redis缓存配置
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis服务器拒绝连接');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('重试时间已用尽');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// 缓存中间件
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

## 监控和日志

### 1. 应用监控

#### PM2监控
```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs

# 重启应用
pm2 restart xiaohu-codebuddy

# 查看状态
pm2 status
```

#### 系统监控脚本
```bash
#!/bin/bash
# monitor.sh

# 检查服务状态
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
        systemctl restart $service
    fi
}

# 检查磁盘空间
check_disk() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        echo "⚠️  Disk usage is ${usage}%"
    fi
}

# 检查内存使用
check_memory() {
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $usage -gt 80 ]; then
        echo "⚠️  Memory usage is ${usage}%"
    fi
}

# 执行检查
check_service nginx
check_service mongod
check_disk
check_memory

# 检查应用健康状态
curl -f http://localhost:5000/api/health || echo "❌ Application health check failed"
```

设置定时任务：
```bash
# 每5分钟检查一次
*/5 * * * * /path/to/monitor.sh >> /var/log/monitor.log 2>&1
```

### 2. 日志管理

#### 日志轮转配置
创建 `/etc/logrotate.d/xiaohu-codebuddy`：
```
/var/www/xiaohu-codebuddy/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### 集中日志收集
```javascript
// 使用Winston进行日志管理
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'xiaohu-codebuddy' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## 备份策略

### 1. 数据库备份

#### 自动备份脚本
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="xiaohu-codebuddy"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# 压缩备份
tar -czf $BACKUP_DIR/${DB_NAME}_${DATE}.tar.gz -C $BACKUP_DIR $DATE

# 删除未压缩的备份
rm -rf $BACKUP_DIR/$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${DATE}.tar.gz"
```

设置定时备份：
```bash
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

#### 云存储备份
```bash
#!/bin/bash
# 上传到AWS S3
aws s3 cp $BACKUP_DIR/${DB_NAME}_${DATE}.tar.gz s3://your-backup-bucket/mongodb/

# 上传到阿里云OSS
ossutil cp $BACKUP_DIR/${DB_NAME}_${DATE}.tar.gz oss://your-backup-bucket/mongodb/
```

### 2. 文件备份
```bash
#!/bin/bash
# 备份上传文件
rsync -av --delete /var/www/xiaohu-codebuddy/uploads/ /var/backups/uploads/

# 备份配置文件
tar -czf /var/backups/config_$(date +%Y%m%d).tar.gz \
    /etc/nginx/sites-available/xiaohu-codebuddy \
    /var/www/xiaohu-codebuddy/.env \
    /var/www/xiaohu-codebuddy/ecosystem.config.js
```

### 3. 恢复流程
```bash
# 恢复数据库
mongorestore --db xiaohu-codebuddy --drop /path/to/backup/xiaohu-codebuddy/

# 恢复文件
rsync -av /var/backups/uploads/ /var/www/xiaohu-codebuddy/uploads/

# 重启服务
pm2 restart xiaohu-codebuddy
```

## 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查日志
pm2 logs xiaohu-codebuddy

# 检查端口占用
netstat -tlnp | grep :5000

# 检查环境变量
pm2 env 0

# 重启应用
pm2 restart xiaohu-codebuddy
```

#### 2. 数据库连接失败
```bash
# 检查MongoDB状态
systemctl status mongod

# 检查MongoDB日志
tail -f /var/log/mongodb/mongod.log

# 测试连接
mongo --eval "db.adminCommand('ismaster')"

# 重启MongoDB
systemctl restart mongod
```

#### 3. Nginx配置错误
```bash
# 测试配置
nginx -t

# 检查错误日志
tail -f /var/log/nginx/error.log

# 重新加载配置
nginx -s reload
```

#### 4. SSL证书问题
```bash
# 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

# 手动续期
certbot renew

# 检查证书链
curl -I https://your-domain.com
```

#### 5. 性能问题
```bash
# 检查系统资源
top
htop
iotop

# 检查网络连接
netstat -an | grep :5000

# 分析慢查询
mongo xiaohu-codebuddy --eval "db.setProfilingLevel(2, {slowms: 100})"
```

### 应急处理

#### 服务器宕机恢复
1. 检查硬件状态
2. 启动必要服务
3. 验证数据完整性
4. 恢复应用服务
5. 通知用户

#### 数据丢失恢复
1. 停止写入操作
2. 评估损失范围
3. 从备份恢复
4. 验证数据一致性
5. 重启服务

#### 安全事件处理
1. 隔离受影响系统
2. 分析攻击向量
3. 修复安全漏洞
4. 恢复正常服务
5. 加强监控

---

## 技术支持

### 联系方式
- **GitHub Issues**: https://github.com/xiaohuAI319/xiaohu-codebuddy-learning-site/issues
- **邮箱**: support@xiaohu.com
- **文档**: https://docs.xiaohu.com

### 社区支持
- **微信群**: 小虎CodeBuddy学习群
- **QQ群**: 123456789
- **论坛**: https://forum.xiaohu.com

---

*最后更新: 2024年9月25日*