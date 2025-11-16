// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    // 如果没有token，继续执行但不设置user
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'manchester_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: '无效令牌' });
    req.user = user;
    next();
  });
};

// 可选认证中间件 - 有token就验证，没有就继续
const optionalAuth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'manchester_secret_key', (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, optionalAuth };
