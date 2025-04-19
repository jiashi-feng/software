const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const User = require('../models/User');
const { calculateMatchScore, findBestMatches } = require('../../../src/utils/matchAlgorithm');

/**
 * 获取用户的所有任务分配
 */
exports.getUserAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id })
      .populate('task')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('获取用户任务分配失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户的特定任务分配
 */
exports.getUserAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('task');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在或不属于当前用户'
      });
    }
    
    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('获取任务分配详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 更新任务分配状态 (用户)
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // 验证状态
    const validStatuses = ['进行中', '已完成', '已拒绝'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态'
      });
    }
    
    // 查找任务分配
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在或不属于当前用户'
      });
    }
    
    // 更新状态和相关时间
    assignment.status = status;
    
    if (status === '进行中' && !assignment.started_at) {
      assignment.started_at = Date.now();
    } else if (status === '已完成' && !assignment.completed_at) {
      assignment.completed_at = Date.now();
      
      // 更新任务状态
      await Task.findByIdAndUpdate(assignment.task, { status: '已完成' });
      
      // 从用户活动任务中移除
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { active_tasks: assignment._id } }
      );
    }
    
    await assignment.save();
    
    res.json({
      success: true,
      message: '任务状态更新成功',
      assignment
    });
  } catch (error) {
    console.error('更新任务状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 添加用户备注
 */
exports.addUserNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: '备注不能为空'
      });
    }
    
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在或不属于当前用户'
      });
    }
    
    assignment.user_note = note;
    await assignment.save();
    
    res.json({
      success: true,
      message: '备注已添加',
      assignment
    });
  } catch (error) {
    console.error('添加用户备注失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取所有任务分配 (管理员)
 */
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('task')
      .populate('user', '-password')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('获取所有任务分配失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 自动分配任务给最匹配的用户 (管理员)
 */
exports.assignTasksToUsers = async (req, res) => {
  try {
    const { taskIds, autoAssign = true } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({
        success: false,
        message: '请提供任务ID数组'
      });
    }
    
    // 获取任务
    const tasks = await Task.find({ 
      _id: { $in: taskIds },
      status: '未分配'
    });
    
    if (tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有找到有效的未分配任务'
      });
    }
    
    // 获取所有用户
    const users = await User.find();
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '系统中没有用户'
      });
    }
    
    const results = [];
    
    for (const task of tasks) {
      // 为每个任务找到最匹配的用户
      const userMatches = [];
      
      for (const user of users) {
        const matchDetails = calculateMatchScore(user, task);
        userMatches.push({
          user: user._id,
          name: user.name,
          match_score: matchDetails.final_score,
          component_scores: matchDetails.component_scores
        });
      }
      
      // 按匹配度排序
      userMatches.sort((a, b) => b.match_score - a.match_score);
      
      // 获取最佳匹配的用户
      const bestMatch = userMatches[0];
      
      if (autoAssign) {
        // 创建任务分配
        const assignment = new Assignment({
          user: bestMatch.user,
          task: task._id,
          match_score: bestMatch.match_score,
          component_scores: bestMatch.component_scores,
          status: '已分配'
        });
        
        await assignment.save();
        
        // 更新任务状态
        task.status = '已分配';
        await task.save();
        
        // 更新用户活动任务
        await User.findByIdAndUpdate(
          bestMatch.user,
          { $push: { active_tasks: assignment._id } }
        );
        
        results.push({
          task: task.name,
          task_id: task._id,
          assigned_to: bestMatch.name,
          user_id: bestMatch.user,
          match_score: bestMatch.match_score,
          assignment_id: assignment._id
        });
      } else {
        // 仅返回匹配信息，不进行实际分配
        results.push({
          task: task.name,
          task_id: task._id,
          best_match: bestMatch.name,
          user_id: bestMatch.user,
          match_score: bestMatch.match_score,
          all_matches: userMatches.slice(0, 3) // 返回前3个最佳匹配
        });
      }
    }
    
    res.json({
      success: true,
      message: autoAssign ? '任务已自动分配' : '已计算任务匹配度',
      results
    });
  } catch (error) {
    console.error('自动分配任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 手动分配特定任务给特定用户 (管理员)
 */
exports.assignTaskToUser = async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    
    // 检查任务和用户是否存在
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (task.status !== '未分配') {
      return res.status(400).json({
        success: false,
        message: '此任务已被分配'
      });
    }
    
    // 计算匹配分数
    const matchDetails = calculateMatchScore(user, task);
    
    // 创建任务分配
    const assignment = new Assignment({
      user: userId,
      task: taskId,
      match_score: matchDetails.final_score,
      component_scores: matchDetails.component_scores,
      status: '已分配'
    });
    
    await assignment.save();
    
    // 更新任务状态
    task.status = '已分配';
    await task.save();
    
    // 更新用户活动任务
    await User.findByIdAndUpdate(
      userId,
      { $push: { active_tasks: assignment._id } }
    );
    
    res.json({
      success: true,
      message: '任务分配成功',
      assignment: await Assignment.findById(assignment._id)
        .populate('task')
        .populate('user', '-password')
    });
  } catch (error) {
    console.error('手动分配任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 更新任务分配 (管理员)
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (admin_note) updateData.admin_note = admin_note;
    
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('task').populate('user', '-password');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在'
      });
    }
    
    // 如果状态更新为"已取消"，更新相关任务和用户
    if (status === '已取消') {
      // 更新任务状态为未分配
      await Task.findByIdAndUpdate(
        assignment.task._id,
        { status: '未分配' }
      );
      
      // 从用户活动任务中移除
      await User.findByIdAndUpdate(
        assignment.user._id,
        { $pull: { active_tasks: assignment._id } }
      );
    }
    
    res.json({
      success: true,
      message: '任务分配更新成功',
      assignment
    });
  } catch (error) {
    console.error('更新任务分配失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 删除任务分配 (管理员)
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在'
      });
    }
    
    // 更新任务状态为未分配
    await Task.findByIdAndUpdate(
      assignment.task,
      { status: '未分配' }
    );
    
    // 从用户活动任务中移除
    await User.findByIdAndUpdate(
      assignment.user,
      { $pull: { active_tasks: assignment._id } }
    );
    
    // 删除任务分配
    await Assignment.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: '任务分配已删除'
    });
  } catch (error) {
    console.error('删除任务分配失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 添加管理员备注 (管理员)
 */
exports.addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: '备注不能为空'
      });
    }
    
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { admin_note: note },
      { new: true }
    ).populate('task').populate('user', '-password');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: '任务分配不存在'
      });
    }
    
    res.json({
      success: true,
      message: '管理员备注已添加',
      assignment
    });
  } catch (error) {
    console.error('添加管理员备注失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}; 