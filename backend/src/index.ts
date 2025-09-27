import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import rateLimit from 'express-rate-limit';
import path from 'path';
// 初始化模型与关联（副作用导入）
import './models';
import LevelConfig from './models/LevelConfig';

// 导入数据库配置
import sequelize from './config/database';

// 导入错误处理
import { errorHandler, AppError, createNotFoundError } from './utils/errorHandler';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import workRoutes from './routes/works';
import categoryRoutes from './routes/categories';
import uploadRoutes from './routes/upload';
import membershipRoutes from './routes/membership';
import adminRoutes from './routes/admin';



const app = express();
// 信任代理，用于正确识别客户端IP（解决 express-rate-limit 的 X-Forwarded-For 警告）
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet());

// CORS配置
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  // 开发环境跳过限流，避免 React 严格模式/热更新触发 429
  skip: () => process.env.NODE_ENV !== 'production'
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 添加缓存控制
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d', // 缓存1天
  etag: true,
  lastModified: true
}));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/works', workRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'SQLite'
  });
});

// 服务前端静态文件
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// 所有非API请求都返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// API 404处理 (这个不会被触发，因为上面的通配符会捕获所有请求)
app.use('/api/*', (req, res, next) => {
  next(createNotFoundError('API endpoint not found'));
});

// 全局错误处理
app.use(errorHandler);

// 数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite数据库连接成功');

    // 同步数据库表结构（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('✅ 数据库表结构同步完成');
      // 确保 Works 表存在 slug 列与唯一索引（SQLite 安全方式）
      try {
        const [cols] = await sequelize.query("PRAGMA table_info('Works')");
        const hasSlug = Array.isArray(cols) && cols.some((c: any) => c.name === 'slug');
        if (!hasSlug) {
          await sequelize.query("ALTER TABLE `Works` ADD COLUMN `slug` VARCHAR(100)");
        }
        await sequelize.query("CREATE UNIQUE INDEX IF NOT EXISTS `works_slug` ON `Works` (`slug`)");
        console.log('✅ Works.slug 列与唯一索引已就绪');
      } catch (e) {
        console.warn('⚠️ 初始化 Works.slug 列或索引时出现警告（已忽略）:', (e as any)?.message || String(e));
      }

      // 初始化LevelConfig数据
      try {
        await LevelConfig.initializeDefaultConfigs();
        console.log('✅ LevelConfig权限配置数据初始化完成');
      } catch (e) {
        console.warn('⚠️ 初始化LevelConfig数据时出现警告:', (e as any)?.message || String(e));
      }
    }
  } catch (error) {
    console.error('❌ SQLite数据库连接失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📱 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`📊 API健康检查: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);