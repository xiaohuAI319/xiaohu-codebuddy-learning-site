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

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
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
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

export default app;