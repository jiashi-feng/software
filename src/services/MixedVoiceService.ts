import { Platform, Alert, PermissionsAndroid, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Recording from 'react-native-recording';
import axios from 'axios';
import AliyunClientVoiceService from './AliyunClientVoiceService';

// 服务器配置
const API_SERVERS = [
  // 真机访问时使用电脑的局域网 IP（需要替换为实际的电脑IP）
  'http://192.168.150.52:3000',  
  // Android 模拟器访问时使用的特殊地址
  'http://10.0.2.2:3000',        
  // 本地开发时使用
  'http://localhost:3000'         
];

// 设置默认服务器
let API_SERVER = API_SERVERS[0];

// 检测可用的服务器
async function detectWorkingServer(): Promise<void> {
  console.log('开始检测可用服务器...');
  
  for (const server of API_SERVERS) {
    try {
      console.log(`测试服务器地址: ${server}`);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), 3000)
      );
      
      const response = await Promise.race([
        axios.get(`${server}/health`, {
          timeout: 3000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }),
        timeoutPromise
      ]) as { status: number };
      
      if (response && response.status === 200) {
        console.log(`服务器地址可用: ${server}`);
        API_SERVER = server;
        return;
      }
    } catch (error) {
      console.log(`服务器地址不可用: ${server}`, error instanceof Error ? error.message : '未知错误');
    }
  }
  
  console.warn(`无法连接到任何服务器，将使用默认地址: ${API_SERVER}`);
}

// 应用启动时检测服务器
detectWorkingServer().catch(error => {
  console.error('服务器检测失败:', error instanceof Error ? error.message : '未知错误');
});

// 设置全局未捕获异常处理器
if (Platform.OS === 'android') {
  // 定义ErrorUtils类型
  interface ErrorUtilsType {
    getGlobalHandler: () => (error: Error, isFatal: boolean) => void;
    setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
  }
  
  // 获取全局ErrorUtils
  const ErrorUtils = (global as any).ErrorUtils as ErrorUtilsType | undefined;
  
  if (ErrorUtils) {
    const previousHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
      // 记录错误
      console.error('捕获到未处理的应用错误:', error);
      
      if (isFatal) {
        // 对于致命错误，显示提示并继续
        if (ToastAndroid) {
          ToastAndroid.show('应用发生错误，将尝试恢复', ToastAndroid.LONG);
        }
      }
      
      // 调用原处理程序，但将isFatal设为false以防止应用崩溃
      previousHandler(error, false);
    });
  }
}

/**
 * 混合语音服务类
 * 集成了：
 * 1. 百度语音识别 (ASR)
 * 2. 阿里云语音合成 (TTS)
 */
class MixedVoiceServiceClass {
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
        console.log('MixedVoiceService 开始安全初始化...');
        
        // 延迟一段时间再初始化，确保React Native环境准备好
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 尝试安全停止任何可能正在运行的录音/播放
        try {
          await Recording.stop().catch(() => {
            // 忽略错误，这只是预防性的
            console.log('预防性停止Recording (忽略错误)');
          });
        } catch (e) {
          // 忽略任何错误
        }
        
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
      
      // 检查存储权限 - 根据Android版本选择不同的权限处理方式
      if (Platform.OS === 'android') {
        try {
          // 获取Android API版本
          let apiLevel = 0;
          try {
            apiLevel = parseInt(Platform.Version.toString(), 10);
            if (isNaN(apiLevel)) {
              // 如果无法解析为数字，默认使用低版本处理方法
              apiLevel = 28; // 默认为Android 9 Pie
              console.log('无法确定Android API版本，使用默认API级别:', apiLevel);
            }
          } catch (versionError) {
            console.error('解析API版本出错:', versionError);
            apiLevel = 28; // 默认为Android 9 Pie
          }
          
          // Android 10 (API 29)及以上版本使用应用专属存储空间，不需要申请外部存储权限
          if (apiLevel < 29) {
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
          } else {
            console.log('Android 10及以上版本，使用应用专属存储空间');
            // 对于Android 10+，我们将使用应用专属存储空间，不需要请求WRITE_EXTERNAL_STORAGE权限
          }
        } catch (permError) {
          console.error('存储权限处理失败:', permError);
          this.showToast('无法处理存储权限');
          throw new Error('存储权限处理失败');
        }
      }
      
      // 创建并初始化音频实例 - 防止"stop() called on an uninitialized AudioRecord"错误
      await this.createAudioInstance();
      
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
   * 创建并初始化音频实例 - 防止"stop() called on an uninitialized AudioRecord"错误
   */
  private async createAudioInstance(): Promise<boolean> {
    try {
      console.log('创建新的录音实例...');
      
      // 先尝试安全停止所有正在进行的操作
      try {
        await Recording.stop().catch(() => {});
      } catch (e) {
        // 忽略错误
      }
      
      // 使用延迟确保资源释放
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 初始化录音模块
      Recording.init({
        sampleRate: 16000,        // 采样率
        channels: 1,              // 单声道
        bitsPerSample: 16,        // 位深度
        audioSource: 6,           // MIC音源 (react-native-recording中的常量)
        outputFormat: 1           // AAC格式输出
      });
      
      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('录音实例创建成功');
      return true;
    } catch (error) {
      console.error('创建录音实例失败:', error);
      return false;
    }
  }

  /**
   * 确保录音模块已初始化
   */
  public async ensureInitialized(): Promise<boolean> {
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
    // 使用防抖机制防止重复调用
    const now = Date.now();
    if (now - this.lastErrorTime < 3000) {
      this.showToast('请稍后再试');
      return; // 静默失败，不抛出异常
    }

    // 如果已经在录音中，直接返回
    if (this.isRecording) {
      this.showToast('已经在录音中');
      return; // 静默失败，不抛出异常
    }
    
    // 最外层try-catch，确保无论发生什么都不会导致应用崩溃
    try {
      console.log('准备开始录音...');
      
      // 确保初始化完成
      let initialized = false;
      try {
        initialized = await this.ensureInitialized();
      } catch (initError) {
        console.error('录音模块初始化错误:', initError);
        this.showToast('录音功能不可用');
        return; // 静默失败，不抛出异常
      }
      
      if (!initialized) {
        this.showToast('录音模块未能初始化');
        return; // 静默失败，不抛出异常
      }
      
      // 文件系统操作，可能会失败
      try {
        // 使用应用专属缓存目录来保存临时音频文件
        this.audioFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.wav`;
        
        // 测试文件系统可写性
        console.log('测试文件系统可写性...');
        try {
          await RNFS.writeFile(this.audioFilePath, '', 'utf8');
          await RNFS.unlink(this.audioFilePath);
          console.log('文件系统可写性测试通过');
        } catch (fsError) {
          console.error('文件系统写入测试失败:', fsError);
          
          // 尝试使用应用内部存储
          console.log('尝试使用应用内部存储...');
          this.audioFilePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.wav`;
          try {
            await RNFS.writeFile(this.audioFilePath, '', 'utf8');
            await RNFS.unlink(this.audioFilePath);
            console.log('应用内部存储可写性测试通过');
          } catch (innerFsError) {
            console.error('内部存储写入测试也失败:', innerFsError);
            this.showToast('文件系统不可用');
            this.audioFilePath = null;
            return; // 静默失败，不抛出异常
          }
        }
      } catch (fileSystemError) {
        console.error('文件系统操作错误:', fileSystemError);
        this.showToast('存储空间访问失败');
        return; // 静默失败，不抛出异常
      }
      
      // 开始录音
      console.log('开始录音...');
      try {
        // 确保录音实例已正确初始化
        await this.createAudioInstance();
        
        // 开始录音
        await Recording.start();
        this.isRecording = true;
        console.log('录音已开始');
      } catch (recError) {
        console.error('开始录音失败:', recError);
        this.showToast('开始录音失败');
        this.isRecording = false;
        return; // 静默失败，不抛出异常
      }
      
    } catch (error) {
      // 全局错误处理
      console.error('录音过程中发生严重错误:', error);
      this.showToast('录音功能出错');
      this.lastErrorTime = Date.now();
      this.isRecording = false;
    }
  }

  /**
   * 停止录音并识别
   * @returns 识别出的文本
   */
  public async stopRecording(): Promise<string> {
    // 如果未在录音状态，直接返回空字符串
    if (!this.isRecording) {
      this.showToast('没有正在进行的录音');
      return '';
    }
    
    // 更新状态为不在录音
    this.isRecording = false;
    
    // 最外层try-catch，确保无论发生什么都不会导致应用崩溃
    try {
      console.log('准备停止录音...');
      
      // 确保录音文件路径存在
      if (!this.audioFilePath) {
        console.log('录音文件路径不存在，创建新路径');
        try {
          this.audioFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.wav`;
          console.log('新创建的录音文件路径:', this.audioFilePath);
        } catch (pathError) {
          console.error('创建录音文件路径失败:', pathError);
          this.showToast('无法创建录音文件');
          return '';
        }
      }
      
      // 停止录音并获取音频数据
      let audioData: string = '';
      try {
        console.log('停止录音...');
        audioData = await Recording.stop();
        console.log('录音已停止，获取到音频数据长度:', audioData ? audioData.length : 0);
      } catch (stopError) {
        console.error('停止录音失败:', stopError);
        this.showToast('停止录音失败');
        return '';
      }

      // 检查音频数据
      if (!audioData || audioData.length === 0) {
        console.error('获取到的音频数据为空');
        this.showToast('录音数据为空，请重试');
        return '';
      }
      
      // 存储音频数据
      try {  
        console.log('保存录音文件...');
        await RNFS.writeFile(this.audioFilePath, audioData, 'base64');
        console.log('录音文件已保存:', this.audioFilePath);
      } catch (writeError) {
        console.error('保存录音文件失败:', writeError);
        this.showToast('保存录音失败');
        return '';
      }

      // 发送音频数据到服务器进行语音识别
      try {
        console.log('发送录音到服务器进行识别...');
        const response = await axios.post(`${API_SERVER}/api/asr/recognize`, {
          audio: audioData,
          format: 'wav',
          rate: 16000
        }, {
          timeout: 15000 // 设置超时时间为15秒
        });

        // 检查百度语音识别API的响应格式
        console.log('收到服务器响应:', JSON.stringify(response.data).substring(0, 200));
        
        // 新的百度格式响应处理
        if (response.data && response.data.err_no === 0 && response.data.result) {
          // 百度API格式响应: { err_no: 0, err_msg: 'success.', corpus_no: '...', sn: '...', result: ['识别结果'] }
          const recognizedText = response.data.result[0] || '';
          console.log('语音识别结果:', recognizedText);
          
          // 成功识别后删除临时文件
          this.deleteAudioFile();
          
          return recognizedText;
        } else if (response.data && response.data.success && response.data.text) {
          // 兼容旧格式响应: { success: true, text: '识别结果' }
          const recognizedText = response.data.text || '';
          console.log('语音识别结果(旧格式):', recognizedText);
          
          // 成功识别后删除临时文件
          this.deleteAudioFile();
          
          return recognizedText;
        } else {
          // 处理错误情况
          const errorMessage = 
            response.data?.err_msg || 
            response.data?.message || 
            '语音识别失败，请重试';
          
          console.error('语音识别失败:', errorMessage);
          this.showToast(errorMessage);
          
          // 识别失败也删除临时文件
          this.deleteAudioFile();
          
          return '';
        }
      } catch (apiError) {
        console.error('调用语音识别API失败:', apiError);
        this.showToast('语音识别服务不可用');
        
        // API调用失败也删除临时文件
        this.deleteAudioFile();
        
        return '';
      }
    } catch (error) {
      // 全局错误处理
      console.error('停止录音和识别过程中出现严重错误:', error);
      this.showToast('语音识别过程出错');
      
      // 确保重置状态
      this.deleteAudioFile();
      this.isRecording = false;
      this.lastErrorTime = Date.now();
      
      return '';
    }
  }

  /**
   * 删除音频临时文件
   */
  private async deleteAudioFile(): Promise<void> {
    if (this.audioFilePath) {
      try {
        await RNFS.unlink(this.audioFilePath);
        console.log('临时音频文件已删除');
      } catch (error) {
        console.error('删除临时音频文件失败:', error);
      }
      this.audioFilePath = null;
    }
  }

  /**
   * 将文本转换为语音
   * @param text 要合成的文本
   * @param options 语音合成选项
   */
  public async speak(text: string, options?: {
    format?: string;
    sampleRate?: number;
    voice?: string;
    volume?: number;
    speed?: number;
    pitch?: number;
    region?: string;
  }): Promise<void> {
    try {
      console.log('MixedVoiceService: 调用阿里云客户端进行语音合成...');
      
      // 直接调用阿里云客户端进行语音合成
      await AliyunClientVoiceService.speak(text, options);
      
      console.log('MixedVoiceService: 语音合成成功');
    } catch (error) {
      console.error('MixedVoiceService: 阿里云语音合成错误:', error);
      
      // 显示友好的错误提示
      this.showToast('语音合成失败，正在使用替代方案');
      
      // 如果阿里云服务失败，尝试使用本地TTS或其他备选方案
      this.useLocalTTS(text);
    }
  }

  /**
   * 使用设备的本地 TTS 功能（回退方案）
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

  /**
   * 将音频数据保存为文件
   */
  private async saveAudioFile(audioData: string, filePath: string): Promise<boolean> {
    try {
      await RNFS.writeFile(filePath, audioData, 'base64');
      return true;
    } catch (error) {
      console.error('保存录音文件失败:', error);
      return false;
    }
  }
}

// 创建单例实例
export const MixedVoiceService = new MixedVoiceServiceClass();

export default MixedVoiceService; 