import Category from '../models/Category';
import User from '../models/User';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // 初始化分类数据
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const defaultCategories = [
        {
          id: 'regular',
          name: '平时作品',
          description: '学员平时创作的作品',
          order: 1
        },
        {
          id: 'camp1',
          name: 'AI编程训练营第一期',
          description: '第一期训练营学员作品',
          order: 2
        },
        {
          id: 'camp2',
          name: 'AI编程训练营第二期',
          description: '第二期训练营学员作品',
          order: 3
        },
        {
          id: 'overseas1',
          name: 'AI编程出海训练营第一期',
          description: '出海训练营第一期学员作品',
          order: 4
        }
      ];

      await Category.insertMany(defaultCategories);
      console.log('✅ Default categories created');
    }

    // 创建默认管理员账户
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const defaultAdmin = new User({
        username: 'admin',
        email: 'admin@xiaohu-codebuddy.com',
        password: 'admin123456', // 生产环境中应该使用更安全的密码
        nickname: '小虎',
        role: 'admin',
        bio: '小虎CodeBuddy学习站创始人，专注AI编程教育'
      });

      await defaultAdmin.save();
      console.log('✅ Default admin user created');
      console.log('📧 Admin credentials: admin / admin123456');
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};