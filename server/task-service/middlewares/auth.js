const jwt = require('jsonwebtoken');

// JWT密钥，实际生产环境应从环境变量获取
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 身份验证中间件
const authenticate = (req, res, next) => {
  try {
    // 从请求头或查询参数获取token
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: '未提供访问令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('身份验证失败:', error);
    return res.status(401).json({ message: '身份验证失败', error: error.message });
  }
};

// 管理员权限检查中间件
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '请先进行身份验证' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  
  next();
};

module.exports = { authenticate, isAdmin }; 