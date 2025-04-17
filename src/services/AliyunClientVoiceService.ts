import axios from 'axios';
import RNFS from 'react-native-fs';
import Recording from 'react-native-recording';
import { Platform, PermissionsAndroid, Alert, ToastAndroid } from 'react-native';
import queryString from 'query-string';
import crypto from 'crypto-js';

const API_SERVERS = [
  
  'http://10.0.2.2:3000',        
  
  'http://192.168.150.52:3000',  
  
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

/**
 * STS凭证接口
 */
interface STSCredentials {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;
  region: string;
  ttsEndpoint: string;
  ttsApiVersion: string;
  appKey: string;
}

/**
 * 阿里云客户端语音服务类
 * 使用STS临时凭证直接调用阿里云TTS服务
 */
export class AliyunClientVoiceServiceClass {
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private stsCredentials: STSCredentials | null = null;
  private credentialsExpireTime: number = 0;
  private audioFilePath: string | null = null;
  private lastErrorTime: number = 0;
  private isSpeaking: boolean = false;
  
  
  private ttsServiceURLs = {
    'cn-shanghai': 'https://nls-gateway-cn-shanghai.aliyuncs.com/rest/v1/tts',
    'cn-beijing': 'https://nls-gateway-cn-beijing.aliyuncs.com/rest/v1/tts',
    'cn-shenzhen': 'https://nls-gateway-cn-shenzhen.aliyuncs.com/rest/v1/tts',
  };

  constructor() {
    
    this.safeInitialize();
  }

  /**
   * 安全的初始化方法，不会抛出异常
   */
  private async safeInitialize(): Promise<void> {
    try {
      if (!this.isInitialized && !this.isInitializing) {
        
        
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        
        try {
          await Recording.stop().catch(() => {
            // 忽略停止录音时的错误
          });
        } catch (e) {
          
        }
        
        await this.initializeService();
      }
    } catch (error) {
      
      
    }
  }

  /**
   * 初始化服务
   */
  private async initializeService(): Promise<void> {
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
            
            
          }
        } catch (permError) {
          
          
        }
      }
      
      
      try {
        
        Recording.init({
          sampleRate: 16000,        
          channels: 1,              
          bitsPerSample: 16,        
          audioSource: 6,           
          outputFormat: 1           
        });
      } catch (initError) {
        
        this.showToast('音频播放器初始化失败');
        throw new Error('音频播放器初始化失败');
      }
      
      
      await this.refreshSTSCredentials();
      
      this.isInitialized = true;
      
    } catch (error) {
      
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 确保服务已初始化
   */
  public async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    if (this.isInitializing) {
      
      let attempts = 0;
      while (this.isInitializing && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.isInitialized) {
        this.showToast('语音合成服务初始化超时');
        return false;
      }
      
      return true;
    }
    
    try {
      await this.initializeService();
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }

  /**
   * 刷新STS临时凭证
   */
  private async refreshSTSCredentials(): Promise<void> {
    if (!API_SERVER) {
      throw new Error('API服务器地址未配置');
    }

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < maxRetries) {
      try {
        
        
        
        const deviceInfo = {
          platform: Platform.OS,
          version: Platform.Version,
          
          manufacturer: Platform.OS === 'android' ? Platform.constants?.Manufacturer : undefined,
          brand: Platform.OS === 'android' ? Platform.constants?.Brand : undefined,
          model: Platform.OS === 'android' ? Platform.constants?.Model : undefined
        };

        const response = await axios.post(`${API_SERVER}/api/sts/credentials`, {
          clientInfo: JSON.stringify(deviceInfo)
        }, {
          timeout: 10000
        });

        if (response.data && response.data.credentials) {
          this.stsCredentials = response.data.credentials;
          this.credentialsExpireTime = new Date(response.data.credentials.expiration).getTime();
          return;
        }

      } catch (error) {
        console.error('Failed to refresh STS credentials:', error);
        throw error;
      }
    }

    
    
    
    if (__DEV__) {
      
      this.stsCredentials = {
        accessKeyId: 'mock-access-key-id',
        accessKeySecret: 'mock-access-key-secret',
        securityToken: 'mock-security-token',
        expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
        region: 'cn-shanghai',
        ttsEndpoint: 'nls-gateway-cn-shanghai.aliyuncs.com',
        ttsApiVersion: '2023-11-01',
        appKey: 'mock-app-key'
      };
      this.credentialsExpireTime = Date.now() + 3600 * 1000 - (5 * 60 * 1000);
      return;
    }

    throw lastError || new Error('获取STS凭证失败：未知错误');
  }

  /**
   * 获取有效的STS凭证
   * 如果已有凭证即将过期，会自动刷新
   */
  private async getValidCredentials(): Promise<STSCredentials> {
    if (!this.stsCredentials || Date.now() >= this.credentialsExpireTime) {
      await this.refreshSTSCredentials();
    }
    
    if (!this.stsCredentials) {
      throw new Error('无法获取有效的临时访问凭证');
    }
    
    return this.stsCredentials;
  }

  /**
   * 生成签名
   * @param method HTTP方法
   * @param date 请求日期
   * @param path 请求路径
   * @param query 查询参数
   * @param headers 请求头
   * @param credentials STS凭证
   */
  private generateSignature(
    method: string,
    date: string,
    path: string,
    query: Record<string, string>,
    headers: Record<string, string>,
    credentials: STSCredentials
  ): string {
    
    const sortedQuery = Object.keys(query).sort().map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
    }).join('&');
    
    
    const sortedHeaders = Object.keys(headers).sort().map(key => {
      return `${key.toLowerCase()}:${headers[key] || ''}`;
    }).join('\n');
    
    
    const stringToSign = [
      method.toUpperCase(),
      headers['content-md5'] || '',
      headers['content-type'] || '',
      date,
      `x-acs-security-token:${credentials.securityToken}`,
      
      sortedHeaders,
      `${path}?${sortedQuery}`
    ].join('\n');
    
    
    const signature = crypto.HmacSHA1(stringToSign, credentials.accessKeySecret);
    
    
    return crypto.enc.Base64.stringify(signature);
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
    region?: string;
  }): Promise<void> {
    
    if (!text || text.trim().length === 0) {
      
      return;
    }
    
    
    if (this.isSpeaking) {
      
      this.showToast('正在播放中');
      return;
    }
    
    this.isSpeaking = true;
    let tempFilePath: string | null = null;
    
    try {
      
      const now = Date.now();
      if (now - this.lastErrorTime < 3000) {
        this.showToast('请稍后再试');
        this.isSpeaking = false;
        return;
      }

      
      
      
      const defaultOptions = {
        format: 'mp3',           
        sampleRate: 16000,        
        voice: 'xiaoyun',         
        volume: 50,               
        speed: 0,                 
        pitch: 0,                 
        region: 'shanghai'        
      };
      
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      try {
        
        const initialized = await this.ensureInitialized();
        if (initialized && this.stsCredentials) {
          
          if (!options?.region && this.stsCredentials.region) {
            mergedOptions.region = this.stsCredentials.region.replace('cn-', '');
          }
          
          
        } else {
          
        }
      } catch (initError) {
        
      }
      
      
      
      
      await this.useServerSideTTS(text, mergedOptions);
      return;

    } catch (error) {
      
      this.lastErrorTime = Date.now();
      
      
      if (tempFilePath) {
        try {
          await RNFS.unlink(tempFilePath);
        } catch (e) {}
      }
      
      
      this.useLocalTTS(text);
    } finally {
      
      this.isSpeaking = false;
    }
  }

  /**
   * 使用服务端进行TTS合成
   */
  private async useServerSideTTS(text: string, options: any): Promise<void> {
    let tempFilePath: string | null = null;
    const maxRetries = 2;
    let retryCount = 0;
    
    try {
      while (retryCount <= maxRetries) {
        try {
          
          
          
          if (!API_SERVER) {
            
            this.useLocalTTS(text);
            return;
          }
          
          
          
          let response;
          try {
            
            const requestParams = {
              text: text,
              options: {
                format: options.format || 'mp3',
                voice: options.voice || 'xiaoyun',
                sample_rate: options.sampleRate || 16000,
                volume: options.volume || 50,
                speech_rate: options.speed || 0,
                pitch_rate: options.pitch || 0
              }
            };
            
            response = await axios.post(`${API_SERVER}/api/tts/synthesize`, requestParams, {
              responseType: 'arraybuffer',
              timeout: 20000, 
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg, audio/wav'
              }
            });
          } catch (requestError) {
            
            
            if (axios.isAxiosError(requestError)) {
              const errorMessage = requestError.response?.data || requestError.message;
              
              
              if (requestError.code === 'ECONNABORTED') {
                this.showToast('服务器请求超时，请稍后再试');
              } else if (requestError.code === 'ERR_NETWORK') {
                this.showToast('网络连接错误，请检查网络');
              } else if (requestError.response) {
                this.showToast(`服务器错误 (${requestError.response.status})`);
              } else {
                this.showToast('语音合成请求失败');
              }
            } else {
              this.showToast('语音合成请求失败');
            }
            
            throw requestError;
          }
          
          
          
          
          if (response.status !== 200) {
            
            this.showToast(`语音合成失败: 服务器错误 (${response.status})`);
            throw new Error(`服务器返回错误状态码: ${response.status}`);
          }
          
          
          
          
          if (!response.data || response.data.byteLength < 100) {
            
            this.showToast('生成的语音无效，请重试');
            throw new Error('接收到的音频数据无效或太小');
          }
          
          
          await this.ensureTempDirectory();
          
          
          const fileExt = options.format === 'wav' ? 'wav' : 'mp3';
          tempFilePath = `${RNFS.CachesDirectoryPath}/speech_${Date.now()}.${fileExt}`;
          
          
          
          await RNFS.writeFile(tempFilePath, this.arrayBufferToBase64(response.data), 'base64');
          
          
          
          
          this.audioFilePath = tempFilePath;
          await this.playAudio(tempFilePath);
          
          
          return;
          
        } catch (attemptError) {
          
          retryCount++;
          
          
          if (retryCount <= maxRetries) {
            const delayMs = 1000 * retryCount;
            
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            
            
            
            
            this.useLocalTTS(text);
          }
        }
      }
    } catch (error) {
      
      
      this.useLocalTTS(text);
    } finally {
      
      if (tempFilePath && tempFilePath !== this.audioFilePath) {
        try {
          const exists = await RNFS.exists(tempFilePath);
          if (exists) {
            
            await RNFS.unlink(tempFilePath);
          }
        } catch (cleanupError) {
          
        }
      }
    }
  }
  
  /**
   * 将ArrayBuffer转换为Base64字符串
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * 确保临时目录存在
   */
  private async ensureTempDirectory(): Promise<void> {
    try {
      const cacheDirExists = await RNFS.exists(RNFS.CachesDirectoryPath);
      if (!cacheDirExists) {
        
        await RNFS.mkdir(RNFS.CachesDirectoryPath);
      }
      
      const ttsDirPath = `${RNFS.CachesDirectoryPath}/tts`;
      const ttsDirExists = await RNFS.exists(ttsDirPath);
      if (!ttsDirExists) {
        
        await RNFS.mkdir(ttsDirPath);
      }
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * 使用设备的本地 TTS 功能（回退方案）
   * @param text 要播放的文本
   */
  private useLocalTTS(text: string): void {
    if (Platform.OS === 'android') {
      const androidText = text.substring(0, 4000);
      Alert.alert(
        '语音内容',
        androidText,
        [{ text: '确定', style: 'default' }]
      );
    }
  }

  /**
   * 创建并初始化音频实例
   */
  private async createAudioInstance(): Promise<boolean> {
    try {
      
      
      
      try {
        await Recording.stop().catch(() => {});
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
   * 播放音频文件
   * @param filePath 音频文件路径
   */
  private async playAudio(filePath: string): Promise<void> {
    try {
      console.log('Playing audio...');
    } catch (error) {
      console.error('Failed to play audio:', error);
      this.showToast('播放音频失败');
    }
  }

  private handleError(error: Error, retryCount: number): void {
    console.error(`Error occurred (attempt ${retryCount}):`, error);
    this.showToast(`操作失败，已重试 ${retryCount} 次`);
  }
}

// 创建并导出服务实例
const AliyunClientVoiceService = new AliyunClientVoiceServiceClass();
export { AliyunClientVoiceService };
export default AliyunClientVoiceService; 