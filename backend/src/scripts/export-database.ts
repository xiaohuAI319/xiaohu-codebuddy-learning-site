import { sequelize, User, Category, Bootcamp, Coupon, SerialCode } from '../models';
import fs from 'fs';
import path from 'path';

// 数据库导出函数
const exportDatabase = async () => {
  try {
    console.log('🔄 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const exportDir = path.join(process.cwd(), 'database-exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFile = path.join(exportDir, `xiaohu-database-export-${timestamp}.json`);

    console.log('🔄 导出数据中...');

    // 导出所有数据
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        description: '小虎CodeBuddy学习站数据库导出'
      },
      data: {
        users: await User.findAll({
          attributes: { exclude: ['password'] } // 不导出密码
        }),
        categories: await Category.findAll(),
        bootcamps: await Bootcamp.findAll(),
        coupons: await Coupon.findAll(),
        serialCodes: await SerialCode.findAll()
      },
      statistics: {
        users: await User.count(),
        categories: await Category.count(),
        bootcamps: await Bootcamp.count(),
        coupons: await Coupon.count(),
        serialCodes: await SerialCode.count()
      }
    };

    // 写入文件
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

    console.log('✅ 数据库导出完成！');
    console.log(`📁 导出文件: ${exportFile}`);
    console.log(`📊 数据统计:`);
    console.log(`   用户: ${exportData.statistics.users} 个`);
    console.log(`   分类: ${exportData.statistics.categories} 个`);
    console.log(`   训练营: ${exportData.statistics.bootcamps} 个`);
    console.log(`   优惠券: ${exportData.statistics.coupons} 个`);
    console.log(`   序列号: ${exportData.statistics.serialCodes} 个`);

  } catch (error) {
    console.error('❌ 数据库导出失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
    process.exit(0);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  exportDatabase();
}

export { exportDatabase };