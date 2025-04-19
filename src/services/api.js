import axios from 'axios';
import { Platform, Alert, ToastAndroid, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

// 两个后端服务的基础URL（根据环境和设备不同）
let TASK_API_BASE_URL;
let VOICE_API_BASE_URL;

// 根据开发环境和设备类型设置不同的服务器URL
if (__DEV__) {
  if (Platform.OS === 'android') {
    // Android模拟器通过10.0.2.2访问本机localhost
    TASK_API_BASE_URL = 'http://10.0.2.2:5000/api';
    VOICE_API_BASE_URL = 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS模拟器可以直接使用localhost
    TASK_API_BASE_URL = 'http://localhost:5000/api';
    VOICE_API_BASE_URL = 'http://localhost:3000/api';
  } else {
    // 其他设备（如Web）
    TASK_API_BASE_URL = 'http://localhost:5000/api';
    VOICE_API_BASE_URL = 'http://localhost:3000/api';
  }
} else {
  // 生产环境
  TASK_API_BASE_URL = 'https://api.yourdomain.com/task/api';
  VOICE_API_BASE_URL = 'https://api.yourdomain.com/voice/api';
}

// 创建任务分配API实例
const taskApi = axios.create({
  baseURL: TASK_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 创建语音服务API实例
const voiceApi = axios.create({
  baseURL: VOICE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 为任务API添加请求拦截器，自动添加认证Token
taskApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('获取认证Token失败', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 为语音API添加请求拦截器，自动添加认证Token
voiceApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('获取认证Token失败', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 录音工具 - 提供录音和播放功能
const audioRecorder = {
  isRecording: false,
  audioPlayer: null,
  recordingPromise: null,
  resolveRecording: null,
  
  // 初始化音频实例
  createAudioInstance: async () => {
    try {
      // 初始化录音实例的代码
      return true;
    } catch (error) {
      console.error('初始化音频实例失败:', error);
      return false;
    }
  },
  
  // 请求麦克风权限
  requestMicrophonePermission: async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '需要麦克风权限',
            message: '要使用语音功能，应用需要访问您的麦克风',
            buttonPositive: '确定',
            buttonNegative: '取消',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('请求麦克风权限失败:', err);
        return false;
      }
    }
    return true;
  },
  
  // 开始录音
  startRecording: async () => {
    try {
      // 检查权限
      const hasPermission = await audioRecorder.requestMicrophonePermission();
      if (!hasPermission) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('需要麦克风权限才能使用语音功能', ToastAndroid.SHORT);
        }
        return Promise.reject(new Error('没有麦克风权限'));
      }
      
      audioRecorder.isRecording = true;
      audioRecorder.recordingPromise = new Promise((resolve) => {
        audioRecorder.resolveRecording = resolve;
      });
      
      console.log('录音开始');
      return audioRecorder.recordingPromise;
    } catch (error) {
      console.error('开始录音失败:', error);
      audioRecorder.isRecording = false;
      return Promise.reject(error);
    }
  },
  
  // 停止录音并返回结果
  stopRecording: async () => {
    if (!audioRecorder.isRecording) {
      return '';
    }
    
    audioRecorder.isRecording = false;
    
    try {
      // 这里在真实实现中应该处理录音数据
      // 为了演示，返回一个模拟结果
      const mockResult = '这是一个录音测试';
      
      if (audioRecorder.resolveRecording) {
        audioRecorder.resolveRecording(mockResult);
      }
      
      console.log('录音结束');
      return mockResult;
    } catch (error) {
      console.error('停止录音失败:', error);
      return '';
    }
  },
  
  // 播放文本（文本转语音）
  speak: async (text, options = {}) => {
    if (!text || text.trim().length === 0) {
      return Promise.resolve();
    }
    
    try {
      // 检查语音服务是否可用
      const isVoiceServiceAvailable = await checkVoiceServiceHealth();
      
      if (isVoiceServiceAvailable) {
        // 使用API进行文本到语音转换
        try {
          await voiceService.textToSpeech(text, options);
          return Promise.resolve();
        } catch (apiError) {
          console.error('API语音合成失败:', apiError);
        }
      }
      
      // 如果API不可用或失败，使用本地TTS
      if (Platform.OS === 'android') {
        const androidText = text.substring(0, 4000);
        Alert.alert(
          '语音内容',
          androidText,
          [{ text: '确定', style: 'default' }]
        );
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('播放文本失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 播放音频文件
  playAudio: async (audioPath) => {
    return new Promise((resolve, reject) => {
      try {
        // 释放之前的播放器
        if (audioRecorder.audioPlayer) {
          audioRecorder.audioPlayer.release();
        }
        
        // 创建新的播放器
        audioRecorder.audioPlayer = new Sound(audioPath, '', (error) => {
          if (error) {
            console.error('加载音频失败:', error);
            reject(error);
            return;
          }
          
          // 播放音频
          audioRecorder.audioPlayer.play((success) => {
            if (success) {
              console.log('播放完成');
              resolve();
            } else {
              console.error('播放失败');
              reject(new Error('播放失败'));
            }
          });
        });
      } catch (error) {
        console.error('播放音频错误:', error);
        reject(error);
      }
    });
  }
};

// 检测任务分配服务健康状态
export const checkTaskServiceHealth = async () => {
  try {
    const response = await axios.get(`${TASK_API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 2000 // 2秒超时
    });
    return response.data.status === 'ok';
  } catch (error) {
    // 静默处理错误，不在控制台打印错误
    return false; // 直接返回false表示服务不可用
  }
};

// 检测语音服务健康状态
export const checkVoiceServiceHealth = async () => {
  try {
    const response = await axios.get(`${VOICE_API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 2000 // 2秒超时
    });
    return response.data.status === 'ok';
  } catch (error) {
    // 静默处理错误，不在控制台打印错误
    return false; // 直接返回false表示服务不可用
  }
};

// 任务分配API服务
export const taskService = {
  // 用户相关
  login: async (credentials) => {
    const response = await taskApi.post('/users/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await taskApi.post('/users/register', userData);
    return response.data;
  },
  
  getUserProfile: async () => {
    const response = await taskApi.get('/users/profile');
    return response.data;
  },
  
  updateUserProfile: async (data) => {
    const response = await taskApi.put('/users/profile', data);
    return response.data;
  },
  
  // 用户技能和偏好设置 - 调整为匹配后端接口
  saveUserPreferences: async (preferencesData) => {
    const response = await taskApi.put('/users/preferences', preferencesData);
    return response.data;
  },
  
  // 任务相关
  getTasks: async (filters = {}) => {
    const response = await taskApi.get('/tasks', { params: filters });
    return response.data;
  },
  
  getTaskById: async (id) => {
    const response = await taskApi.get(`/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await taskApi.post('/tasks', taskData);
    return response.data;
  },
  
  updateTask: async (id, taskData) => {
    const response = await taskApi.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  deleteTask: async (id) => {
    const response = await taskApi.delete(`/tasks/${id}`);
    return response.data;
  },
  
  // 任务推荐
  getRecommendedTasks: async () => {
    const response = await taskApi.get('/tasks/user/recommended');
    return response.data;
  },
  
  // 选择任务
  chooseTask: async (taskId) => {
    const response = await taskApi.post(`/tasks/user/choose/${taskId}`);
    return response.data;
  },
  
  // 任务分配相关 - 已调整为匹配后端接口
  getAssignments: async (filters = {}) => {
    // 根据用户权限可能使用不同的端点，这里默认使用用户端点
    const endpoint = filters.isAdmin ? '/assignments' : '/assignments/user';
    const response = await taskApi.get(endpoint, { 
      params: filters.isAdmin ? filters : undefined
    });
    return response.data;
  },
  
  // 分配任务 - 修改为使用正确的端点
  assignTask: async (assignmentData) => {
    const response = await taskApi.post('/assignments/assign', assignmentData);
    return response.data;
  },
  
  // 分配特定任务给指定用户
  assignTaskToUser: async (taskId, userId) => {
    const response = await taskApi.post(`/assignments/assign/${taskId}/${userId}`);
    return response.data;
  },
  
  // 完成任务 - 调整为匹配后端接口
  completeAssignment: async (id) => {
    const response = await taskApi.put(`/assignments/user/${id}/status`, {
      status: 'completed',
      completionDate: new Date().toISOString()
    });
    return response.data;
  },
  
  // 添加用户笔记到任务
  addNoteToAssignment: async (id, note) => {
    const response = await taskApi.put(`/assignments/user/${id}/note`, { note });
    return response.data;
  }
};

// 语音API服务
export const voiceService = {
  // 语音识别 (ASR)
  speechToText: async (audioData, options = {}) => {
    const response = await voiceApi.post('/asr/recognize', {
      audio: audioData,
      format: options.format || 'wav',
      rate: options.sampleRate || 16000
    });
    return response.data;
  },
  
  // 语音合成 (TTS)
  textToSpeech: async (text, options = {}) => {
    const defaultOptions = {
      format: 'mp3',
      voice: 'xiaoyun',
      sample_rate: 16000,
      volume: 50,
      speech_rate: 0,
      pitch_rate: 0
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    const requestParams = {
      text: text,
      options: {
        format: mergedOptions.format,
        voice: mergedOptions.voice,
        sample_rate: mergedOptions.sampleRate || mergedOptions.sample_rate,
        volume: mergedOptions.volume,
        speech_rate: mergedOptions.speed || mergedOptions.speech_rate,
        pitch_rate: mergedOptions.pitch || mergedOptions.pitch_rate
      }
    };
    
    const response = await voiceApi.post('/tts/synthesize', requestParams, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg, audio/wav'
      }
    });
    
    // 将arraybuffer音频数据保存到临时文件
    try {
      const fileExt = requestParams.options.format === 'wav' ? 'wav' : 'mp3';
      const tempFilePath = `${RNFS.CachesDirectoryPath}/speech_${Date.now()}.${fileExt}`;
      
      // 转换ArrayBuffer为Base64
      let binary = '';
      const bytes = new Uint8Array(response.data);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);
      
      // 写入文件
      await RNFS.writeFile(tempFilePath, base64Data, 'base64');
      
      // 播放音频
      await audioRecorder.playAudio(tempFilePath);
      
      // 操作完成后清理文件
      setTimeout(async () => {
        try {
          await RNFS.unlink(tempFilePath);
        } catch (e) {}
      }, 10000);
      
      return { success: true, filePath: tempFilePath };
    } catch (error) {
      console.error('处理音频数据失败:', error);
      return { success: false, error };
    }
  },
  
  // 获取临时访问凭证
  getStsCredentials: async (clientInfo = {}) => {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      manufacturer: Platform.OS === 'android' ? Platform.constants?.Manufacturer : undefined,
      brand: Platform.OS === 'android' ? Platform.constants?.Brand : undefined,
      model: Platform.OS === 'android' ? Platform.constants?.Model : undefined,
      ...clientInfo
    };
    
    const response = await voiceApi.post('/sts/credentials', {
      clientInfo: JSON.stringify(deviceInfo)
    });
    return response.data;
  }
};

// 本地任务管理（当后端服务不可用时的回退方案）
export const localTaskService = {
  tasks: [
    { id: '1', title: '洗碗', completed: false, dueDate: new Date(), priority: 'medium' },
    { id: '2', title: '扫地', completed: false, dueDate: new Date(), priority: 'high' },
    { id: '3', title: '倒垃圾', completed: false, dueDate: new Date(), priority: 'low' },
  ],
  
  // 获取所有任务
  getAllTasks: () => {
    return localTaskService.tasks;
  },
  
  // 获取待完成任务
  getPendingTasks: () => {
    return localTaskService.tasks.filter(task => !task.completed);
  },
  
  // 获取已完成任务
  getCompletedTasks: () => {
    return localTaskService.tasks.filter(task => task.completed);
  },
  
  // 添加任务
  addTask: (title, dueDate, priority = 'medium') => {
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      dueDate: dueDate || new Date(),
      priority,
    };
    localTaskService.tasks.push(newTask);
    return newTask;
  },
  
  // 更新任务状态
  updateTaskStatus: (id, completed) => {
    const taskIndex = localTaskService.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;
    
    const updatedTask = { ...localTaskService.tasks[taskIndex], completed };
    localTaskService.tasks[taskIndex] = updatedTask;
    return updatedTask;
  },
  
  // 删除任务
  deleteTask: (id) => {
    const initialLength = localTaskService.tasks.length;
    localTaskService.tasks = localTaskService.tasks.filter(task => task.id !== id);
    return localTaskService.tasks.length < initialLength;
  },
  
  // 重置任务
  resetTasks: () => {
    localTaskService.tasks = [
      { id: '1', title: '洗碗', completed: false, dueDate: new Date(), priority: 'medium' },
      { id: '2', title: '扫地', completed: false, dueDate: new Date(), priority: 'high' },
      { id: '3', title: '倒垃圾', completed: false, dueDate: new Date(), priority: 'low' },
    ];
  },
  
  // 使用AsyncStorage存储和检索任务
  saveTasks: async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(localTaskService.tasks));
      return true;
    } catch (error) {
      console.error('保存本地任务失败', error);
      return false;
    }
  },
  
  // 从AsyncStorage加载任务
  loadTasks: async () => {
    try {
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) {
        localTaskService.tasks = JSON.parse(tasks);
      }
      return localTaskService.tasks;
    } catch (error) {
      console.error('加载本地任务失败', error);
      return [];
    }
  },
  
  // 用户偏好设置本地存储
  saveUserPreferences: async (preferences) => {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
      return { success: true, data: preferences };
    } catch (error) {
      console.error('保存用户偏好设置失败', error);
      return { success: false, error };
    }
  },
  
  // 获取用户偏好设置
  getUserPreferences: async () => {
    try {
      const preferences = await AsyncStorage.getItem('user_preferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('获取用户偏好设置失败', error);
      return null;
    }
  }
};

// 导出API服务
export default {
  task: taskService,
  voice: voiceService,
  local: localTaskService,
  audio: audioRecorder,
  checkTaskServiceHealth,
  checkVoiceServiceHealth
}; 