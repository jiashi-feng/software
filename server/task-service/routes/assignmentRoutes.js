const express = require('express');
const router = express.Router();
const assignmentController = require('../cnntorllers/assignmentController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 所有路由都需要身份验证
router.use(authenticate);

// 用户路由
router.get('/user', assignmentController.getUserAssignments);
router.get('/user/:id', assignmentController.getUserAssignmentById);
router.put('/user/:id/status', assignmentController.updateAssignmentStatus);
router.put('/user/:id/note', assignmentController.addUserNote);

// 管理员路由
router.use(isAdmin);
router.get('/', assignmentController.getAllAssignments);
router.post('/assign', assignmentController.assignTasksToUsers);
router.post('/assign/:taskId/:userId', assignmentController.assignTaskToUser);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);
router.put('/:id/admin-note', assignmentController.addAdminNote);

module.exports = router; 