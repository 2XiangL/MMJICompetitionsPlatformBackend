// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未提供访问令牌' });

  jwt.verify(token, process.env.JWT_SECRET || 'manchester_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: '无效令牌' });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
