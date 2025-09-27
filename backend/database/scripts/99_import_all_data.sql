-- 小虎CodeBuddy学习站数据导入脚本
-- 创建时间: 2025-09-27
-- 描述: 导入所有测试数据
-- 使用方法: sqlite3 database/xiaohu-codebuddy.db < 99_import_all_data.sql

-- 启用外键约束
PRAGMA foreign_keys = OFF;

-- 开始事务
BEGIN TRANSACTION;

-- 导入会员等级数据
INSERT INTO membership_tiers (id, name, level, priceRangeMin, priceRangeMax, color, icon, description, benefits, permissions, isActive, createdAt, updatedAt) VALUES
(1, '学员', 1, 0.00, 100.00, 'text-gray-600', '🎓', '初级学员，可以访问基础内容', '基础课程访问,作品浏览', 'view_basic_content,vote', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(2, '会员', 2, 100.00, 1000.00, 'text-blue-600', '💎', '正式会员，解锁更多高级内容', '基础+高级课程,专属社区', 'view_basic_content,view_advanced_content,vote,comment', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(3, '高级会员', 3, 1000.00, 5000.00, 'text-purple-600', '👑', '高级会员，全部内容无限制访问', '所有课程,一对一指导,项目实战', 'all_content_access,vote,comment,upload,moderate', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(4, '共创', 4, 5000.00, 15000.00, 'text-yellow-600', '🚀', '共创伙伴，参与项目开发和决策', '所有权益+项目分成,决策权', 'all_permissions,project_management,team_leading', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(5, '讲师', 5, 15000.00, 999999.99, 'text-red-600', '🎯', '认证讲师，可以创建课程和教学', '所有权益+教学资格,品牌推广', 'all_permissions,teaching,content_creation,student_management', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 导入用户数据
INSERT INTO users (id, username, email, password, nickname, role, joinDate, isActive, membershipTierId, currentLevel, totalSpent, totalPaid, availableCoupons, usedCoupons, paymentHistory, createdAt, updatedAt) VALUES
(1, 'admin@xiaohu.com', 'admin@xiaohu.com', '$2b$10$your_hashed_password_here', '管理员', 'admin', '2025-01-01 00:00:00', 1, 5, '讲师', 0.00, 0.00, '[]', '[]', '[]', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(2, 'testuser@example.com', 'testuser@example.com', '$2b$10$your_hashed_password_here', '测试用户', 'student', '2025-01-15 00:00:00', 1, 1, '学员', 0.00, 0.00, '[]', '[]', '[]', '2025-01-15 00:00:00', '2025-01-15 00:00:00'),
(3, 'student@example.com', 'student@example.com', '$2b$10$your_hashed_password_here', '学员小明', 'student', '2025-02-01 00:00:00', 1, 1, '学员', 0.00, 0.00, '[]', '[]', '[]', '2025-02-01 00:00:00', '2025-02-01 00:00:00');

-- 导入作品数据
INSERT INTO Works (id, title, description, coverImage, slug, htmlFile, link, category, tags, repositoryUrl, prompt, bootcamp, author, votes, isPinned, visibility, createdAt, updatedAt) VALUES
(1, 'AI聊天机器人', '基于GPT的智能聊天机器人，支持多轮对话和上下文理解。', 'uploads/works/ai-chatbot/cover.jpg', 'ai-chatbot-xyz123', 'uploads/works/ai-chatbot/index.html', 'https://example.com/ai-chatbot-demo', 'web', 'AI,React,Node.js,聊天机器人', 'https://github.com/example/ai-chatbot', '请设计一个现代化的AI聊天机器人界面，需要支持：1) 多轮对话显示 2) 用户输入框 3) 发送按钮 4) 聊天历史记录 5) 响应式设计', NULL, 2, 15, 1, 'public', '2025-09-01 10:00:00', '2025-09-27 09:00:00'),
(2, '任务管理应用', '一个功能完整的任务管理应用，支持项目创建、任务分配和进度跟踪。', 'uploads/works/task-manager/cover.jpg', 'task-manager-abc456', 'uploads/works/task-manager/index.html', '', 'web', 'Vue.js,Node.js,MongoDB,任务管理', 'https://github.com/example/task-manager', '创建一个任务管理应用，要求包含：1) 项目列表 2) 任务看板 3) 拖拽功能 4) 截止日期提醒 5) 团队协作功能', NULL, 3, 8, 0, 'public', '2025-09-02 14:30:00', '2025-09-27 09:00:00'),
(3, '天气预报小程序', '微信小程序风格的天气预报应用，实时更新天气信息和生活指数。', 'uploads/works/weather-app/cover.jpg', 'weather-app-def789', '', 'https://example.com/weather-app', 'mobile', '微信小程序,天气预报,API', 'https://github.com/example/weather-app', '开发一个天气预报小程序，需要实现：1) 当前天气显示 2) 7天天气预报 3) 生活指数建议 4) 城市搜索功能 5) 本地缓存', NULL, 2, 12, 0, 'public', '2025-09-03 16:45:00', '2025-09-27 09:00:00'),
(4, '数据可视化仪表板', '企业级数据可视化仪表板，支持多种图表类型和实时数据更新。', 'uploads/works/dashboard/cover.jpg', 'dashboard-ghi012', 'uploads/works/dashboard/index.html', '', 'web', 'React,D3.js,数据可视化,仪表板', 'https://github.com/example/dashboard', '创建一个数据可视化仪表板，要求包含：1) 多种图表类型 2) 实时数据更新 3) 筛选和搜索功能 4) 响应式布局 5) 数据导出功能', NULL, 3, 6, 0, 'public', '2025-09-04 11:20:00', '2025-09-27 09:00:00'),
(5, '在线教育平台', '完整的在线教育平台，支持课程管理、视频播放和学习进度跟踪。', 'uploads/works/education-platform/cover.jpg', 'education-platform-jkl345', '', 'https://example.com/education-platform', 'web', 'React,Node.js,在线教育,视频播放', 'https://github.com/example/education-platform', '开发一个在线教育平台，需要包含：1) 课程列表和详情 2) 视频播放功能 3) 学习进度跟踪 4) 作业提交系统 5) 讨论区功能', NULL, 1, 3, 0, 'public', '2025-09-05 09:15:00', '2025-09-27 09:00:00');

-- 导入训练营数据
INSERT INTO bootcamps (id, name, description, startDate, endDate, isActive, instructorIds, studentIds, maxStudents, tags, createdAt, updatedAt) VALUES
(1, 'AI编程训练营', '深入学习AI编程技术，包括机器学习、深度学习和实际项目开发。', '2025-03-01 00:00:00', '2025-05-31 23:59:59', 1, '[1]', '[2,3]', 50, 'AI,机器学习,深度学习,Python', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(2, 'Web全栈开发训练营', '从前端到后端的完整Web开发技术栈学习，包含React和Node.js。', '2025-06-01 00:00:00', '2025-08-31 23:59:59', 1, '[1]', '[]', 40, 'React,Node.js,Web开发,全栈', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(3, '移动应用开发训练营', '专注于移动应用开发，包括React Native和Flutter技术。', '2025-09-01 00:00:00', '2025-11-30 23:59:59', 1, '[1]', '[]', 30, '移动开发,React Native,Flutter,跨平台', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 导入优惠券数据
INSERT INTO coupons (id, code, name, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, usageLimit, usedCount, validFrom, validTo, isActive, applicableTierIds, createdById, createdAt, updatedAt) VALUES
(1, 'WELCOME10', '新用户欢迎券', '新用户注册专享优惠券', 'percentage', 10.00, 50.00, 100.00, 100, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1, '[1,2]', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(2, 'SPRING20', '春季促销券', '春季学习优惠活动', 'percentage', 20.00, 200.00, 500.00, 50, 0, '2025-03-01 00:00:00', '2025-05-31 23:59:59', 1, '[2,3]', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(3, 'STUDENT50', '学生专享券', '学生认证用户专属优惠券', 'fixed', 50.00, 100.00, NULL, 200, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1, '[1]', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 导入序列号数据（会员升级码）
INSERT INTO serial_codes (id, code, membershipTierId, isUsed, usedById, usedAt, validFrom, validTo, batchId, createdById, createdAt, updatedAt) VALUES
(1, 'STUDENT-2025-001', 1, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-001', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(2, 'STUDENT-2025-002', 1, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-001', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(3, 'MEMBER-2025-001', 2, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-002', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(4, 'MEMBER-2025-002', 2, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-002', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(5, 'ADVANCED-2025-001', 3, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-003', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(6, 'ADVANCED-2025-002', 3, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-003', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(7, 'CO-CREATE-2025-001', 4, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-004', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(8, 'CO-CREATE-2025-002', 4, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-004', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(9, 'INSTRUCTOR-2025-001', 5, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-005', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(10, 'INSTRUCTOR-2025-002', 5, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-005', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 生成更多测试序列号
INSERT INTO serial_codes (code, membershipTierId, isUsed, usedById, usedAt, validFrom, validTo, batchId, createdById, createdAt, updatedAt) VALUES
('STUDENT-2025-003', 1, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-001', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('STUDENT-2025-004', 1, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-001', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('STUDENT-2025-005', 1, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-001', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('MEMBER-2025-003', 2, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-002', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('MEMBER-2025-004', 2, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-002', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('MEMBER-2025-005', 2, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-002', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('ADVANCED-2025-003', 3, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-003', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('ADVANCED-2025-004', 3, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-003', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('ADVANCED-2025-005', 3, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-003', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('CO-CREATE-2025-003', 4, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-004', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('CO-CREATE-2025-004', 4, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-004', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('CO-CREATE-2025-005', 4, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-004', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('INSTRUCTOR-2025-003', 5, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-005', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('INSTRUCTOR-2025-004', 5, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-005', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('INSTRUCTOR-2025-005', 5, 0, NULL, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'BATCH-005', 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 导入投票数据（测试用户对作品的投票）
INSERT INTO votes (id, userId, workId, createdAt, updatedAt) VALUES
(1, 2, 1, '2025-09-27 08:30:00', '2025-09-27 08:30:00'),
(2, 3, 2, '2025-09-27 09:15:00', '2025-09-27 09:15:00');

-- 提交事务
COMMIT;

-- 重新启用外键约束
PRAGMA foreign_keys = ON;

-- 完成提示
SELECT '数据导入完成！' as message;
SELECT '会员等级: ' || COUNT(*) || ' 条' as count FROM membership_tiers;
SELECT '用户: ' || COUNT(*) || ' 条' as count FROM users;
SELECT '作品: ' || COUNT(*) || ' 条' as count FROM Works;
SELECT '训练营: ' || COUNT(*) || ' 条' as count FROM bootcamps;
SELECT '优惠券: ' || COUNT(*) || ' 条' as count FROM coupons;
SELECT '序列号: ' || COUNT(*) || ' 条' as count FROM serial_codes;
SELECT '投票记录: ' || COUNT(*) || ' 条' as count FROM votes;