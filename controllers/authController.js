const db = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const sql = `SELECT * FROM users WHERE username = ?`;
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 简单密码验证（实际应该使用 bcrypt）
    if (user.password !== password) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'manchester_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name
      }
    });
  });
};

const register = (req, res) => {
  const { username, password, real_name, student_id } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const checkSql = `SELECT * FROM users WHERE username = ?`;
  db.get(checkSql, [username], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const insertSql = `INSERT INTO users (username, password, real_name, student_id) VALUES (?, ?, ?, ?)`;
    db.run(insertSql, [username, password, real_name, student_id || ''], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: '注册成功', userId: this.lastID });
    });
  });
};

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

    // 简单密码验证（实际应该使用 bcrypt）
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

// 获取用户信息
const getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT id, username, real_name, student_id, auth_status, role, created_at FROM users WHERE id = ?`;
  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: '获取用户信息成功',
      user
    });
  });
};

// 更新用户信息
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { real_name } = req.body;

  if (!real_name) {
    return res.status(400).json({ message: '真实姓名不能为空' });
  }

  const sql = `UPDATE users SET real_name = ? WHERE id = ?`;
  db.run(sql, [real_name, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取更新后的用户信息
    const selectSql = `SELECT id, username, real_name, student_id, auth_status, role, created_at FROM users WHERE id = ?`;
    db.get(selectSql, [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: '用户信息更新成功',
        user
      });
    });
  });
};

// 修改密码
const changePassword = (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: '当前密码和新密码不能为空' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: '新密码长度至少6位' });
  }

  // 验证当前密码
  const checkSql = `SELECT password FROM users WHERE id = ?`;
  db.get(checkSql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (user.password !== current_password) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 更新密码
    const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
    db.run(updateSql, [new_password, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({
        message: '密码修改成功'
      });
    });
  });
};

module.exports = {
  login,
  register,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword
};
