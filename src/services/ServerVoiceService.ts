import axios from 'axios';
import RNFS from 'react-native-fs';
import Recording from 'react-native-recording';
import { Platform, PermissionsAndroid, Alert, ToastAndroid } from 'react-native';

// 服务器配置
const API_SERVER = 'http://10.0.2.2:3000'; // Android 模拟器访问主机 localhost 的地址
// const API_SERVER = 'http://192.168.x.x:3000'; // 如果是真机测试，使用电脑的实际 IP 地址

/**
 * 服务端语音服务类
 */
class ServerVoiceServiceClass {
  private isRecording: boolean = false;
  private audioFilePath: string | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private lastErrorTime: number = 0;

  constructor() {
    // 异步初始化，不等待结果
    this.safeInitialize();
  }

  /**
   * 安全的初始化方法，不会抛出异常
   */
  private async safeInitialize(): Promise<void> {
    try {
      if (!this.isInitialized && !this.isInitializing) {
        await this.initializeRecording();
      }
    } catch (error) {
      console.error('安全初始化失败:', error);
      // 不抛出异常
    }
  }

  /**
   * 初始化录音模块
   */
  private async initializeRecording(): Promise<void> {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    
    try {
      console.log('初始化录音模块...');
      
      // 检查麦克风权限
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
          
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showToast('需要麦克风权限才能使用语音功能');
            throw new Error('没有麦克风权限');
          }
        } catch (permError) {
          console.error('权限请求失败:', permError);
          this.showToast('无法获取麦克风权限');
          throw new Error('权限请求失败');
        }
      }
      
      // 检查存储权限
      if (Platform.OS === 'android') {
        try {
          const storageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: '需要存储权限',
              message: '要使用语音功能，应用需要访问您的存储',
              buttonPositive: '确定',
              buttonNegative: '取消',
            }
          );
          
          if (storageGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showToast('需要存储权限才能使用语音功能');
            throw new Error('没有存储权限');
          }
        } catch (permError) {
          console.error('存储权限请求失败:', permError);
          this.showToast('无法获取存储权限');
          throw new Error('存储权限请求失败');
        }
      }
      
      // 初始化录音配置，使用try-catch包裹
      try {
        console.log('配置录音参数...');
        Recording.init({
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6,
          outputFormat: 1,
        });
      } catch (initError) {
        console.error('录音配置初始化失败:', initError);
        this.showToast('录音初始化失败');
        throw new Error('录音配置初始化失败');
      }
      
      // 等待一段时间确保初始化完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      console.log('录音模块初始化成功');
    } catch (error) {
      console.error('录音模块初始化失败:', error);
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 确保录音模块已初始化
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    if (this.isInitializing) {
      // 等待初始化完成，最多等待3秒
      let attempts = 0;
      while (this.isInitializing && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.isInitialized) {
        this.showToast('录音模块初始化超时');
        return false;
      }
      
      return true;
    }
    
    try {
      await this.initializeRecording();
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }

  /**
   * 显示安卓 Toast 消息
   */
  private showToast(message: string): void {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  }

  /**
   * 开始录音
   */
  public async startRecording(): Promise<void> {
    try {
      // 防止频繁点击导致的问题
      const now = Date.now();
      if (now - this.lastErrorTime < 3000) {
        this.showToast('请稍后再试');
        return; // 静默失败，不抛出异常
      }
      
      // 确保初始化完成
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        this.showToast('录音模块未能初始化');
        return; // 静默失败，不抛出异常
      }
      
      if (this.isRecording) {
        this.showToast('已经在录音中');
        return; // 静默失败，不抛出异常
      }

      // 生成临时文件路径
      this.audioFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.wav`;
      
      // 测试文件系统可写性
      try {
        await RNFS.writeFile(this.audioFilePath, '', 'utf8');
        await RNFS.unlink(this.audioFilePath);
      } catch (fsError) {
        console.error('文件系统写入测试失败:', fsError);
        this.showToast('无法写入临时文件');
        return; // 静默失败，不抛出异常
      }
      
      console.log('准备开始录音...');
      
      // 开始录音，使用try-catch包裹
      try {
        await Recording.start();
      } catch (startError) {
        console.error('开始录音失败:', startError);
        this.showToast('开始录音失败');
        this.lastErrorTime = Date.now();
        return; // 静默失败，不抛出异常
      }
      
      // 添加短暂延迟以确保录音开始
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.isRecording = true;
      console.log('开始录音，文件路径:', this.audioFilePath);
      
      // 添加安全超时，防止录音未停止
      setTimeout(() => {
        if (this.isRecording) {
          console.log('录音超时自动停止');
          this.cancelRecording().catch(e => console.error('取消录音失败:', e));
        }
      }, 60000); // 60秒自动结束
      
    } catch (error) {
      console.error('开始录音错误:', error);
      this.showToast('开始录音失败');
      this.lastErrorTime = Date.now();
      // 不抛出异常，避免应用崩溃
    }
  }

  /**
   * 停止录音并识别
   */
  public async stopRecording(): Promise<string> {
    try {
      if (!this.isRecording) {
        this.showToast('没有正在进行的录音');
        return ''; // 返回空字符串而不是抛出异常
      }

      console.log('准备停止录音...');
      
      // 停止录音，使用try-catch包裹
      try {
        await Recording.stop();
      } catch (stopError) {
        console.error('停止录音失败:', stopError);
        this.showToast('停止录音失败');
        this.isRecording = false;
        this.audioFilePath = null;
        return ''; // 返回空字符串而不是抛出异常
      }
      
      this.isRecording = false;

      if (!this.audioFilePath) {
        this.showToast('录音文件路径不存在');
        return ''; // 返回空字符串而不是抛出异常
      }

      console.log('检查录音文件是否存在...');
      
      // 检查文件是否存在
      try {
        const fileExists = await RNFS.exists(this.audioFilePath);
        if (!fileExists) {
          this.showToast('录音文件不存在');
          return ''; // 返回空字符串而不是抛出异常
        }
      } catch (fileError) {
        console.error('检查文件存在失败:', fileError);
        this.showToast('检查录音文件失败');
        return ''; // 返回空字符串而不是抛出异常
      }

      console.log('读取录音文件...');
      
      // 获取录音文件
      let audioData = '';
      try {
        audioData = await RNFS.readFile(this.audioFilePath, 'base64');
      } catch (readError) {
        console.error('读取录音文件失败:', readError);
        this.showToast('读取录音文件失败');
        // 清理临时文件
        if (this.audioFilePath) {
          try {
            await RNFS.unlink(this.audioFilePath);
          } catch (e) {}
          this.audioFilePath = null;
        }
        return ''; // 返回空字符串而不是抛出异常
      }
      
      console.log('录音文件读取成功，大小:', audioData.length);

      if (!audioData || audioData.length === 0) {
        this.showToast('录音文件为空');
        // 清理临时文件
        if (this.audioFilePath) {
          try {
            await RNFS.unlink(this.audioFilePath);
          } catch (e) {}
          this.audioFilePath = null;
        }
        return ''; // 返回空字符串而不是抛出异常
      }

      console.log('发送语音识别请求...');
      
      // 发送语音识别请求到服务器
      let response;
      try {
        response = await axios.post(`${API_SERVER}/api/asr/recognize`, {
          audio: audioData,
          format: 'wav',
          rate: 16000,
        }, {
          timeout: 30000 // 30秒超时
        });
      } catch (apiError) {
        console.error('语音识别请求失败:', apiError);
        this.showToast('语音识别请求失败');
        // 清理临时文件
        if (this.audioFilePath) {
          try {
            await RNFS.unlink(this.audioFilePath);
          } catch (e) {}
          this.audioFilePath = null;
        }
        return ''; // 返回空字符串而不是抛出异常
      }

      console.log('语音识别请求响应:', response.status);

      // 清理临时文件
      if (this.audioFilePath) {
        try {
          await RNFS.unlink(this.audioFilePath);
        } catch (e) {
          console.error('清理录音文件失败:', e);
        }
        this.audioFilePath = null;
      }

      // 处理识别结果
      if (response.data.success && response.data.text) {
        console.log('语音识别成功:', response.data.text);
        return response.data.text;
      } else {
        console.error('语音识别失败，服务器响应:', response.data);
        this.showToast('语音识别失败');
        return ''; // 返回空字符串而不是抛出异常
      }
    } catch (error) {
      console.error('停止录音错误:', error);
      this.showToast('语音识别过程中发生错误');
      
      // 清理资源
      if (this.audioFilePath) {
        try {
          await RNFS.unlink(this.audioFilePath);
        } catch (cleanupError) {
          console.error('清理录音文件失败:', cleanupError);
        }
        this.audioFilePath = null;
      }
      this.isRecording = false;
      
      return ''; // 返回空字符串而不是抛出异常
    }
  }

  /**
   * 取消录音
   */
  public async cancelRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        console.log('取消录音...');
        try {
          await Recording.stop();
        } catch (stopError) {
          console.error('停止录音失败:', stopError);
        } finally {
          this.isRecording = false;
        }
      }

      // 清理临时文件
      if (this.audioFilePath) {
        console.log('清理录音临时文件...');
        try {
          await RNFS.unlink(this.audioFilePath);
        } catch (unlinkError) {
          console.error('清理文件失败:', unlinkError);
        } finally {
          this.audioFilePath = null;
        }
      }
    } catch (error) {
      console.error('取消录音错误:', error);
      // 重置状态
      this.isRecording = false;
      this.audioFilePath = null;
    }
  }

  /**
   * 语音合成（使用阿里云）
   * @param text 要播放的文本
   * @param options 合成选项
   */
  public async speak(text: string, options?: {
    format?: string;
    sampleRate?: number;
    voice?: string;
    volume?: number;
    speed?: number;
    pitch?: number;
  }): Promise<void> {
    // 防止空文本
    if (!text || text.trim().length === 0) {
      return;
    }
    
    let tempFilePath: string | null = null;
    
    try {
      // 确保初始化完成
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        this.showToast('语音模块未能初始化');
        this.useLocalTTS(text);
        return;
      }
      
      console.log('开始请求语音合成服务:', text);
      
      // 检查服务器地址
      if (!API_SERVER) {
        console.error('API服务器地址未配置');
        this.useLocalTTS(text);
        return;
      }
      
      // 使用阿里云合成服务
      console.log('发送语音合成请求到服务器...');
      let response;
      try {
        response = await axios.post(`${API_SERVER}/api/tts/synthesize`, {
          text,
          options,
        }, {
          responseType: 'arraybuffer',
          timeout: 15000 // 设置超时时间为15秒
        });
      } catch (apiError) {
        console.error('语音合成请求失败:', apiError);
        this.showToast('语音合成请求失败');
        this.useLocalTTS(text);
        return;
      }

      // 检查响应
      if (!response || !response.data || response.data.length === 0) {
        console.error('服务器返回的语音数据为空');
        this.useLocalTTS(text);
        return;
      }

      console.log('语音合成成功，保存音频文件...');
      // 将音频数据保存为临时文件
      tempFilePath = `${RNFS.CachesDirectoryPath}/tts_${Date.now()}.mp3`;
      
      try {
        await RNFS.writeFile(tempFilePath, response.data, 'base64');
      } catch (writeError) {
        console.error('保存音频文件失败:', writeError);
        this.showToast('保存语音文件失败');
        this.useLocalTTS(text);
        return;
      }

      console.log('播放语音...');
      // 播放音频
      try {
        await Recording.play(tempFilePath);
      } catch (playError) {
        console.error('播放音频失败:', playError);
        this.showToast('播放语音失败');
        
        // 清理临时文件
        if (tempFilePath) {
          try {
            await RNFS.unlink(tempFilePath);
          } catch (e) {}
          tempFilePath = null;
        }
        
        this.useLocalTTS(text);
        return;
      }
      
      // 等待播放完成（假设每秒2个字，至少3秒）
      const waitTime = Math.max(3000, text.length * 500); 
      await new Promise(resolve => setTimeout(resolve, waitTime));

      console.log('清理语音临时文件...');
      // 播放完成后删除临时文件
      if (tempFilePath) {
        try {
          await RNFS.unlink(tempFilePath);
        } catch (unlinkError) {
          console.error('清理语音临时文件失败:', unlinkError);
        }
      }
    } catch (error) {
      console.error('语音合成错误:', error);
      
      // 清理临时文件
      if (tempFilePath) {
        try {
          await RNFS.unlink(tempFilePath);
        } catch (e) {}
      }
      
      // 服务器请求失败，尝试使用设备的 TTS
      this.useLocalTTS(text);
    }
  }
  
  /**
   * 使用设备的本地 TTS 功能
   * @param text 要播放的文本
   */
  private useLocalTTS(text: string): void {
    try {
      console.log('尝试使用本地TTS服务...');
      // 在 Android 设备上使用系统 TTS
      if (Platform.OS === 'android') {
        const androidText = text.substring(0, 4000); // Android TTS 有字数限制
        console.log(`使用 Android TTS (${androidText.length} 字符)...`);
        
        // 使用 Alert 显示文本，因为原生 TTS 需要额外的模块
        Alert.alert(
          '语音内容',
          androidText,
          [{ text: '确定', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('本地TTS错误:', error);
      // 即使这里出错也不再尝试其他方式，以避免无限递归
    }
  }
}

// 创建单例实例
export const ServerVoiceService = new ServerVoiceServiceClass();

export default ServerVoiceService; 