// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const db = require('../models/database');

const authenticateAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未提供访问令牌' });

  jwt.verify(token, process.env.JWT_SECRET || 'manchester_secret_key', async (err, user) => {
    if (err) return res.status(403).json({ message: '无效令牌' });

    // 验证用户角色是否为管理员
    const sql = `SELECT role FROM users WHERE id = ?`;
    db.get(sql, [user.id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!result || result.role !== 'admin') {
        return res.status(403).json({ message: '权限不足，需要管理员权限' });
      }

      req.user = user;
      next();
    });
  });
};

module.exports = { authenticateAdmin };