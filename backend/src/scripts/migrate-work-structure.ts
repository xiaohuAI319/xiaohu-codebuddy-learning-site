/**
 * 数据库迁移脚本：更新Work表结构
 * 移除旧的分层内容字段，添加新的tags和repositoryUrl字段
 */

import sequelize from '../config/database';

async function migrateWorkStructure() {
  try {
    console.log('开始迁移Work表结构...');

    // 添加新字段
    await sequelize.query(`
      ALTER TABLE Works 
      ADD COLUMN tags VARCHAR(500) NULL COMMENT '标签，逗号分隔';
    `).catch(() => {
      console.log('tags字段已存在，跳过添加');
    });

    await sequelize.query(`
      ALTER TABLE Works 
      ADD COLUMN repositoryUrl VARCHAR(500) NULL COMMENT '源码仓库链接，会员级别及以上可见';
    `).catch(() => {
      console.log('repositoryUrl字段已存在，跳过添加');
    });

    // 移除旧的分层内容字段
    const fieldsToRemove = [
      'previewContent',
      'basicContent', 
      'advancedContent',
      'premiumContent',
      'sourceCode'
    ];

    for (const field of fieldsToRemove) {
      try {
        await sequelize.query(`ALTER TABLE Works DROP COLUMN ${field};`);
        console.log(`已移除字段: ${field}`);
      } catch (error) {
        console.log(`字段 ${field} 不存在或已被移除`);
      }
    }

    console.log('Work表结构迁移完成！');
    
    // 验证表结构
    const [results] = await sequelize.query(`PRAGMA table_info(Works);`);
    console.log('当前Work表结构:');
    console.table(results);

  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateWorkStructure()
    .then(() => {
      console.log('迁移成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

export default migrateWorkStructure;