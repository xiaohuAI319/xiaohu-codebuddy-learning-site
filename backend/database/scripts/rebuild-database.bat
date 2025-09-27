@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 小虎CodeBuddy学习站数据库重建脚本
REM 创建时间: 2025-09-27
REM 描述: 快速重建数据库并导入测试数据

echo ========================================
echo    小虎CodeBuddy学习站数据库重建脚本
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo [错误] 请在backend目录下运行此脚本
    pause
    exit /b 1
)

REM 设置路径
set DB_PATH=database\xiaohu-codebuddy.db
set SCRIPTS_DIR=database\scripts

REM 1. 备份现有数据库（如果存在）
if exist "%DB_PATH%" (
    echo [信息] 备份现有数据库...
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set today=%%c%%a%%b
    for /f "tokens=1-3 delims=:." %%a in ('time /t') do set now=%%a%%b%%c
    copy "%DB_PATH%" "%DB_PATH%.backup.%today%_%now%" >nul
    echo [成功] 数据库备份完成
)

REM 2. 删除现有数据库
echo [信息] 删除现有数据库...
if exist "%DB_PATH%" del "%DB_PATH%"
echo [成功] 数据库删除完成

REM 3. 创建新数据库结构
echo [信息] 创建数据库表结构...
sqlite3 "%DB_PATH%" < "%SCRIPTS_DIR%\01_create_tables.sql"
if %errorlevel% equ 0 (
    echo [成功] 数据库表结构创建完成
) else (
    echo [错误] 数据库表结构创建失败
    pause
    exit /b 1
)

REM 4. 导入测试数据
echo [信息] 导入测试数据...
sqlite3 "%DB_PATH%" < "%SCRIPTS_DIR%\99_import_all_data.sql"
if %errorlevel% equ 0 (
    echo [成功] 测试数据导入完成
) else (
    echo [错误] 测试数据导入失败
    pause
    exit /b 1
)

REM 5. 验证数据导入
echo [信息] 验证数据导入...
echo 数据库统计信息:
sqlite3 "%DB_PATH%" "SELECT '会员等级: ' || COUNT(*) FROM membership_tiers;"
sqlite3 "%DB_PATH%" "SELECT '用户: ' || COUNT(*) FROM users;"
sqlite3 "%DB_PATH%" "SELECT '作品: ' || COUNT(*) FROM works;"
sqlite3 "%DB_PATH%" "SELECT '训练营: ' || COUNT(*) FROM bootcamps;"
sqlite3 "%DB_PATH%" "SELECT '序列号: ' || COUNT(*) FROM serial_codes;"

echo.
echo ========================================
echo              数据库重建完成！
echo ========================================
echo.
echo 默认账户信息:
echo - 管理员: admin@xiaohu.com / admin123456
echo - 测试用户: testuser@example.com / [密码在数据库中]
echo - 普通学员: student@example.com / [密码在数据库中]
echo.
echo 数据库文件: %DB_PATH%
echo 备份文件: %DB_PATH%.backup.[日期_时间]
echo.
pause