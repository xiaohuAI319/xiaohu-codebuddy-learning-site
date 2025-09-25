import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个字母和一个数字'),
  
  body('nickname')
    .isLength({ min: 1, max: 50 })
    .withMessage('昵称长度必须在1-50个字符之间')
    .trim()
];

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

export const workValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('作品标题长度必须在1-100个字符之间')
    .trim(),
  
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('作品描述长度必须在1-1000个字符之间')
    .trim(),
  
  body('category')
    .isIn(['regular', 'camp1', 'camp2', 'overseas1'])
    .withMessage('无效的作品分类'),
  
  body('workType')
    .isIn(['file', 'link'])
    .withMessage('无效的作品类型'),
  
  body('workUrl')
    .optional()
    .isURL()
    .withMessage('请输入有效的URL'),
  
  body('coverImage')
    .notEmpty()
    .withMessage('封面图片不能为空'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组格式')
];