import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, optionalAuth } from '../middleware/auth';
import { checkMembershipPermission } from '../middleware/membership';
import Work from '../models/Work';
import User from '../models/User';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/works';
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
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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
        cb(new Error('封面图片只支持 JPEG, PNG, GIF, WebP 格式'));
      }
    } else if (file.fieldname === 'htmlFile') {
      // HTML文件限制
      const allowedTypes = /html|htm/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = file.mimetype === 'text/html' || file.mimetype === 'application/octet-stream';
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('只支持 HTML 文件上传'));
      }
    } else {
      cb(new Error('未知的文件字段'));
    }
  }
});

// 获取作品列表（支持权限过滤）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category = 'all', sort = 'votes', page = 1, limit = 20 } = req.query;
    
    // 构建查询条件
    const query: any = {};
    if (category !== 'all') {
      query.category = category;
    }

    // 基础查询（不包含权限过滤的内容）
    let works = await Work.find(query)
      .populate('author', 'nickname currentLevel role')
      .sort(getSortOptions(sort as string))
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // 根据用户权限过滤作品和内容
    if (req.user) {
      const user = await User.findById(req.user.id).populate('membershipTier');
      works = await filterWorksByPermission(works, user);
    } else {
      // 未登录用户只能看到公开作品的预览内容
      works = works.filter(work => work.visibility === 'public').map(work => ({
        ...work.toObject(),
        content: {
          preview: work.content.preview
        }
      }));
    }

    const total = await Work.countDocuments(query);

    res.json({
      success: true,
      data: works,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作品列表失败'
    });
  }
});

// 获取单个作品详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('author', 'nickname currentLevel role');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 增加浏览量
    work.views += 1;
    await work.save();

    // 根据用户权限过滤内容
    let filteredWork = work.toObject();
    if (req.user) {
      const user = await User.findById(req.user.id).populate('membershipTier');
      filteredWork = await filterWorkContentByPermission(work, user);
    } else {
      // 未登录用户只能看预览
      filteredWork.content = {
        preview: work.content.preview
      };
    }

    res.json({
      success: true,
      data: filteredWork
    });
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作品详情失败'
    });
  }
});

// 创建作品
router.post('/', auth, checkMembershipPermission('publish_works'), upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'htmlFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      workUrl,
      visibility = 'public',
      requiredLevel = '学员',
      contentLevels
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.coverImage || files.coverImage.length === 0) {
      return res.status(400).json({
        success: false,
        message: '封面图片是必需的'
      });
    }

    // 处理内容分层
    const content: any = {
      preview: req.body.previewContent || description
    };

    if (req.body.basicContent) content.basic = req.body.basicContent;
    if (req.body.advancedContent) content.advanced = req.body.advancedContent;
    if (req.body.premiumContent) content.premium = req.body.premiumContent;

    // 处理HTML文件或链接
    if (files.htmlFile && files.htmlFile.length > 0) {
      content.sourceCode = `/uploads/works/${files.htmlFile[0].filename}`;
    } else if (workUrl) {
      content.sourceCode = workUrl;
    }

    const work = new Work({
      title,
      description,
      author: req.user.id,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()),
      coverImage: `/uploads/works/${files.coverImage[0].filename}`,
      visibility,
      requiredLevel,
      content
    });

    await work.save();
    await work.populate('author', 'nickname currentLevel role');

    res.json({
      success: true,
      message: '作品创建成功',
      data: work
    });
  } catch (error) {
    console.error('创建作品失败:', error);
    res.status(500).json({
      success: false,
      message: '创建作品失败'
    });
  }
});

// 更新作品
router.put('/:id', auth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'htmlFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 检查权限（作者或管理员）
    if (work.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此作品'
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = { ...req.body };

    // 更新封面图片
    if (files.coverImage && files.coverImage.length > 0) {
      updateData.coverImage = `/uploads/works/${files.coverImage[0].filename}`;
    }

    // 更新HTML文件
    if (files.htmlFile && files.htmlFile.length > 0) {
      updateData.content = {
        ...work.content,
        sourceCode: `/uploads/works/${files.htmlFile[0].filename}`
      };
    }

    // 更新内容分层
    if (req.body.previewContent || req.body.basicContent || req.body.advancedContent || req.body.premiumContent) {
      updateData.content = {
        ...work.content,
        preview: req.body.previewContent || work.content.preview,
        basic: req.body.basicContent || work.content.basic,
        advanced: req.body.advancedContent || work.content.advanced,
        premium: req.body.premiumContent || work.content.premium
      };
    }

    // 处理标签
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((tag: string) => tag.trim());
    }

    const updatedWork = await Work.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'nickname currentLevel role');

    res.json({
      success: true,
      message: '作品更新成功',
      data: updatedWork
    });
  } catch (error) {
    console.error('更新作品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新作品失败'
    });
  }
});

// 删除作品
router.delete('/:id', auth, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 检查权限（作者或管理员）
    if (work.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此作品'
      });
    }

    await Work.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    console.error('删除作品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除作品失败'
    });
  }
});

// 投票
router.post('/:id/vote', auth, checkMembershipPermission('vote'), async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 检查是否已经投过票
    const user = await User.findById(req.user.id);
    if (user.votedWorks.includes(work._id)) {
      return res.status(400).json({
        success: false,
        message: '您已经为此作品投过票了'
      });
    }

    // 增加投票数
    work.votes += 1;
    await work.save();

    // 记录用户投票
    user.votedWorks.push(work._id);
    await user.save();

    res.json({
      success: true,
      message: '投票成功',
      data: {
        votes: work.votes
      }
    });
  } catch (error) {
    console.error('投票失败:', error);
    res.status(500).json({
      success: false,
      message: '投票失败'
    });
  }
});

// 置顶作品（管理员）
router.post('/:id/pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理员可以置顶作品'
      });
    }

    const work = await Work.findByIdAndUpdate(
      req.params.id,
      { isTopPinned: true },
      { new: true }
    );

    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    res.json({
      success: true,
      message: '作品置顶成功',
      data: work
    });
  } catch (error) {
    console.error('置顶作品失败:', error);
    res.status(500).json({
      success: false,
      message: '置顶作品失败'
    });
  }
});

// 取消置顶（管理员）
router.delete('/:id/pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理员可以取消置顶'
      });
    }

    const work = await Work.findByIdAndUpdate(
      req.params.id,
      { isTopPinned: false },
      { new: true }
    );

    if (!work) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    res.json({
      success: true,
      message: '取消置顶成功',
      data: work
    });
  } catch (error) {
    console.error('取消置顶失败:', error);
    res.status(500).json({
      success: false,
      message: '取消置顶失败'
    });
  }
});

// 辅助函数：获取排序选项
function getSortOptions(sort: string) {
  switch (sort) {
    case 'votes':
      return { isTopPinned: -1, votes: -1, createdAt: -1 };
    case 'views':
      return { isTopPinned: -1, views: -1, createdAt: -1 };
    case 'date':
      return { isTopPinned: -1, createdAt: -1 };
    default:
      return { isTopPinned: -1, votes: -1, createdAt: -1 };
  }
}

// 辅助函数：根据用户权限过滤作品列表
async function filterWorksByPermission(works: any[], user: any) {
  const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
  const userLevelIndex = levelHierarchy.indexOf(user.currentLevel);

  return works.filter(work => {
    // 管理员可以看到所有作品
    if (user.role === 'admin') return true;
    
    // 作者可以看到自己的作品
    if (work.author._id.toString() === user._id.toString()) return true;
    
    // 公开作品所有人都可以看到
    if (work.visibility === 'public') return true;
    
    // 会员专属作品需要检查等级
    if (work.visibility === 'members_only') {
      const requiredLevelIndex = levelHierarchy.indexOf(work.requiredLevel);
      return userLevelIndex >= requiredLevelIndex;
    }
    
    return false;
  }).map(work => filterWorkContentByPermission(work, user));
}

// 辅助函数：根据用户权限过滤作品内容
function filterWorkContentByPermission(work: any, user: any) {
  if (!user) {
    return {
      ...work.toObject(),
      content: {
        preview: work.content.preview
      }
    };
  }

  // 管理员和作者可以看到所有内容
  if (user.role === 'admin' || work.author._id.toString() === user._id.toString()) {
    return work.toObject();
  }

  const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
  const userLevelIndex = levelHierarchy.indexOf(user.currentLevel);
  
  const filteredContent: any = {
    preview: work.content.preview
  };

  // 根据用户等级决定可以看到的内容层级
  if (userLevelIndex >= 0 && work.content.basic) {
    filteredContent.basic = work.content.basic;
  }
  
  if (userLevelIndex >= 1 && work.content.advanced) {
    filteredContent.advanced = work.content.advanced;
  }
  
  if (userLevelIndex >= 2 && work.content.premium) {
    filteredContent.premium = work.content.premium;
  }
  
  if (userLevelIndex >= 3 && work.content.sourceCode) {
    filteredContent.sourceCode = work.content.sourceCode;
  }

  return {
    ...work.toObject(),
    content: filteredContent
  };
}

export default router;