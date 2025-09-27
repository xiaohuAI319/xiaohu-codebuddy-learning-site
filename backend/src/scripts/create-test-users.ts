/**
 * 创建测试用户脚本
 * 用于测试不同用户等级的权限控制
 */

import bcrypt from 'bcryptjs';
import User from '../models/User';
import sequelize from '../config/database';
import { UserRole } from '../types/permissions';

async function createTestUsers() {
  try {
    console.log('开始创建测试用户...');

    const testUsers = [
      {
        email: 'student@test.com',
        password: 'test123456',
        nickname: '测试学员',
        currentLevel: '学员',
        role: 'user'
      },
      {
        email: 'member@test.com', 
        password: 'test123456',
        nickname: '测试会员',
        currentLevel: '会员',
        role: 'user'
      },
      {
        email: 'advanced@test.com',
        password: 'test123456', 
        nickname: '测试高级会员',
        currentLevel: '高级会员',
        role: 'user'
      }
    ];

    for (const userData of testUsers) {
      // 检查用户是否已存在
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        console.log(`用户 ${userData.email} 已存在，跳过创建`);
        continue;
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const user = await User.create({
        username: userData.email.split('@')[0], // 从邮箱提取用户名
        email: userData.email,
        password: hashedPassword,
        nickname: userData.nickname,
        role: userData.role as UserRole,
        userLevel: userData.currentLevel === '学员' ? 20 : userData.currentLevel === '会员' ? 30 : 40, // 根据级别设置userLevel
        joinDate: new Date(),
        isActive: true,
        currentLevel: userData.currentLevel,
        totalSpent: 0,
        totalPaid: 0,
        availableCoupons: [],
        usedCoupons: [],
        paymentHistory: []
      });

      console.log(`✅ 创建用户成功: ${user.email} (${user.nickname}) - ${user.currentLevel}`);
    }

    console.log('测试用户创建完成！');
    
    // 显示所有用户
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'nickname', 'currentLevel', 'role'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n当前所有用户:');
    console.table(allUsers.map(u => u.toJSON()));

  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export default createTestUsers;