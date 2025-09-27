import { sequelize, User, Category, Bootcamp, Coupon, SerialCode } from '../models';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/permissions';
import LevelConfig from '../models/LevelConfig';

// 数据库连接和同步
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite数据库连接成功');

    // 同步数据库表结构 - 强制重建以确保表结构正确
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构同步完成（强制重建）');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 初始化等级配置
const initializeLevelConfigs = async () => {
  console.log('🔄 初始化用户等级配置...');

  try {
    await LevelConfig.initializeDefaultConfigs();
    console.log('✅ 用户等级配置初始化完成');
  } catch (error) {
    console.error('❌ 等级配置初始化失败:', error);
    throw error;
  }
};

// 创建默认分类
const createDefaultCategories = async () => {
  console.log('🔄 创建默认分类...');

  const categories = [
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

  for (const categoryData of categories) {
    const existingCategory = await Category.findOne({ where: { id: categoryData.id } });
    if (!existingCategory) {
      await Category.create(categoryData);
      console.log(`✅ 创建分类: ${categoryData.name}`);
    } else {
      console.log(`⚠️  分类已存在: ${categoryData.name}`);
    }
  }
};

// 创建默认训练营
const createDefaultBootcamps = async () => {
  console.log('🔄 创建默认训练营...');

  const bootcamps = [
    {
      name: 'AI编程训练营第一期',
      description: '首期AI编程训练营，学习使用AI工具进行高效编程',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      isActive: true,
      instructorIds: [],
      studentIds: [],
      maxStudents: 50,
      tags: ['AI编程', '基础入门', '实战项目']
    },
    {
      name: 'AI编程训练营第二期',
      description: '第二期AI编程训练营，进阶AI编程技巧和项目实战',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      isActive: true,
      instructorIds: [],
      studentIds: [],
      maxStudents: 100,
      tags: ['AI编程', '进阶提升', '团队协作']
    },
    {
      name: 'AI编程出海训练营第一期',
      description: '专注于AI编程出海项目，学习国际化开发和部署',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-09-30'),
      isActive: true,
      instructorIds: [],
      studentIds: [],
      maxStudents: 30,
      tags: ['AI编程', '出海项目', '国际化']
    }
  ];

  for (const bootcampData of bootcamps) {
    const existingBootcamp = await Bootcamp.findOne({ where: { name: bootcampData.name } });
    if (!existingBootcamp) {
      await Bootcamp.create(bootcampData);
      console.log(`✅ 创建训练营: ${bootcampData.name}`);
    } else {
      console.log(`⚠️  训练营已存在: ${bootcampData.name}`);
    }
  }
};

// 创建默认管理员账号
const createDefaultAdmin = async () => {
  console.log('🔄 创建默认管理员账号...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xiaohu-codebuddy.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('⚠️  管理员账号已存在:', adminEmail);
    return;
  }

  const admin = await User.create({
    username: 'xiaohu',
    email: adminEmail,
    password: adminPassword, // 会在beforeSave钩子中自动加密
    nickname: '小虎',
    role: UserRole.ADMIN,
    userLevel: 319, // 创始人级别
    bio: '小虎CodeBuddy学习站创始人，致力于AI编程教育。',
    isActive: true,
    joinDate: new Date(),
    levelName: '创始人', // 正确的等级名称
    totalSpent: 0,
    totalPaid: 0,
    availableCoupons: [],
    usedCoupons: [],
    paymentHistory: []
  });

  console.log('✅ 创建管理员账号成功:', adminEmail);
  console.log('🔑 默认密码:', adminPassword);
  console.log('⚠️  请登录后立即修改密码！');
};

// 创建示例优惠券
const createSampleCoupons = async () => {
  console.log('🔄 创建示例优惠券...');

  // 获取管理员用户作为创建者
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.log('⚠️  未找到管理员，跳过优惠券创建');
    return;
  }

  const coupons = [
    {
      code: 'WELCOME10',
      name: '新用户欢迎券',
      description: '新用户专享10%折扣',
      discountType: 'percentage' as const,
      discountValue: 10,
      minPurchaseAmount: 50,
      maxDiscountAmount: 100,
      usageLimit: 100,
      usedCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      isActive: true,
      applicableTierIds: [], // 适用于所有等级
      createdById: admin.id
    },
    {
      code: 'MEMBER20',
      name: '会员专享券',
      description: '会员用户专享20%折扣',
      discountType: 'percentage' as const,
      discountValue: 20,
      minPurchaseAmount: 100,
      maxDiscountAmount: 200,
      usageLimit: 50,
      usedCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
      isActive: true,
      applicableTierIds: [], // 适用于所有等级
      createdById: admin.id
    },
    {
      code: 'UPGRADE50',
      name: '升级专享券',
      description: '升级高级会员专享50元减免',
      discountType: 'fixed' as const,
      discountValue: 50,
      minPurchaseAmount: 500,
      usageLimit: 30,
      usedCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后过期
      isActive: true,
      applicableTierIds: [], // 适用于所有等级
      createdById: admin.id
    }
  ];

  for (const couponData of coupons) {
    const existingCoupon = await Coupon.findOne({ where: { code: couponData.code } });
    if (!existingCoupon) {
      await Coupon.create(couponData);
      console.log(`✅ 创建优惠券: ${couponData.code} - ${couponData.name}`);
    } else {
      console.log(`⚠️  优惠券已存在: ${couponData.code}`);
    }
  }
};

// 创建示例序列号
const createSampleSerialCodes = async () => {
  console.log('🔄 创建示例序列号...');

  // 获取管理员用户作为创建者
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.log('⚠️  未找到管理员，跳过序列号创建');
    return;
  }

  // 为不同等级创建序列号
  const serialCodes = [
    { code: 'MEMBER-2024-001', userLevel: 30, description: '会员等级序列号' },
    { code: 'PREMIUM-2024-001', userLevel: 40, description: '高级会员序列号' },
    { code: 'CREATOR-2024-001', userLevel: 50, description: '共创序列号' },
    { code: 'FOUNDER-2024-001', userLevel: 319, description: '创始人序列号' }
  ];

  for (const codeData of serialCodes) {
    const existingCode = await SerialCode.findOne({ where: { code: codeData.code } });
    if (!existingCode) {
      await SerialCode.create({
        code: codeData.code,
        userLevel: codeData.userLevel,
        isUsed: false,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        description: codeData.description,
        batchId: `INIT-${new Date().toISOString().split('T')[0]}`,
        createdById: admin.id
      });
      console.log(`✅ 创建序列号: ${codeData.code}`);
    } else {
      console.log(`⚠️  序列号已存在: ${codeData.code}`);
    }
  }
};

// 显示初始化完成信息
const showInitializationSummary = async () => {
  console.log('\n🎉 数据库初始化完成！');
  console.log('='.repeat(50));

  // 统计信息
  const userCount = await User.count();
  const categoryCount = await Category.count();
  const bootcampCount = await Bootcamp.count();
  const couponCount = await Coupon.count();
  const serialCodeCount = await SerialCode.count();

  console.log(`📊 数据统计:`);
  console.log(`   用户账号: ${userCount} 个`);
  console.log(`   分类: ${categoryCount} 个`);
  console.log(`   训练营: ${bootcampCount} 个`);
  console.log(`   优惠券: ${couponCount} 个`);
  console.log(`   序列号: ${serialCodeCount} 个`);

  console.log('\n🔑 默认管理员账号:');
  console.log(`   邮箱: ${process.env.ADMIN_EMAIL || 'admin@xiaohu-codebuddy.com'}`);
  console.log(`   密码: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
  console.log(`   等级: 创始人 (Level 319)`);

  console.log('\n💡 接下来你可以:');
  console.log('   1. 启动应用: npm run dev');
  console.log('   2. 访问前端: http://localhost:3000');
  console.log('   3. 使用管理员账号登录');
  console.log('   4. 在管理后台配置更多设置');

  console.log('\n⚠️  重要提醒:');
  console.log('   - 请立即修改默认管理员密码');
  console.log('   - 生产环境请使用强密码和HTTPS');
  console.log('   - 定期备份数据库文件');
  console.log('   - 用户等级基于 userLevel 字段，levelName 字段仅作显示用途');

  console.log('='.repeat(50));
};

// 主初始化函数
const initializeDatabase = async () => {
  try {
    console.log('🚀 开始初始化SQLite数据库...\n');

    // 连接数据库
    await connectDB();

    // 创建默认数据
    await initializeLevelConfigs();
    await createDefaultCategories();
    await createDefaultAdmin();
    await createDefaultBootcamps();
    await createSampleCoupons();
    await createSampleSerialCodes();

    // 显示完成信息
    await showInitializationSummary();

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
    process.exit(0);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  // 加载环境变量
  require('dotenv').config();

  // 运行初始化
  initializeDatabase();
}

export { initializeDatabase };