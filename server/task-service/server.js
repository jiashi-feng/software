const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 引入路由
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

// 初始化 Express 应用
const app = express();
const PORT = process.env.TASK_SERVICE_PORT || 5000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: '任务分配系统',
    timestamp: new Date().toISOString()
  });
});

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('任务服务 - MongoDB 连接成功'))
.catch(err => console.error('任务服务 - MongoDB 连接失败:', err));

// 注册路由
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`任务分配系统服务运行在端口 ${PORT}`);
});

module.exports = app; 