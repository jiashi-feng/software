const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  match_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  component_scores: {
    skill_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    preference_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    time_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    environment_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    level_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['已分配', '进行中', '已完成', '已拒绝', '已取消'],
    default: '已分配'
  },
  user_note: {
    type: String,
    default: ''
  },
  admin_note: {
    type: String,
    default: ''
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  started_at: {
    type: Date
  },
  completed_at: {
    type: Date
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

module.exports = mongoose.model('Assignment', AssignmentSchema); 