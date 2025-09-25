import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// 导入数据库配置
import sequelize from './config/database';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import workRoutes from './routes/works';
import categoryRoutes from './routes/categories';
import uploadRoutes from './routes/upload';
import membershipRoutes from './routes/membership';
// import adminRoutes from './routes/admin'; // 已删除

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/works', workRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/membership', membershipRoutes);
// app.use('/api/admin', adminRoutes); // 已删除

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'SQLite'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors?.map((e: any) => e.message).join(', ') || err.message
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      details: 'Resource already exists'
    });
  }
  
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite数据库连接成功');
    
    // 同步数据库表结构（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('✅ 数据库表结构同步完成');
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