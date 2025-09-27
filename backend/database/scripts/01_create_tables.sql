-- 小虎CodeBuddy学习站数据库创建脚本
-- 创建时间: 2025-09-27
-- 描述: 创建所有必要的表结构

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 删除已存在的表（如果需要重新创建）
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS membership_upgrades;
DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS serial_codes;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS Works;
DROP TABLE IF EXISTS bootcamps;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS membership_tiers;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS sqlite_sequence;

-- 创建分类表
CREATE TABLE `Categories` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200),
  `order` INTEGER NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建会员等级表
CREATE TABLE `membership_tiers` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `level` INTEGER NOT NULL UNIQUE,
  `priceRangeMin` DECIMAL(10,2) NOT NULL,
  `priceRangeMax` DECIMAL(10,2) NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  `icon` VARCHAR(10) NOT NULL,
  `description` TEXT NOT NULL,
  `benefits` TEXT NOT NULL,
  `permissions` TEXT NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建用户表
CREATE TABLE `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50) NOT NULL,
  `role` TEXT NOT NULL DEFAULT 'student',
  `avatar` VARCHAR(255),
  `bio` TEXT,
  `joinDate` DATETIME NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `membershipTierId` INTEGER REFERENCES `membership_tiers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `currentLevel` VARCHAR(50) NOT NULL DEFAULT '学员',
  `totalSpent` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `totalPaid` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `membershipExpiry` DATETIME,
  `availableCoupons` TEXT NOT NULL DEFAULT '[]',
  `usedCoupons` TEXT NOT NULL DEFAULT '[]',
  `paymentHistory` TEXT NOT NULL DEFAULT '[]',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建作品表
CREATE TABLE `Works` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `coverImage` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(100) UNIQUE,
  `htmlFile` VARCHAR(500),
  `link` VARCHAR(500),
  `category` TEXT NOT NULL DEFAULT 'other',
  `tags` VARCHAR(500),
  `repositoryUrl` VARCHAR(500),
  `prompt` TEXT NOT NULL,
  `bootcamp` VARCHAR(100),
  `author` INTEGER NOT NULL REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `votes` INTEGER NOT NULL DEFAULT 0,
  `isPinned` TINYINT(1) NOT NULL DEFAULT 0,
  `visibility` TEXT NOT NULL DEFAULT 'public',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建训练营表
CREATE TABLE `bootcamps` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `instructorIds` TEXT NOT NULL DEFAULT '[]',
  `studentIds` TEXT NOT NULL DEFAULT '[]',
  `maxStudents` INTEGER NOT NULL DEFAULT 50,
  `tags` TEXT NOT NULL DEFAULT '[]',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建优惠券表
CREATE TABLE `coupons` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `discountType` TEXT NOT NULL,
  `discountValue` DECIMAL(10,2) NOT NULL,
  `minPurchaseAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `maxDiscountAmount` DECIMAL(10,2),
  `usageLimit` INTEGER NOT NULL,
  `usedCount` INTEGER NOT NULL DEFAULT 0,
  `validFrom` DATETIME NOT NULL,
  `validTo` DATETIME NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `applicableTierIds` TEXT NOT NULL DEFAULT '[]',
  `createdById` INTEGER NOT NULL REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建序列号表
CREATE TABLE `serial_codes` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `membershipTierId` INTEGER NOT NULL REFERENCES `membership_tiers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `isUsed` TINYINT(1) NOT NULL DEFAULT 0,
  `usedById` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `usedAt` DATETIME,
  `validFrom` DATETIME NOT NULL,
  `validTo` DATETIME NOT NULL,
  `batchId` VARCHAR(100) NOT NULL,
  `createdById` INTEGER NOT NULL REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建操作日志表
CREATE TABLE `operation_logs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `userId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `operatorId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `operationType` VARCHAR(50) NOT NULL,
  `operationDetail` TEXT NOT NULL,
  `targetUserId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `oldValue` TEXT,
  `newValue` TEXT,
  `ipAddress` VARCHAR(45),
  `userAgent` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建会员升级记录表
CREATE TABLE `membership_upgrades` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `userId` INTEGER NOT NULL REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `fromLevel` VARCHAR(50) NOT NULL,
  `toLevel` VARCHAR(50) NOT NULL,
  `upgradeType` TEXT NOT NULL,
  `operatorId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `serialCodeId` INTEGER REFERENCES `serial_codes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `reason` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建投票表
CREATE TABLE `votes` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `userId` INTEGER NOT NULL REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `workId` INTEGER NOT NULL REFERENCES `works` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 创建索引
CREATE INDEX `categories_order` ON `Categories` (`order`);
CREATE INDEX `categories_is_active` ON `Categories` (`isActive`);
CREATE INDEX `categories_created_at` ON `Categories` (`createdAt`);

CREATE INDEX `membership_tiers_level` ON `membership_tiers` (`level`);
CREATE INDEX `membership_tiers_is_active` ON `membership_tiers` (`isActive`);
CREATE INDEX `membership_tiers_price_range_min_price_range_max` ON `membership_tiers` (`priceRangeMin`, `priceRangeMax`);

CREATE INDEX `users_email` ON `users` (`email`);
CREATE INDEX `users_username` ON `users` (`username`);
CREATE INDEX `users_membership_tier_id` ON `users` (`membershipTierId`);
CREATE INDEX `users_role` ON `users` (`role`);

CREATE INDEX `works_author` ON `Works` (`author`);
CREATE INDEX `works_category` ON `Works` (`category`);
CREATE INDEX `works_bootcamp` ON `Works` (`bootcamp`);
CREATE INDEX `works_is_pinned_votes` ON `Works` (`isPinned`, `votes`);
CREATE INDEX `works_visibility` ON `Works` (`visibility`);
CREATE INDEX `works_created_at` ON `Works` (`createdAt`);
CREATE INDEX `works_slug` ON `Works` (`slug`);

CREATE INDEX `bootcamps_name` ON `bootcamps` (`name`);
CREATE INDEX `bootcamps_is_active` ON `bootcamps` (`isActive`);
CREATE INDEX `bootcamps_start_date_end_date` ON `bootcamps` (`startDate`, `endDate`);

CREATE INDEX `coupons_code` ON `coupons` (`code`);
CREATE INDEX `coupons_is_active` ON `coupons` (`isActive`);
CREATE INDEX `coupons_valid_from_valid_to` ON `coupons` (`validFrom`, `validTo`);
CREATE INDEX `coupons_created_by_id` ON `coupons` (`createdById`);

CREATE INDEX `serial_codes_code` ON `serial_codes` (`code`);
CREATE INDEX `serial_codes_is_used` ON `serial_codes` (`isUsed`);
CREATE INDEX `serial_codes_membership_tier_id` ON `serial_codes` (`membershipTierId`);
CREATE INDEX `serial_codes_batch_id` ON `serial_codes` (`batchId`);
CREATE INDEX `serial_codes_created_by_id` ON `serial_codes` (`createdById`);

CREATE INDEX `operation_logs_user_id` ON `operation_logs` (`userId`);
CREATE INDEX `operation_logs_operator_id` ON `operation_logs` (`operatorId`);
CREATE INDEX `operation_logs_operation_type` ON `operation_logs` (`operationType`);
CREATE INDEX `operation_logs_target_user_id` ON `operation_logs` (`targetUserId`);
CREATE INDEX `operation_logs_created_at` ON `operation_logs` (`createdAt`);

CREATE INDEX `membership_upgrades_user_id` ON `membership_upgrades` (`userId`);
CREATE INDEX `membership_upgrades_upgrade_type` ON `membership_upgrades` (`upgradeType`);
CREATE INDEX `membership_upgrades_operator_id` ON `membership_upgrades` (`operatorId`);
CREATE INDEX `membership_upgrades_serial_code_id` ON `membership_upgrades` (`serialCodeId`);
CREATE INDEX `membership_upgrades_created_at` ON `membership_upgrades` (`createdAt`);

CREATE UNIQUE INDEX `votes_user_id_work_id` ON `votes` (`userId`, `workId`);

-- 创建触发器：自动更新时间戳
CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_works_timestamp
AFTER UPDATE ON Works
FOR EACH ROW
BEGIN
  UPDATE Works SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_membership_tiers_timestamp
AFTER UPDATE ON membership_tiers
FOR EACH ROW
BEGIN
  UPDATE membership_tiers SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_bootcamps_timestamp
AFTER UPDATE ON bootcamps
FOR EACH ROW
BEGIN
  UPDATE bootcamps SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_coupons_timestamp
AFTER UPDATE ON coupons
FOR EACH ROW
BEGIN
  UPDATE coupons SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_serial_codes_timestamp
AFTER UPDATE ON serial_codes
FOR EACH ROW
BEGIN
  UPDATE serial_codes SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_operation_logs_timestamp
AFTER UPDATE ON operation_logs
FOR EACH ROW
BEGIN
  UPDATE operation_logs SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_membership_upgrades_timestamp
AFTER UPDATE ON membership_upgrades
FOR EACH ROW
BEGIN
  UPDATE membership_upgrades SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_votes_timestamp
AFTER UPDATE ON votes
FOR EACH ROW
BEGIN
  UPDATE votes SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

-- 完成提示
SELECT '数据库表创建完成！' as message;