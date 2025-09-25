import bcrypt from 'bcryptjs';
import Category from '../models/Category';
import User from '../models/User';
import MembershipTier from '../models/MembershipTier';

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing SQLite database...');

    // 初始化分类数据
    const categoriesCount = await Category.count();
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

      await Category.bulkCreate(defaultCategories);
      console.log('✅ Default categories created');
    }

    // 创建默认管理员账户
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      const adminUser = await User.create({
        username: 'xiaohu',
        email: 'admin@xiaohu-codebuddy.com',
        password: hashedPassword,
        nickname: '小虎',
        role: 'admin',
        bio: '小虎CodeBuddy学习站创始人，致力于AI编程教育。',
        isActive: true,
        joinDate: new Date(),
        currentLevel: '讲师',
        totalSpent: 0,
        totalPaid: 0,
        availableCoupons: [],
        usedCoupons: [],
        paymentHistory: []
      });

      console.log('✅ Default admin user created');
      console.log('📧 Admin credentials: xiaohu / admin123456');
    }

    console.log('✅ SQLite database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};