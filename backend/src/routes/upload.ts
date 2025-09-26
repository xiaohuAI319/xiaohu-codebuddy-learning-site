import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
const imagesDir = path.join(uploadDir, 'images');
const filesDir = path.join(uploadDir, 'files');

[uploadDir, imagesDir, filesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'workFile') {
      cb(null, filesDir);
    } else {
      cb(new Error('Invalid field name'), '');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, randomName);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const base = path.basename(file.originalname || '');
  // 拒绝可疑文件名与双扩展
  if (!base || base.includes('..') || base.includes('/') || base.includes('\\')) {
    cb(new Error('Invalid file name'), false);
    return;
  }
  if (/\.(html?|zip)\.(html?|zip|jpg|png|gif|webp)$/i.test(base)) {
    cb(new Error('Invalid double extension'), false);
    return;
  }

  if (file.fieldname === 'coverImage') {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const isImageMime = file.mimetype.startsWith('image/');
    if (isImageMime && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover image'), false);
    }
  } else if (file.fieldname === 'workFile') {
    const allowedExts = ['.html', '.htm', '.zip'];
    const htmlMimes = ['text/html', 'application/xhtml+xml'];
    const zipMimes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
    const okMime = (allowedExts.includes(ext) && (htmlMimes.includes(file.mimetype) || zipMimes.includes(file.mimetype)));
    if (okMime) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML and ZIP files are allowed for work files'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 2 // 最多2个文件
  }
});

// 上传封面图片
router.post('/cover-image', auth, upload.single('coverImage'), (req: AuthRequest, res: express.Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      message: 'Cover image uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 上传作品文件
router.post('/work-file', auth, upload.single('workFile'), (req: AuthRequest, res: express.Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/files/${req.file.filename}`;
    
    res.json({
      message: 'Work file uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload work file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 批量上传（封面图片 + 作品文件）
router.post('/batch', auth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'workFile', maxCount: 1 }
]), (req: AuthRequest, res: express.Response): void => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.coverImage || !files.coverImage[0]) {
      res.status(400).json({ error: 'Cover image is required' });
      return;
    }

    const result: any = {
      coverImage: {
        fileUrl: `/uploads/images/${files.coverImage[0].filename}`,
        filename: files.coverImage[0].filename,
        originalName: files.coverImage[0].originalname,
        size: files.coverImage[0].size
      }
    };

    if (files.workFile && files.workFile[0]) {
      result.workFile = {
        fileUrl: `/uploads/files/${files.workFile[0].filename}`,
        filename: files.workFile[0].filename,
        originalName: files.workFile[0].originalname,
        size: files.workFile[0].size
      };
    }

    res.json({
      message: 'Files uploaded successfully',
      files: result
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除文件
router.delete('/file/:filename', auth, (req: AuthRequest, res: express.Response): void => {
  try {
    const { filename } = req.params;
    const { type } = req.query; // 'image' or 'file'

    // 路径穿越防护
    const safe = path.basename(filename);
    if (safe !== filename) {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }
    
    let filePath: string;
    if (type === 'image') {
      filePath = path.join(imagesDir, filename);
    } else if (type === 'file') {
      filePath = path.join(filesDir, filename);
    } else {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 错误处理中间件
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ error: 'Too many files. Maximum is 2 files.' });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ error: 'Unexpected field name.' });
      return;
    }
  }
  
  if (error.message) {
    res.status(400).json({ error: error.message });
    return;
  }
  
  res.status(500).json({ error: 'Upload failed' });
});

export default router;