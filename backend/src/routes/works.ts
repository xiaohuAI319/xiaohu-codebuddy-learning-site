import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Work from '../models/Work';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';
import { auth, optionalAuth, AuthRequest } from '../middleware/auth';
import { checkMembershipPermission } from '../middleware/membership';
import { filterWorksList, filterWorkContent, getUserLevelValue, canViewWork } from '../utils/contentFilter';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      // 封面图片限制
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
      }
    } else if (file.fieldname === 'htmlFile') {
      // HTML文件限制
      const allowedTypes = /html|htm/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = file.mimetype === 'text/html' || file.mimetype === 'application/octet-stream';
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('只允许上传HTML文件'));
      }
    }
  }
});

// 获取所有作品
router.get('/', optionalAuth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { bootcamp, category, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (bootcamp) whereClause.bootcamp = bootcamp;
    if (category) whereClause.category = category;

    let works = await Work.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'role', 'currentLevel']
        }
      ],
      order: [['isPinned', 'DESC'], ['votes', 'DESC'], ['createdAt', 'DESC']],
      limit: Number(limit),
      offset: offset
    });

    // 获取用户信息和等级
    let user = null;
    let userLevel = getUserLevelValue(undefined, false);
    let isAdmin = false;

    if (req.user) {
      user = await User.findByPk(req.user.userId, {
        include: [{ model: MembershipTier, as: 'membershipTier' }]
      });
      
      if (user) {
        userLevel = getUserLevelValue(user.currentLevel, true);
        isAdmin = user.role === 'admin';
      }
    }

    // 过滤可见作品
    const visibleWorks = works.filter((work: any) => 
      canViewWork(work, userLevel, isAdmin, user?.id === work.author)
    );

    // 根据用户等级过滤内容
    const filteredWorks = filterWorksList(visibleWorks, userLevel, isAdmin);

    const total = await Work.count({ where: whereClause });

    res.json({
      works: filteredWorks,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({ error: '获取作品列表失败' });
  }
});

// 获取单个作品详情
router.get('/:id', optionalAuth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const work = await Work.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'role', 'currentLevel']
        }
      ]
    });

    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 获取用户信息和等级
    let user = null;
    let userLevel = getUserLevelValue(undefined, false);
    let isAdmin = false;
    let isAuthor = false;

    if (req.user) {
      user = await User.findByPk(req.user.userId, {
        include: [{ model: MembershipTier, as: 'membershipTier' }]
      });
      
      if (user) {
        userLevel = getUserLevelValue(user.currentLevel, true);
        isAdmin = user.role === 'admin';
        isAuthor = user.id === work.author;
      }
    }

    // 检查访问权限
    if (!canViewWork(work, userLevel, isAdmin, isAuthor)) {
      if (!req.user) {
        res.status(403).json({ error: '需要登录才能查看此作品' });
        return;
      } else {
        res.status(403).json({ error: '无权查看此作品' });
        return;
      }
    }

    // 根据用户等级过滤内容
    const filteredWork = filterWorkContent(work, userLevel, isAdmin);

    res.json(filteredWork);
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({ error: '获取作品详情失败' });
  }
});

// 创建新作品
router.post('/', [
  auth,
  checkMembershipPermission('uploadWork'),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'htmlFile', maxCount: 1 }
  ]),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('标题长度必须在1-100字符之间'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('描述长度必须在1-500字符之间'),
  body('category').isIn(['web', 'mobile', 'desktop', 'ai', 'other']).withMessage('无效的分类'),
  body('visibility').isIn(['public', 'private']).withMessage('无效的可见性设置'),
  body('tags').optional().isLength({ max: 500 }).withMessage('标签长度不能超过500字符'),
  body('repositoryUrl').optional().isURL().withMessage('源码仓库链接格式不正确')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.coverImage || files.coverImage.length === 0) {
      res.status(400).json({ error: '必须上传封面图片' });
      return;
    }

    if (!req.body.link && (!files.htmlFile || files.htmlFile.length === 0)) {
      res.status(400).json({ error: '必须提供作品链接或上传HTML文件' });
      return;
    }

    // 检查源码仓库链接权限
    if (req.body.repositoryUrl) {
      const user = await User.findByPk(req.user!.userId, {
        include: [{ model: MembershipTier, as: 'membershipTier' }]
      });
      
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      const userLevel = getUserLevelValue(user.currentLevel, true);
      if (userLevel < 2) { // 会员级别以下不能上传源码链接
        res.status(403).json({ error: '只有会员级别及以上用户才能上传源码仓库链接' });
        return;
      }
    }

    const workData: any = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags || null,
      repositoryUrl: req.body.repositoryUrl || null,
      bootcamp: req.body.bootcamp || null,
      visibility: req.body.visibility || 'public',
      coverImage: files.coverImage[0].path,
      author: req.user!.userId,
      votes: 0,
      isPinned: false
    };

    if (req.body.link) {
      workData.link = req.body.link;
    }

    if (files.htmlFile && files.htmlFile.length > 0) {
      workData.htmlFile = files.htmlFile[0].path;
    }

    const work = await Work.create(workData);
    
    const createdWork = await Work.findByPk(work.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'role', 'currentLevel']
        }
      ]
    });

    res.status(201).json(createdWork);
  } catch (error) {
    console.error('创建作品失败:', error);
    res.status(500).json({ error: '创建作品失败' });
  }
});

// 更新作品
router.put('/:id', [
  auth,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'htmlFile', maxCount: 1 }
  ]),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('标题长度必须在1-100字符之间'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('描述长度必须在1-500字符之间'),
  body('category').optional().isIn(['web', 'mobile', 'desktop', 'ai', 'other']).withMessage('无效的分类'),
  body('visibility').optional().isIn(['public', 'private']).withMessage('无效的可见性设置'),
  body('tags').optional().isLength({ max: 500 }).withMessage('标签长度不能超过500字符'),
  body('repositoryUrl').optional().isURL().withMessage('源码仓库链接格式不正确')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 检查权限
    if (work.author !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: '无权修改此作品' });
      return;
    }

    // 检查源码仓库链接权限
    if (req.body.repositoryUrl !== undefined) {
      const user = await User.findByPk(req.user!.userId, {
        include: [{ model: MembershipTier, as: 'membershipTier' }]
      });
      
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      const userLevel = getUserLevelValue(user.currentLevel, true);
      if (userLevel < 2 && req.body.repositoryUrl) { // 会员级别以下不能设置源码链接
        res.status(403).json({ error: '只有会员级别及以上用户才能设置源码仓库链接' });
        return;
      }
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {};

    // 更新基本信息
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.repositoryUrl !== undefined) updateData.repositoryUrl = req.body.repositoryUrl;
    if (req.body.bootcamp !== undefined) updateData.bootcamp = req.body.bootcamp;
    if (req.body.visibility) updateData.visibility = req.body.visibility;
    if (req.body.link) updateData.link = req.body.link;

    // 更新文件
    if (files.coverImage && files.coverImage.length > 0) {
      // 删除旧的封面图片
      if (work.coverImage && fs.existsSync(work.coverImage)) {
        fs.unlinkSync(work.coverImage);
      }
      updateData.coverImage = files.coverImage[0].path;
    }

    if (files.htmlFile && files.htmlFile.length > 0) {
      // 删除旧的HTML文件
      if (work.htmlFile && fs.existsSync(work.htmlFile)) {
        fs.unlinkSync(work.htmlFile);
      }
      updateData.htmlFile = files.htmlFile[0].path;
    }

    await work.update(updateData);

    const updatedWork = await Work.findByPk(work.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'role', 'currentLevel']
        }
      ]
    });

    res.json(updatedWork);
  } catch (error) {
    console.error('更新作品失败:', error);
    res.status(500).json({ error: '更新作品失败' });
  }
});

// 删除作品
router.delete('/:id', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 检查权限
    if (work.author !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: '无权删除此作品' });
      return;
    }

    // 删除相关文件
    if (work.coverImage && fs.existsSync(work.coverImage)) {
      fs.unlinkSync(work.coverImage);
    }
    if (work.htmlFile && fs.existsSync(work.htmlFile)) {
      fs.unlinkSync(work.htmlFile);
    }

    await work.destroy();
    res.json({ message: '作品删除成功' });
  } catch (error) {
    console.error('删除作品失败:', error);
    res.status(500).json({ error: '删除作品失败' });
  }
});

// 投票
router.post('/:id/vote', auth, checkMembershipPermission('vote'), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    // 检查用户是否已经投过票
    const user = await User.findByPk(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    // 这里简化处理，实际应该有投票记录表
    // 暂时允许重复投票，每次投票+1
    await work.update({ votes: work.votes + 1 });

    res.json({ message: '投票成功', votes: work.votes + 1 });
  } catch (error) {
    console.error('投票失败:', error);
    res.status(500).json({ error: '投票失败' });
  }
});

// 置顶作品 (仅管理员)
router.post('/:id/pin', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: '只有管理员可以置顶作品' });
      return;
    }

    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    await work.update({ isPinned: true });
    res.json({ message: '作品置顶成功' });
  } catch (error) {
    console.error('置顶作品失败:', error);
    res.status(500).json({ error: '置顶作品失败' });
  }
});

// 取消置顶 (仅管理员)
router.delete('/:id/pin', auth, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: '只有管理员可以取消置顶' });
      return;
    }

    const work = await Work.findByPk(req.params.id);
    if (!work) {
      res.status(404).json({ error: '作品不存在' });
      return;
    }

    await work.update({ isPinned: false });
    res.json({ message: '取消置顶成功' });
  } catch (error) {
    console.error('取消置顶失败:', error);
    res.status(500).json({ error: '取消置顶失败' });
  }
});

export default router;