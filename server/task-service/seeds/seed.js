const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 导入模型
const User = require('../models/User');
const Task = require('../models/Task');
const Assignment = require('../models/Assignment');

// 导入匹配算法
const { calculateMatchScore } = require('../../../src/utils/matchAlgorithm');

// 加载环境变量
dotenv.config();

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => {
  console.error('MongoDB 连接失败:', err);
  process.exit(1);
});

// 清空现有数据
const clearData = async () => {
  try {
    await User.deleteMany();
    await Task.deleteMany();
    await Assignment.deleteMany();
    console.log('所有数据已清空');
  } catch (err) {
    console.error('清空数据失败:', err);
    process.exit(1);
  }
};

// 加载JSON数据
const loadJsonData = (filePath) => {
  try {
    const dataPath = path.join(__dirname, filePath);
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error(`读取文件 ${filePath} 失败:`, err);
    return [];
  }
};

// 导入用户数据
const importUsers = async () => {
  try {
    const users = loadJsonData('../../src/user_data.json');
    
    if (users.length === 0) {
      console.log('没有找到用户数据');
      return [];
    }
    
    // 创建一个默认密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const userPromises = users.map(async (userData) => {
      const user = new User({
        ...userData,
        password: hashedPassword,
        email: `${userData.member_id}@example.com`
      });
      
      return user.save();
    });
    
    const savedUsers = await Promise.all(userPromises);
    console.log(`${savedUsers.length} 个用户已导入`);
    
    return savedUsers;
  } catch (err) {
    console.error('导入用户数据失败:', err);
    process.exit(1);
  }
};

// 导入任务数据
const importTasks = async () => {
  try {
    const tasks = loadJsonData('../../src/task_data.json');
    
    if (tasks.length === 0) {
      console.log('没有找到任务数据');
      return [];
    }
    
    const taskPromises = tasks.map(taskData => {
      const task = new Task(taskData);
      return task.save();
    });
    
    const savedTasks = await Promise.all(taskPromises);
    console.log(`${savedTasks.length} 个任务已导入`);
    
    return savedTasks;
  } catch (err) {
    console.error('导入任务数据失败:', err);
    process.exit(1);
  }
};

// 创建管理员账户
const createAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      member_id: 'ADMIN001',
      name: '系统管理员',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      skills: ['财务统筹', '安全监护', '活动策划'],
      preferences: ['复杂性任务', '思考型任务'],
      time_slots: ['9:00-11:00', '15:00-17:00', '21:00-23:00'],
      environment: {
        噪音耐受度: 50,
        空间需求: 50,
        社交密度: 50,
        紧急程度接受度: 80,
        多任务处理: 90
      }
    });
    
    await admin.save();
    console.log('管理员账户已创建');
  } catch (err) {
    console.error('创建管理员账户失败:', err);
  }
};

// 生成一些示例任务分配
const createSampleAssignments = async (users, tasks) => {
  try {
    const assignments = [];
    
    // 为每个用户分配一个最匹配的任务
    for (let i = 0; i < Math.min(users.length, tasks.length); i++) {
      const user = users[i];
      const task = tasks[i];
      
      // 计算匹配分数
      const matchDetails = calculateMatchScore(user, task);
      
      // 创建任务分配
      const assignment = new Assignment({
        user: user._id,
        task: task._id,
        match_score: matchDetails.final_score,
        component_scores: matchDetails.component_scores,
        status: '已分配'
      });
      
      await assignment.save();
      assignments.push(assignment);
      
      // 更新任务状态
      task.status = '已分配';
      await task.save();
      
      // 更新用户活动任务
      user.active_tasks.push(assignment._id);
      await user.save();
    }
    
    console.log(`${assignments.length} 个示例任务分配已创建`);
  } catch (err) {
    console.error('创建示例任务分配失败:', err);
  }
};

// 执行种子脚本
const seedDatabase = async () => {
  try {
    await clearData();
    const users = await importUsers();
    const tasks = await importTasks();
    await createAdmin();
    
    if (users.length > 0 && tasks.length > 0) {
      await createSampleAssignments(users, tasks);
    }
    
    console.log('数据库初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  }
};

// 运行种子脚本
seedDatabase(); 