const sequelize = require('./dist/config/database.js').default;

async function checkTable() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('PRAGMA table_info(Works);');
    console.log('Works表结构:');
    results.forEach(col => {
      console.log(`${col.name}: ${col.type}`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkTable();