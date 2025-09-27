#!/bin/bash

# 小虎CodeBuddy学习站数据库重建脚本
# 创建时间: 2025-09-27
# 描述: 快速重建数据库并导入测试数据

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 数据库路径
DB_PATH="database/xiaohu-codebuddy.db"
SCRIPTS_DIR="database/scripts"

echo -e "${YELLOW}开始重建小虎CodeBuddy学习站数据库...${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在backend目录下运行此脚本${NC}"
    exit 1
fi

# 1. 备份现有数据库（如果存在）
if [ -f "$DB_PATH" ]; then
    echo -e "${YELLOW}备份现有数据库...${NC}"
    cp "$DB_PATH" "${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}数据库备份完成${NC}"
fi

# 2. 删除现有数据库
echo -e "${YELLOW}删除现有数据库...${NC}"
rm -f "$DB_PATH"
echo -e "${GREEN}数据库删除完成${NC}"

# 3. 创建新数据库结构
echo -e "${YELLOW}创建数据库表结构...${NC}"
sqlite3 "$DB_PATH" < "$SCRIPTS_DIR/01_create_tables.sql"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}数据库表结构创建完成${NC}"
else
    echo -e "${RED}数据库表结构创建失败${NC}"
    exit 1
fi

# 4. 导入测试数据
echo -e "${YELLOW}导入测试数据...${NC}"
sqlite3 "$DB_PATH" < "$SCRIPTS_DIR/99_import_all_data.sql"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}测试数据导入完成${NC}"
else
    echo -e "${RED}测试数据导入失败${NC}"
    exit 1
fi

# 5. 验证数据导入
echo -e "${YELLOW}验证数据导入...${NC}"
echo "数据库统计信息:"
sqlite3 "$DB_PATH" "SELECT '会员等级: ' || COUNT(*) FROM membership_tiers;"
sqlite3 "$DB_PATH" "SELECT '用户: ' || COUNT(*) FROM users;"
sqlite3 "$DB_PATH" "SELECT '作品: ' || COUNT(*) FROM works;"
sqlite3 "$DB_PATH" "SELECT '训练营: ' || COUNT(*) FROM bootcamps;"
sqlite3 "$DB_PATH" "SELECT '序列号: ' || COUNT(*) FROM serial_codes;"

echo -e "${GREEN}数据库重建完成！${NC}"
echo ""
echo "默认账户信息:"
echo "- 管理员: admin@xiaohu.com / admin123456"
echo "- 测试用户: testuser@example.com / [密码在数据库中]"
echo "- 普通学员: student@example.com / [密码在数据库中]"
echo ""
echo "数据库文件: $DB_PATH"
echo "备份文件: ${DB_PATH}.backup.[时间戳]"