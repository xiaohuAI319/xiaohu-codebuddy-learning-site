/**
 * 创建测试作品脚本
 * 用于测试权限控制和投票功能
 */

import crypto from 'crypto';
import User from '../models/User';
import Work from '../models/Work';
import sequelize from '../config/database';

async function createTestWorks() {
  try {
    console.log('开始创建测试作品...');

    // 获取管理员用户作为作品作者
    const adminUser = await User.findOne({ where: { email: 'admin@xiaohu.com' } });
    if (!adminUser) {
      throw new Error('管理员用户不存在，请先运行 init-db');
    }

    const testWorks = [
      {
        title: 'AI聊天机器人',
        description: '基于GPT的智能聊天机器人，支持多轮对话和上下文理解。使用React + Node.js构建，具有流畅的用户界面和强大的后端支持。',
        category: 'web' as const,
        tags: 'AI,React,Node.js,聊天机器人',
        prompt: '请设计一个现代化的AI聊天机器人界面，需要支持：1) 多轮对话显示 2) 输入框带有发送按钮 3) 侧边栏显示对话历史 4) 响应式设计 5) 深色/浅色主题切换',
        repositoryUrl: 'https://github.com/example/ai-chatbot',
        visibility: 'public' as const,
        link: 'https://example.com/ai-chatbot-demo'
      },
      {
        title: '图片识别应用',
        description: '使用TensorFlow.js构建的图像识别Web应用，可以实时识别物体、人脸和场景。支持图片上传和摄像头拍照功能。',
        category: 'web' as const,
        tags: 'AI,TensorFlow.js,图像识别,JavaScript',
        prompt: '创建一个图像识别Web应用，包含以下功能：1) 图片上传区域 2) 拖拽上传支持 3) 摄像头拍照功能 4) 识别结果显示 5) 置信度评分显示',
        repositoryUrl: 'https://github.com/example/image-recognition',
        visibility: 'public' as const,
        link: 'https://example.com/image-recognition-demo'
      },
      {
        title: '任务管理系统',
        description: '功能完整的任务管理系统，支持团队协作、任务分配、进度跟踪和文件共享。使用Vue.js和Express.js开发。',
        category: 'web' as const,
        tags: 'Vue.js,任务管理,团队协作,Express.js',
        prompt: '设计一个任务管理系统界面，包含：1) 看板视图 2) 列表视图 3) 任务详情弹窗 4) 成员分配功能 5) 进度条显示 6) 截止日期管理',
        repositoryUrl: 'https://github.com/example/task-manager',
        visibility: 'public' as const,
        link: 'https://example.com/task-manager-demo'
      },
      {
        title: '天气应用',
        description: '美观的天气查询应用，支持多城市管理、天气预报和天气图表展示。使用React Native开发，支持iOS和Android。',
        category: 'mobile' as const,
        tags: 'React Native,天气,移动应用,API集成',
        prompt: '开发一个天气应用界面，要求：1) 当前天气显示 2) 7天预报 3) 小时级预报 4) 多城市管理 5) 天气图表 6) 背景根据天气变化',
        repositoryUrl: 'https://github.com/example/weather-app',
        visibility: 'public' as const,
        link: 'https://example.com/weather-app-demo'
      },
      {
        title: '代码编辑器',
        description: '基于Monaco Editor的在线代码编辑器，支持语法高亮、代码补全和实时预览功能。',
        category: 'web' as const,
        tags: 'Monaco Editor,代码编辑,语法高亮,实时预览',
        prompt: '创建一个在线代码编辑器，需要：1) 代码编辑区域 2) 实时预览区域 3) 文件树结构 4) 语法高亮 5) 代码补全 6) 主题切换',
        repositoryUrl: 'https://github.com/example/code-editor',
        visibility: 'public' as const,
        link: 'https://example.com/code-editor-demo'
      }
    ];

    for (const workData of testWorks) {
      // 检查作品是否已存在
      const existingWork = await Work.findOne({ where: { title: workData.title } });

      if (existingWork) {
        console.log(`作品 "${workData.title}" 已存在，跳过创建`);
        continue;
      }

      // 生成唯一slug
      const slug = crypto.randomBytes(6).toString('hex');

      // 创建作品
      const work = await Work.create({
        title: workData.title,
        description: workData.description,
        category: workData.category,
        tags: workData.tags,
        prompt: workData.prompt,
        repositoryUrl: workData.repositoryUrl,
        visibility: workData.visibility,
        link: workData.link,
        slug: slug,
        author: adminUser.id,
        votes: Math.floor(Math.random() * 50), // 随机票数
        isPinned: false,
        coverImage: `/uploads/default-cover-${Math.floor(Math.random() * 5) + 1}.jpg`
      });

      console.log(`✅ 创建作品成功: ${work.title} (票数: ${work.votes})`);
    }

    console.log('测试作品创建完成！');

    // 显示所有作品
    const allWorks = await Work.findAll({
      attributes: ['id', 'title', 'category', 'votes', 'slug'],
      order: [['votes', 'DESC']]
    });

    console.log('\n当前所有作品:');
    console.table(allWorks.map(w => w.toJSON()));

  } catch (error) {
    console.error('创建测试作品失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createTestWorks()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export default createTestWorks;