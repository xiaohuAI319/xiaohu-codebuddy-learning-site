import MembershipTier from '../models/MembershipTier';
import User from '../models/User';

export const initMembershipTiers = async () => {
  try {
    // 检查是否已经初始化
    const existingTiers = await MembershipTier.countDocuments();
    if (existingTiers > 0) {
      console.log('Membership tiers already initialized');
      return;
    }

    // 创建默认会员等级
    const tiers = [
      {
        name: '学员',
        minAmount: 9.9,
        maxAmount: 99,
        permissions: ['view_works', 'vote', 'comment'],
        order: 1,
        description: '基础学员，可以浏览作品和参与投票',
        features: ['查看作品演示', '参与投票评论', '基础学习资源']
      },
      {
        name: '会员',
        minAmount: 100,
        maxAmount: 999,
        permissions: ['view_works', 'vote', 'comment', 'view_basic_source'],
        order: 2,
        description: '正式会员，可以查看部分源码',
        features: ['学员所有权限', '查看部分源码', '基础教程访问', '会员专属内容']
      },
      {
        name: '高级会员',
        minAmount: 1000,
        maxAmount: 4999,
        permissions: ['view_works', 'vote', 'comment', 'view_basic_source', 'view_advanced_source', 'download_files'],
        order: 3,
        description: '高级会员，可以下载完整源码',
        features: ['会员所有权限', '完整源码下载', '高级教程和直播', '优先技术支持']
      },
      {
        name: '共创',
        minAmount: 5000,
        maxAmount: 14999,
        permissions: ['view_works', 'vote', 'comment', 'view_basic_source', 'view_advanced_source', 'download_files', 'participate_creation', 'revenue_share'],
        order: 4,
        description: '共创伙伴，参与项目共创和收益分成',
        features: ['高级会员所有权限', '参与项目共创', '收益分成机制', '内部交流群']
      },
      {
        name: '讲师',
        minAmount: 15000,
        maxAmount: 999999,
        permissions: ['view_works', 'vote', 'comment', 'view_basic_source', 'view_advanced_source', 'download_files', 'participate_creation', 'revenue_share', 'publish_courses', 'manage_students'],
        order: 5,
        description: '平台讲师，可以发布课程和管理学员',
        features: ['共创所有权限', '发布课程权限', '平台收益分成', '讲师认证标识', '专属讲师工具']
      }
    ];

    for (const tierData of tiers) {
      const tier = new MembershipTier(tierData);
      await tier.save();
      console.log(`Created membership tier: ${tier.name}`);
    }

    console.log('Membership tiers initialized successfully');
  } catch (error) {
    console.error('Error initializing membership tiers:', error);
  }
};

export const initAdminUser = async () => {
  try {
    // 检查是否已有管理员
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // 创建默认管理员
    const admin = new User({
      username: 'admin',
      email: 'admin@xiaohu-codebuddy.com',
      password: 'admin123456',
      nickname: '小虎',
      role: 'admin',
      bio: '小虎CodeBuddy学习站创始人',
      currentLevel: '讲师',
      totalPaid: 99999
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123456');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export const initSampleUsers = async () => {
  try {
    // 检查是否已有示例用户
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    if (userCount > 0) {
      console.log('Sample users already exist');
      return;
    }

    // 获取会员等级
    const studentTier = await MembershipTier.findOne({ name: '学员' });
    const memberTier = await MembershipTier.findOne({ name: '会员' });
    const premiumTier = await MembershipTier.findOne({ name: '高级会员' });

    const sampleUsers = [
      {
        username: 'student1',
        email: 'student1@example.com',
        password: '123456',
        nickname: '张同学',
        role: 'student',
        currentLevel: '学员',
        totalPaid: 9.9,
        membershipTier: studentTier?._id
      },
      {
        username: 'member1',
        email: 'member1@example.com',
        password: '123456',
        nickname: '李会员',
        role: 'student',
        currentLevel: '会员',
        totalPaid: 199,
        membershipTier: memberTier?._id
      },
      {
        username: 'premium1',
        email: 'premium1@example.com',
        password: '123456',
        nickname: '王高级',
        role: 'student',
        currentLevel: '高级会员',
        totalPaid: 1999,
        membershipTier: premiumTier?._id
      },
      {
        username: 'coach1',
        email: 'coach1@example.com',
        password: '123456',
        nickname: '陈教练',
        role: 'coach',
        currentLevel: '讲师',
        totalPaid: 0
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      
      // 设置会员到期时间
      if (user.membershipTier) {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        user.membershipExpiry = expiry;
      }
      
      await user.save();
      console.log(`Created sample user: ${user.nickname}`);
    }

    console.log('Sample users created successfully');
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
};