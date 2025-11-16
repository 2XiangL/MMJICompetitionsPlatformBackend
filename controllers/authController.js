const db = require('../models/database');
const jwt = require('jsonwebtoken');

const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const sql = `SELECT * FROM users WHERE username = ? AND role = 'admin'`;
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: '管理员用户名或密码错误' });
    }

    // 简单密码验证
    if (user.password !== password) {
      return res.status(401).json({ message: '管理员用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'admin' },
      process.env.JWT_SECRET || 'manchester_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: '管理员登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role
      }
    });
  });
};

module.exports = {
  adminLogin
};
