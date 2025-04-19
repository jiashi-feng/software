const express = require('express');
const router = express.Router();
const userController = require('../cnntorllers/userController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 公共路由
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需要身份验证的路由
router.use(authenticate);

// 用户路由
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.get('/tasks', userController.getUserTasks);
router.put('/preferences', userController.updateUserPreferences);

// 管理员路由
router.use(isAdmin);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/import', userController.importUsersFromJson);

module.exports = router; 