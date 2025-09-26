import sequelize from '../config/database';
import User from '../models/User';

async function setAdminRole() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 查找admin用户
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      console.log('未找到admin用户');
      return;
    }

    // 更新为管理员角色
    await adminUser.update({ role: 'admin' });
    console.log(`用户 ${adminUser.username} 已设置为管理员角色`);

    // 验证更新
    const updatedUser = await User.findByPk(adminUser.id);
    console.log(`验证: 用户角色为 ${updatedUser?.role}`);

  } catch (error) {
    console.error('设置管理员角色失败:', error);
  } finally {
    await sequelize.close();
  }
}

setAdminRole();