-- 为users表添加role字段来区分普通用户和管理员
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- 添加约束确保role只能是user或admin
-- SQLite不支持CHECK约束在表已存在时添加，所以需要重建表

-- 创建新的users表
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    real_name TEXT,
    student_id INTEGER NOT NULL,
    auth_status BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 迁移数据
INSERT INTO users_new (id, username, password, real_name, student_id, auth_status, created_at)
SELECT id, username, password, real_name, student_id, auth_status, created_at FROM users;

-- 删除旧表
DROP TABLE users;

-- 重命名新表
ALTER TABLE users_new RENAME TO users;

-- 创建管理员账户（默认管理员）
INSERT INTO users (username, password, real_name, student_id, auth_status, role)
VALUES ('admin', 'admin123', '系统管理员', '000000', 1, 'admin');