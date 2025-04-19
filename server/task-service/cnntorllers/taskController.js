const Task = require('../models/Task');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { findBestMatches } = require('../../../src/utils/matchAlgorithm');

/**
 * 获取所有任务
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ created_at: -1 });
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取特定ID的任务
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 创建新任务
 */
exports.createTask = async (req, res) => {
  try {
    // 验证任务ID是否唯一
    const existingTask = await Task.findOne({ task_id: req.body.task_id });
    if (existingTask) {
      return res.status(400).json({
        success: false,
        message: '此任务ID已存在'
      });
    }
    
    const task = new Task(req.body);
    await task.save();
    
    res.status(201).json({
      success: true,
      message: '任务创建成功',
      task
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 更新任务
 */
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    res.json({
      success: true,
      message: '任务更新成功',
      task
    });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

/**
 * 删除任务
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    // 删除相关联的分配
    await Assignment.deleteMany({ task: req.params.id });
    
    res.json({
      success: true,
      message: '任务删除成功'
    });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 为当前用户推荐任务
 */
exports.getRecommendedTasksForUser = async (req, res) => {
  try {
    // 获取未分配的任务
    const availableTasks = await Task.find({ status: '未分配' });
    
    // 如果没有可用任务
    if (availableTasks.length === 0) {
      return res.json({
        success: true,
        message: '当前没有可用任务',
        recommendations: []
      });
    }
    
    // 找到当前用户的最佳匹配
    const user = req.user;
    const matches = findBestMatches(user, availableTasks, 6);
    
    // 获取详细的任务信息
    const recommendations = [];
    for (const match of matches) {
      const task = await Task.findById(match.task);
      recommendations.push({
        task,
        match_score: match.match_score,
        component_scores: match.component_scores
      });
    }
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('获取推荐任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 用户选择任务
 */
exports.chooseTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    
    // 检查任务是否存在且未分配
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }
    
    if (task.status !== '未分配') {
      return res.status(400).json({
        success: false,
        message: '此任务已被分配'
      });
    }
    
    // 计算匹配分数
    const user = req.user;
    const matchDetails = findBestMatches(user, [task], 1)[0];
    
    // 创建任务分配
    const assignment = new Assignment({
      user: userId,
      task: taskId,
      match_score: matchDetails.match_score,
      component_scores: matchDetails.component_scores,
      status: '已分配'
    });
    
    await assignment.save();
    
    // 更新任务状态
    task.status = '已分配';
    await task.save();
    
    // 更新用户活动任务列表
    await User.findByIdAndUpdate(
      userId,
      { $push: { active_tasks: assignment._id } }
    );
    
    res.json({
      success: true,
      message: '任务选择成功',
      assignment
    });
  } catch (error) {
    console.error('选择任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 从JSON导入任务
 */
exports.importTasksFromJson = async (req, res) => {
  try {
    const tasks = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: '请提供任务数组'
      });
    }
    
    const result = {
      total: tasks.length,
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const taskData of tasks) {
      try {
        // 检查任务ID是否已存在
        const existingTask = await Task.findOne({ task_id: taskData.task_id });
        
        if (existingTask) {
          result.failed++;
          result.errors.push(`任务ID ${taskData.task_id} 已存在`);
          continue;
        }
        
        const task = new Task(taskData);
        await task.save();
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`导入 ${taskData.name || taskData.task_id || '未知任务'} 失败: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: '任务导入完成',
      result
    });
  } catch (error) {
    console.error('批量导入任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}; 