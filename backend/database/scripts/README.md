# 数据库脚本说明

本目录包含小虎CodeBuddy学习站的数据库创建和数据导入脚本。

## 文件说明

### 创建脚本
- `01_create_tables.sql` - 数据库表结构创建脚本
  - 创建所有必要的表结构
  - 设置索引和约束
  - 创建时间戳更新触发器

### 数据脚本
- `02_membership_tiers_data.sql` - 会员等级数据
- `03_users_data.sql` - 用户数据
- `04_works_data.sql` - 作品数据
- `05_bootcamps_data.sql` - 训练营数据
- `06_coupons_data.sql` - 优惠券数据
- `07_serial_codes_data.sql` - 序列号数据
- `08_votes_data.sql` - 投票数据

### 完整导入脚本
- `99_import_all_data.sql` - 完整数据导入脚本
  - 包含所有测试数据
  - 适合快速重建测试环境

## 使用方法

### 方法1：重建完整数据库（推荐）

```bash
# 1. 删除现有数据库文件
cd backend
rm database/xiaohu-codebuddy.db

# 2. 创建新数据库并导入结构
sqlite3 database/xiaohu-codebuddy.db < database/scripts/01_create_tables.sql

# 3. 导入所有测试数据
sqlite3 database/xiaohu-codebuddy.db < database/scripts/99_import_all_data.sql
```

### 方法2：只重建数据（保留表结构）

```bash
# 清空所有表数据并重新导入
sqlite3 database/xiaohu-codebuddy.db < database/scripts/99_import_all_data.sql
```

### 方法3：Windows环境下使用

```cmd
# 1. 进入backend目录
cd "C:\WPS\389699970\WPS云盘\AI学习\0925小虎学习网站搭建\backend"

# 2. 删除现有数据库
del database\xiaohu-codebuddy.db

# 3. 创建新数据库
sqlite3 database\xiaohu-codebuddy.db < database\scripts\01_create_tables.sql

# 4. 导入测试数据
sqlite3 database\xiaohu-codebuddy.db < database\scripts\99_import_all_data.sql
```

## 数据说明

### 默认账户
- **管理员**: admin@xiaohu.com / admin123456
- **测试用户**: testuser@example.com / [密码在数据库中]
- **普通学员**: student@example.com / [密码在数据库中]

### 测试数据
- **会员等级**: 5个等级（学员→会员→高级会员→共创→讲师）
- **用户**: 3个测试用户
- **作品**: 5个测试作品（不同投票数）
- **训练营**: 3个训练营
- **优惠券**: 3种优惠券
- **序列号**: 25个会员升级码（每个等级5个）

### 投票测试
- 包含2条投票记录，用于测试投票功能
- 作品1获得15票（其中1条来自测试用户）
- 作品2获得8票（其中1条来自普通学员）

## 注意事项

1. **密码安全**: 脚本中的密码是bcrypt哈希值，实际使用时需要替换为真实的哈希值
2. **外键约束**: 导入数据时会临时禁用外键约束以提高性能
3. **文件路径**: 脚本中的文件路径基于项目根目录结构
4. **测试数据**: 所有数据都是测试数据，生产环境需要替换为真实数据

## 自定义数据

如需修改测试数据，可以编辑 `99_import_all_data.sql` 文件中的相应部分。

### 添加新作品
```sql
INSERT INTO Works (title, description, coverImage, slug, category, tags, prompt, author, votes, visibility, createdAt, updatedAt) VALUES
('新作品标题', '作品描述', 'cover.jpg', 'new-work-slug', 'web', '标签1,标签2', '提示词内容', 1, 0, 'public', datetime('now'), datetime('now'));
```

### 添加新用户
```sql
INSERT INTO users (username, email, password, nickname, role, joinDate, isActive, currentLevel, createdAt, updatedAt) VALUES
('newuser@example.com', 'newuser@example.com', '$2b$10$hash', '新用户', 'student', datetime('now'), 1, '学员', datetime('now'), datetime('now'));
```

## 故障排除

### 外键约束错误
如果遇到外键约束错误，确保数据导入的顺序正确：
1. 先导入 membership_tiers
2. 再导入 users
3. 然后导入其他依赖表

### 唯一约束错误
如果遇到唯一约束错误，可以：
1. 删除重复数据
2. 修改slug或其他唯一字段
3. 使用不同的测试数据

---

**创建时间**: 2025-09-27
**最后更新**: 2025-09-27
**维护者**: Claude AI Assistant