const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  preferences: {
    type: [String],
    default: []
  },
  time_slots: {
    type: [String],
    default: []
  },
  environment: {
    噪音耐受度: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    空间需求: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    社交密度: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    紧急程度接受度: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    多任务处理: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的电子邮件地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active_tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
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

module.exports = mongoose.model('User', UserSchema); 