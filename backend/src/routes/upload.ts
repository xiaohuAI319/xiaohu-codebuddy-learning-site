import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth';

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === 'coverImage') {
    // 图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover image'), false);
    }
  } else if (file.fieldname === 'workFile') {
    // HTML文件或ZIP文件
    const allowedMimes = [
      'text/html',
      'application/zip',
      'application/x-zip-compressed'
    ];
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.html') ||
        file.originalname.toLowerCase().endsWith('.htm') ||
        file.originalname.toLowerCase().endsWith('.zip')) {
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
router.post('/cover-image', auth, upload.single('coverImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
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
router.post('/work-file', auth, upload.single('workFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
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
]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.coverImage || !files.coverImage[0]) {
      return res.status(400).json({ error: 'Cover image is required' });
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
router.delete('/file/:filename', auth, (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query; // 'image' or 'file'
    
    let filePath: string;
    if (type === 'image') {
      filePath = path.join(imagesDir, filename);
    } else if (type === 'file') {
      filePath = path.join(filesDir, filename);
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
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
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 2 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name.' });
    }
  }
  
  if (error.message) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Upload failed' });
});

export default router;