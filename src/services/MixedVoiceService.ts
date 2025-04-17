import { Platform, Alert, PermissionsAndroid, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Recording from 'react-native-recording';
import axios from 'axios';
import { AliyunClientVoiceService } from './AliyunClientVoiceService';

const API_SERVERS = [
  
  'http://192.168.150.52:3000',  
  
  'http://10.0.2.2:3000',        
  
  'http://localhost:3000'         
];

let API_SERVER = API_SERVERS[0];

async function detectWorkingServer(): Promise<void> {
  
  
  for (const server of API_SERVERS) {
    try {
      
      
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
        
        API_SERVER = server;
        return;
      }
    } catch (error) {
      
    }
  }
  
  
}

detectWorkingServer().catch(error => {
  
});

if (Platform.OS === 'android') {
  
  interface ErrorUtilsType {
    getGlobalHandler: () => (error: Error, isFatal: boolean) => void;
    setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
  }
  
  
  const ErrorUtils = (global as any).ErrorUtils as ErrorUtilsType | undefined;
  
  if (ErrorUtils) {
    const previousHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
      
      
      
      if (isFatal) {
        
        if (ToastAndroid) {
          ToastAndroid.show('应用发生错误，将尝试恢复', ToastAndroid.LONG);
        }
      }
      
      
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
    
    this.safeInitialize();
  }

  /**
   * 安全的初始化方法，不会抛出异常
   */
  private async safeInitialize(): Promise<void> {
    try {
      if (!this.isInitialized && !this.isInitializing) {
        
        
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        
        try {
          await Recording.stop().catch(() => {
            
            });
        } catch (e) {
          
        }
        
        await this.initializeRecording();
      }
    } catch (error) {
      
      
    }
  }

  /**
   * 初始化录音模块
   */
  private async initializeRecording(): Promise<void> {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    
    try {
      
      
      
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
          
          this.showToast('无法获取麦克风权限');
          throw new Error('权限请求失败');
        }
      }
      
      
      if (Platform.OS === 'android') {
        try {
          
          let apiLevel = 0;
          try {
            apiLevel = parseInt(Platform.Version.toString(), 10);
            if (isNaN(apiLevel)) {
              
              apiLevel = 28; 
              
            }
          } catch (versionError) {
            
            apiLevel = 28; 
          }
          
          
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
            
            
          }
        } catch (permError) {
          
          this.showToast('无法处理存储权限');
          throw new Error('存储权限处理失败');
        }
      }
      
      
      await this.createAudioInstance();
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      
    } catch (error) {
      
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
      
      
      
      try {
        await Recording.stop().catch(() => {
          // 忽略停止录音时的错误
        });
      } catch (e) {
        
      }
      
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      
      Recording.init({
        sampleRate: 16000,        
        channels: 1,              
        bitsPerSample: 16,        
        audioSource: 6,           
        outputFormat: 1           
      });
      
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      return true;
    } catch (error) {
      
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
    
    const now = Date.now();
    if (now - this.lastErrorTime < 3000) {
      this.showToast('请稍后再试');
      return; 
    }

    
    if (this.isRecording) {
      this.showToast('已经在录音中');
      return; 
    }
    
    
    try {
      
      
      
      let initialized = false;
      try {
        initialized = await this.ensureInitialized();
      } catch (initError) {
        
        this.showToast('录音功能不可用');
        return; 
      }
      
      if (!initialized) {
        this.showToast('录音模块未能初始化');
        return; 
      }
      
      
      try {
        
        this.audioFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.wav`;
        
        
        
        try {
          await RNFS.writeFile(this.audioFilePath, '', 'utf8');
          await RNFS.unlink(this.audioFilePath);
          
        } catch (fsError) {
          
          
          
          
          this.audioFilePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.wav`;
          try {
            await RNFS.writeFile(this.audioFilePath, '', 'utf8');
            await RNFS.unlink(this.audioFilePath);
            
          } catch (innerFsError) {
            
            this.showToast('文件系统不可用');
            this.audioFilePath = null;
            return; 
          }
        }
      } catch (fileSystemError) {
        
        this.showToast('存储空间访问失败');
        return; 
      }
      
      
      
      try {
        
        await this.createAudioInstance();
        
        
        await Recording.start();
        this.isRecording = true;
        
      } catch (recError) {
        
        this.showToast('开始录音失败');
        this.isRecording = false;
        return; 
      }
      
    } catch (error) {
      
      
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
    
    if (!this.isRecording) {
      this.showToast('没有正在进行的录音');
      return '';
    }
    
    
    this.isRecording = false;
    
    
    try {
      
      
      
      if (!this.audioFilePath) {
        
        try {
          this.audioFilePath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.wav`;
          
        } catch (pathError) {
          
          this.showToast('无法创建录音文件');
          return '';
        }
      }
      
      
      let audioData: string = '';
      try {
        
        audioData = await Recording.stop();
        
      } catch (stopError) {
        
        this.showToast('停止录音失败');
        return '';
      }

      
      if (!audioData || audioData.length === 0) {
        
        this.showToast('录音数据为空，请重试');
        return '';
      }
      
      
      try {  
        
        await RNFS.writeFile(this.audioFilePath, audioData, 'base64');
        
      } catch (writeError) {
        
        this.showToast('保存录音失败');
        return '';
      }

      
      try {
        
        const response = await axios.post(`${API_SERVER}/api/asr/recognize`, {
          audio: audioData,
          format: 'wav',
          rate: 16000
        }, {
          timeout: 15000 
        });

        
        if (response.data && response.data.result) {
          console.log('Response data:', response.data.result.substring(0, 200));
        }
        
        
        if (response.data && response.data.err_no === 0 && response.data.result) {
          
          const recognizedText = response.data.result[0] || '';
          
          
          
          this.deleteAudioFile();
          
          return recognizedText;
        } else if (response.data && response.data.success && response.data.text) {
          
          const recognizedText = response.data.text || '';
          console.log('Recognized text:', recognizedText);
          
          
          this.deleteAudioFile();
          
          return recognizedText;
        } else {
          
          const errorMessage = 
            response.data?.err_msg || 
            response.data?.message || 
            '语音识别失败，请重试';
          
          
          this.showToast(errorMessage);
          
          
          this.deleteAudioFile();
          
          return '';
        }
      } catch (apiError) {
        
        this.showToast('语音识别服务不可用');
        
        
        this.deleteAudioFile();
        
        return '';
      }
    } catch (error) {
      
      
      this.showToast('语音识别过程出错');
      
      
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
        
      } catch (error) {
        
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
      await AliyunClientVoiceService.speak(text, options);
    } catch (error) {
      this.showToast('语音合成失败，正在使用替代方案');
      this.useLocalTTS(text);
    }
  }

  /**
   * 使用设备的本地 TTS 功能（回退方案）
   * @param text 要播放的文本
   */
  private useLocalTTS(text: string): void {
    try {
      
      
      if (Platform.OS === 'android') {
        const androidText = text.substring(0, 4000);
        
        Alert.alert(
          '语音内容',
          androidText,
          [{ text: '确定', style: 'default' }]
        );
      }
    } catch (error) {
      
      
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
      
      return false;
    }
  }
}

export const MixedVoiceService = new MixedVoiceServiceClass();

export default MixedVoiceService; 