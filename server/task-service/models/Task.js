const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  task_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  time_slots: {
    type: [String],
    required: true
  },
  environment: {
    type: [String],
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  urgency: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  duration: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['未分配', '已分配', '已完成', '已取消'],
    default: '未分配'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('Task', TaskSchema); 