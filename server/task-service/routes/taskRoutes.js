const express = require('express');
const router = express.Router();
const taskController = require('../cnntorllers/taskController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 公共路由
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);

// 需要身份验证的路由
router.use(authenticate);

// 用户路由
router.get('/user/recommended', taskController.getRecommendedTasksForUser);
router.post('/user/choose/:id', taskController.chooseTask);

// 管理员路由
router.use(isAdmin);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/import', taskController.importTasksFromJson);

module.exports = router; 