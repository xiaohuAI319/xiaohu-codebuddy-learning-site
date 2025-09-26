import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import worksRoutes from './routes/works';
import adminRoutes from './routes/admin';
import membershipRoutes from './routes/membership';

const app = express();

// 连接数据库
// connectDB(); // 使用SQLite，不需要连接函数

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);

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

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: err.errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '无效的ID格式'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

export default app;