const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    const { member_id, name, email, password, skills, preferences, time_slots, environment } = req.body;
    
    // 检查用户ID是否已存在
    const existingMemberId = await User.findOne({ member_id });
    if (existingMemberId) {
      return res.status(400).json({
        success: false,
        message: '此成员ID已注册'
      });
    }
    
    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '此邮箱已注册'
        });
      }
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户
    const user = new User({
      member_id,
      name,
      email,
      password: hashedPassword,
      skills: skills || [],
      preferences: preferences || [],
      time_slots: time_slots || [],
      environment: environment || {
        噪音耐受度: 50,
        空间需求: 50,
        社交密度: 50,
        紧急程度接受度: 50,
        多任务处理: 50
      }
    });
    
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: {
        _id: user._id,
        member_id: user.member_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    const { member_id, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ member_id });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '成员ID或密码错误'
      });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: '成员ID或密码错误'
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        _id: user._id,
        member_id: user.member_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取当前用户个人资料
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 更新当前用户个人资料
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, skills, preferences, time_slots, environment } = req.body;
    
    // 构建更新对象
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (skills) updateData.skills = skills;
    if (preferences) updateData.preferences = preferences;
    if (time_slots) updateData.time_slots = time_slots;
    if (environment) updateData.environment = environment;
    
    // 更新用户
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '资料更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 获取当前用户的任务
 */
exports.getUserTasks = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id })
      .populate('task')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('获取用户任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 更新用户偏好
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { preferences, time_slots, environment } = req.body;
    
    // 构建更新对象
    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (time_slots) updateData.time_slots = time_slots;
    if (environment) updateData.environment = environment;
    
    // 更新用户
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '偏好更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户偏好失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取所有用户 (管理员)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('获取所有用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取特定ID的用户 (管理员)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 更新用户 (管理员)
 */
exports.updateUser = async (req, res) => {
  try {
    const updateData = req.body;
    
    // 如果更新包含密码
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 删除用户 (管理员)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 删除相关的任务分配
    await Assignment.deleteMany({ user: req.params.id });
    
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 从JSON导入用户 (管理员)
 */
exports.importUsersFromJson = async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: '请提供用户数组'
      });
    }
    
    const result = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: []
    };
    
    // 默认密码
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    for (const userData of users) {
      try {
        // 检查成员ID是否已存在
        const existingUser = await User.findOne({ member_id: userData.member_id });
        
        if (existingUser) {
          result.failed++;
          result.errors.push(`成员ID ${userData.member_id} 已存在`);
          continue;
        }
        
        // 准备用户数据
        const newUser = {
          ...userData,
          password: hashedPassword
        };
        
        const user = new User(newUser);
        await user.save();
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`导入 ${userData.name || userData.member_id || '未知用户'} 失败: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: '用户导入完成',
      result
    });
  } catch (error) {
    console.error('批量导入用户失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}; 