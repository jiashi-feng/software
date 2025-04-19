const jwt = require('jsonwebtoken');
const User = require('../../server/task-service/models/User');

/**
 * 验证JWT令牌的中间件
 */
const authenticate = async (req, res, next) => {
  try {
    // 检查请求头中是否有授权信息
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供授权令牌' 
      });
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在或已被删除' 
      });
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: '无效的令牌' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: '令牌已过期' 
      });
    }
    
    console.error('验证中间件错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
};

/**
 * 验证用户是否为管理员的中间件
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: '需要管理员权限' 
    });
  }
};

module.exports = { authenticate, isAdmin }; 