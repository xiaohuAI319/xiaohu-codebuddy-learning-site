import { sequelize, User, MembershipTier, Bootcamp, Coupon, SerialCode } from '../models';
import bcrypt from 'bcryptjs';

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

// 创建默认会员等级
const createDefaultMembershipTiers = async () => {
  console.log('🔄 创建默认会员等级...');
  
  const tiers = [
    {
      name: '学员',
      level: 1,
      priceRangeMin: 9.9,
      priceRangeMax: 99,
      color: '#10B981', // green-500
      icon: '🎓',
      description: '入门级会员，享受基础学习权益',
      benefits: [
        '查看基础内容',
        '上传作品（每日3个）',
        '参与投票',
        '基础技术支持'
      ],
      permissions: {
        canViewBasic: true,
        canViewAdvanced: false,
        canViewPremium: false,
        canViewSource: false,
        canUploadWorks: true,
        canVote: true,
        maxUploadsPerDay: 3
      },
      isActive: true
    },
    {
      name: '会员',
      level: 2,
      priceRangeMin: 100,
      priceRangeMax: 999,
      color: '#3B82F6', // blue-500
      icon: '⭐',
      description: '标准会员，享受进阶学习权益',
      benefits: [
        '学员所有权益',
        '查看高级内容',
        '上传作品（每日5个）',
        '优先展示',
        '专属会员标识'
      ],
      permissions: {
        canViewBasic: true,
        canViewAdvanced: true,
        canViewPremium: false,
        canViewSource: false,
        canUploadWorks: true,
        canVote: true,
        maxUploadsPerDay: 5
      },
      isActive: true
    },
    {
      name: '高级会员',
      level: 3,
      priceRangeMin: 1000,
      priceRangeMax: 4999,
      color: '#8B5CF6', // violet-500
      icon: '💎',
      description: '高级会员，享受专业学习权益',
      benefits: [
        '会员所有权益',
        '查看高端内容',
        '上传作品（每日10个）',
        '专属高级标识',
        '优先技术支持'
      ],
      permissions: {
        canViewBasic: true,
        canViewAdvanced: true,
        canViewPremium: true,
        canViewSource: false,
        canUploadWorks: true,
        canVote: true,
        maxUploadsPerDay: 10
      },
      isActive: true
    },
    {
      name: '共创',
      level: 4,
      priceRangeMin: 5000,
      priceRangeMax: 14999,
      color: '#F59E0B', // amber-500
      icon: '🚀',
      description: '共创伙伴，参与内容创作和社区建设',
      benefits: [
        '高级会员所有权益',
        '查看源码',
        '上传作品（每日20个）',
        '参与内容创作',
        '共创伙伴标识',
        '专属交流群'
      ],
      permissions: {
        canViewBasic: true,
        canViewAdvanced: true,
        canViewPremium: true,
        canViewSource: true,
        canUploadWorks: true,
        canVote: true,
        maxUploadsPerDay: 20
      },
      isActive: true
    },
    {
      name: '讲师',
      level: 5,
      priceRangeMin: 15000,
      priceRangeMax: 99999,
      color: '#EF4444', // red-500
      icon: '👑',
      description: '讲师级别，拥有最高权限和荣誉',
      benefits: [
        '共创所有权益',
        '无限制上传作品',
        '发布课程',
        '管理学员',
        '讲师专属标识',
        '收益分成'
      ],
      permissions: {
        canViewBasic: true,
        canViewAdvanced: true,
        canViewPremium: true,
        canViewSource: true,
        canUploadWorks: true,
        canVote: true,
        maxUploadsPerDay: -1 // -1表示无限制
      },
      isActive: true
    }
  ];

  for (const tierData of tiers) {
    const existingTier = await MembershipTier.findOne({ where: { level: tierData.level } });
    if (!existingTier) {
      await MembershipTier.create(tierData);
      console.log(`✅ 创建会员等级: ${tierData.name} (Level ${tierData.level})`);
    } else {
      console.log(`⚠️  会员等级已存在: ${tierData.name} (Level ${tierData.level})`);
    }
  }
};

// 创建默认管理员账号
const createDefaultAdmin = async () => {
  console.log('🔄 创建默认管理员账号...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xiaohu.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('⚠️  管理员账号已存在:', adminEmail);
    return;
  }

  // 获取讲师等级（最高等级）
  const instructorTier = await MembershipTier.findOne({ where: { level: 5 } });
  if (!instructorTier) {
    console.error('❌ 未找到讲师等级，请先创建会员等级');
    return;
  }

  const admin = await User.create({
    username: '小虎admin',
    email: adminEmail,
    password: adminPassword, // 会在beforeSave钩子中自动加密
    nickname: '小虎',
    role: 'admin',
    bio: '小虎CodeBuddy学习站创始人，致力于AI编程教育',
    isActive: true,
    joinDate: new Date(),
    currentLevel: '讲师',
    membershipTierId: instructorTier.id,
    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
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

// 创建示例优惠券
const createSampleCoupons = async () => {
  console.log('🔄 创建示例优惠券...');
  
  // 获取管理员用户作为创建者
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.log('⚠️  未找到管理员，跳过优惠券创建');
    return;
  }

  // 获取所有会员等级
  const allTiers = await MembershipTier.findAll();
  
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
      applicableTierIds: allTiers.map(tier => tier.id),
      createdById: admin.id
    },
    {
      code: 'STUDENT50',
      name: '学生专享券',
      description: '学生用户专享50元减免',
      discountType: 'fixed' as const,
      discountValue: 50,
      minPurchaseAmount: 200,
      usageLimit: 50,
      usedCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
      isActive: true,
      applicableTierIds: allTiers.slice(0, 2).map(tier => tier.id), // 只适用于学员和会员
      createdById: admin.id
    },
    {
      code: 'VIP20',
      name: 'VIP专享券',
      description: 'VIP用户专享20%折扣',
      discountType: 'percentage' as const,
      discountValue: 20,
      minPurchaseAmount: 1000,
      maxDiscountAmount: 500,
      usageLimit: 20,
      usedCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后过期
      isActive: true,
      applicableTierIds: allTiers.slice(2).map(tier => tier.id), // 只适用于高级会员及以上
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

  // 获取会员等级
  const tiers = await MembershipTier.findAll({ order: [['level', 'ASC']] });
  
  // 为每个等级创建5个序列号
  for (const tier of tiers) {
    for (let i = 1; i <= 5; i++) {
      const code = `${tier.name.toUpperCase()}-${Date.now()}-${i.toString().padStart(3, '0')}`;
      
      const existingCode = await SerialCode.findOne({ where: { code } });
      if (!existingCode) {
        await SerialCode.create({
          code,
          membershipTierId: tier.id,
          isUsed: false,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
          batchId: `INIT-${tier.name}-${new Date().toISOString().split('T')[0]}`,
          createdById: admin.id
        });
        
        console.log(`✅ 创建序列号: ${code} (${tier.name})`);
      }
    }
  }
};

// 显示初始化完成信息
const showInitializationSummary = async () => {
  console.log('\n🎉 数据库初始化完成！');
  console.log('='.repeat(50));
  
  // 统计信息
  const tierCount = await MembershipTier.count();
  const userCount = await User.count();
  const bootcampCount = await Bootcamp.count();
  const couponCount = await Coupon.count();
  const serialCodeCount = await SerialCode.count();
  
  console.log(`📊 数据统计:`);
  console.log(`   会员等级: ${tierCount} 个`);
  console.log(`   用户账号: ${userCount} 个`);
  console.log(`   训练营: ${bootcampCount} 个`);
  console.log(`   优惠券: ${couponCount} 个`);
  console.log(`   序列号: ${serialCodeCount} 个`);
  
  console.log('\n🔑 默认管理员账号:');
  console.log(`   邮箱: ${process.env.ADMIN_EMAIL || 'admin@xiaohu.com'}`);
  console.log(`   密码: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
  
  console.log('\n💡 接下来你可以:');
  console.log('   1. 启动应用: npm run dev');
  console.log('   2. 访问前端: http://localhost:3000');
  console.log('   3. 使用管理员账号登录');
  console.log('   4. 在管理后台配置更多设置');
  
  console.log('\n⚠️  重要提醒:');
  console.log('   - 请立即修改默认管理员密码');
  console.log('   - 生产环境请使用强密码和HTTPS');
  console.log('   - 定期备份数据库文件');
  
  console.log('='.repeat(50));
};

// 主初始化函数
const initializeDatabase = async () => {
  try {
    console.log('🚀 开始初始化SQLite数据库...\n');
    
    // 连接数据库
    await connectDB();
    
    // 创建默认数据
    await createDefaultMembershipTiers();
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