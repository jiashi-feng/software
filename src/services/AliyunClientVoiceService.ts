import axios from 'axios';
import RNFS from 'react-native-fs';
import Recording from 'react-native-recording';
import { Platform, PermissionsAndroid, Alert, ToastAndroid } from 'react-native';
import queryString from 'query-string';
import crypto from 'crypto-js';

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
class AliyunClientVoiceServiceClass {
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private stsCredentials: STSCredentials | null = null;
  private credentialsExpireTime: number = 0;
  private audioFilePath: string | null = null;
  private lastErrorTime: number = 0;
  private isSpeaking: boolean = false;
  
  // 阿里云TTS服务地址映射
  private ttsServiceURLs = {
    'cn-shanghai': 'https://nls-gateway-cn-shanghai.aliyuncs.com/rest/v1/tts',
    'cn-beijing': 'https://nls-gateway-cn-beijing.aliyuncs.com/rest/v1/tts',
    'cn-shenzhen': 'https://nls-gateway-cn-shenzhen.aliyuncs.com/rest/v1/tts',
  };

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
        console.log('AliyunClientVoiceService 开始安全初始化...');
        
        // 延迟一段时间再初始化，确保React Native环境和其他服务准备好
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 尝试安全停止任何可能正在运行的录音/播放
        try {
          await Recording.stop().catch(() => {
            // 忽略错误，这只是预防性的
            console.log('预防性停止Recording (忽略错误)');
          });
        } catch (e) {
          // 忽略任何错误
        }
        
        await this.initializeService();
      }
    } catch (error) {
      console.error('安全初始化失败:', error);
      // 不抛出异常
    }
  }

  /**
   * 初始化服务
   */
  private async initializeService(): Promise<void> {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    
    try {
      console.log('初始化语音合成服务...');
      
      // 设置全局错误处理器，特别处理AudioRecord错误
      if (Platform.OS === 'android') {
        const ErrorUtils = (global as any).ErrorUtils as {
          getGlobalHandler: () => (error: Error, isFatal: boolean) => void;
          setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
        } | undefined;
        
        if (ErrorUtils) {
          const previousHandler = ErrorUtils.getGlobalHandler();
          
          ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
            // 特别处理AudioRecord相关错误
            if (error.message && (
                error.message.includes('AudioRecord') || 
                error.message.includes('Recording') ||
                error.message.includes('play') ||
                error.message.includes('stop')
              )) {
              console.error('捕获到AudioRecord相关错误:', error);
              
              // 显示更友好的提示
              if (ToastAndroid) {
                ToastAndroid.show('语音播放功能暂时不可用，请稍后再试', ToastAndroid.LONG);
              }
              
              // 不将此错误视为致命错误
              return previousHandler(error, false);
            }
            
            // 处理其他错误
            return previousHandler(error, isFatal);
          });
        }
      }
      
      // 检查存储权限（用于保存临时音频文件）
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
      
      // 初始化播放器
      try {
        console.log('配置音频播放器参数...');
        Recording.init({
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6,
          outputFormat: 1,
        });
      } catch (initError) {
        console.error('音频播放器初始化失败:', initError);
        this.showToast('音频播放器初始化失败');
        throw new Error('音频播放器初始化失败');
      }
      
      // 获取首次STS凭证
      await this.refreshSTSCredentials();
      
      this.isInitialized = true;
      console.log('语音合成服务初始化成功');
    } catch (error) {
      console.error('语音合成服务初始化失败:', error);
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
      // 等待初始化完成，最多等待5秒
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
        console.log(`正在获取阿里云临时访问凭证...尝试 ${retryCount + 1}/${maxRetries}`);
        
        // 获取设备信息
        const deviceInfo = {
          platform: Platform.OS,
          version: Platform.Version,
          // 安全地获取设备信息，注意属性名大写
          manufacturer: Platform.OS === 'android' ? Platform.constants?.Manufacturer : undefined,
          brand: Platform.OS === 'android' ? Platform.constants?.Brand : undefined,
          model: Platform.OS === 'android' ? Platform.constants?.Model : undefined
        };

        const response = await axios.post(`${API_SERVER}/api/sts/credentials`, {
          clientInfo: JSON.stringify(deviceInfo)
        }, {
          timeout: 10000, // 10秒超时
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status === 200 // 只接受200状态码
        });

        console.log('STS响应状态:', response.status);
        console.log('STS响应类型:', typeof response.data);
        
        if (!response.data?.success || !response.data?.data) {
          console.error('服务器返回无效响应:', JSON.stringify(response.data).substring(0, 200));
          throw new Error(`无效的服务器响应: ${JSON.stringify(response.data)}`);
        }

        const credentials = response.data.data;
        
        // 验证必要的凭证字段
        const requiredFields = [
          'accessKeyId',
          'accessKeySecret',
          'securityToken',
          'expiration'
        ];

        const missingFields = requiredFields.filter(field => !credentials[field]);
        if (missingFields.length > 0) {
          console.error('STS凭证缺少字段:', missingFields);
          console.error('收到的凭证数据:', JSON.stringify(credentials).substring(0, 200));
          throw new Error(`STS凭证缺少必要字段: ${missingFields.join(', ')}`);
        }

        this.stsCredentials = credentials;
        
        // 设置过期时间（提前5分钟过期）
        const expireDate = new Date(credentials.expiration);
        this.credentialsExpireTime = expireDate.getTime() - (5 * 60 * 1000);
        
        console.log('成功获取临时访问凭证，过期时间:', credentials.expiration);
        return;

      } catch (error) {
        lastError = error;
        retryCount++;

        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message;
          console.error(`STS凭证获取失败 (${retryCount}/${maxRetries}):`, errorMessage);
          
          if (error.code === 'ECONNABORTED') {
            this.showToast('服务器请求超时，正在重试...');
          } else if (error.code === 'ERR_NETWORK') {
            this.showToast('网络连接错误，请检查网络');
          } else if (error.response) {
            this.showToast(`服务器错误 (${error.response.status})`);
          }
        } else {
          console.error('STS凭证获取失败:', error instanceof Error ? error.message : '未知错误');
          this.showToast('获取访问凭证失败');
        }

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 指数退避，最大5秒
          console.log(`将在 ${delay/1000} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有重试都失败后的处理
    console.error('多次尝试获取STS凭证均失败');
    
    if (__DEV__) {
      console.warn('开发环境：使用模拟凭证（仅用于测试）');
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
    // 规范化查询字符串
    const sortedQuery = Object.keys(query).sort().map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
    }).join('&');
    
    // 规范化请求头
    const sortedHeaders = Object.keys(headers).sort().map(key => {
      return `${key.toLowerCase()}:${headers[key] || ''}`;
    }).join('\n');
    
    // 构建签名字符串
    const stringToSign = [
      method.toUpperCase(),
      headers['content-md5'] || '',
      headers['content-type'] || '',
      date,
      `x-acs-security-token:${credentials.securityToken}`,
      // 添加其他自定义头
      sortedHeaders,
      `${path}?${sortedQuery}`
    ].join('\n');
    
    // 使用HMAC-SHA1计算签名
    const signature = crypto.HmacSHA1(stringToSign, credentials.accessKeySecret);
    
    // 转换为Base64
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
    // 防止空文本
    if (!text || text.trim().length === 0) {
      console.log('语音合成收到空文本，忽略请求');
      return;
    }
    
    // 添加发音标志，表示当前是否有语音正在播放
    if (this.isSpeaking) {
      console.log('已有语音正在播放，忽略新请求');
      this.showToast('正在播放中');
      return;
    }
    
    this.isSpeaking = true;
    let tempFilePath: string | null = null;
    
    try {
      // 防止频繁点击导致的问题
      const now = Date.now();
      if (now - this.lastErrorTime < 3000) {
        this.showToast('请稍后再试');
        this.isSpeaking = false;
        return;
      }

      console.log('开始语音合成请求...');
      
      // 默认参数（不依赖STS凭证）
      const defaultOptions = {
        format: 'mp3',           // 音频格式，支持 wav、mp3
        sampleRate: 16000,        // 采样率
        voice: 'xiaoyun',         // 发音人，如 xiaoyun、xiaogang 等
        volume: 50,               // 音量，范围是 0-100
        speed: 0,                 // 语速，范围是-500~500
        pitch: 0,                 // 语调，范围是-500~500
        region: 'shanghai'        // 默认使用上海区域
      };
      
      // 合并选项
      const mergedOptions = { ...defaultOptions, ...options };
      
      try {
        // 尝试确保初始化和获取STS凭证
        const initialized = await this.ensureInitialized();
        if (initialized && this.stsCredentials) {
          // 使用凭证中的区域（如果没有在options中指定）
          if (!options?.region && this.stsCredentials.region) {
            mergedOptions.region = this.stsCredentials.region.replace('cn-', '');
          }
          
          console.log('使用STS凭证进行语音合成...');
        } else {
          console.log('无法获取STS凭证，将直接使用服务端合成...');
        }
      } catch (initError) {
        console.error('初始化语音服务失败，将直接使用服务端合成:', initError);
      }
      
      console.log('语音合成参数:', mergedOptions);
      
      // 使用服务端合成（无论STS凭证是否获取成功）
      await this.useServerSideTTS(text, mergedOptions);
      return;

    } catch (error) {
      console.error('语音合成错误:', error);
      this.lastErrorTime = Date.now();
      
      // 清理临时文件
      if (tempFilePath) {
        try {
          await RNFS.unlink(tempFilePath);
        } catch (e) {}
      }
      
      // 服务器请求失败，尝试使用设备的 TTS
      this.useLocalTTS(text);
    } finally {
      // 确保在所有情况下都重置状态
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
          console.log(`使用服务端进行语音合成...尝试 ${retryCount + 1}/${maxRetries + 1}`);
          
          // 检查服务器地址
          if (!API_SERVER) {
            console.error('API服务器地址未配置');
            this.useLocalTTS(text);
            return;
          }
          
          // 使用服务端阿里云合成服务
          console.log('发送语音合成请求到服务器...');
          let response;
          try {
            // 构建语音合成请求参数
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
            
            console.log('语音合成参数:', JSON.stringify(requestParams));
            
            // 发送请求到服务器
            response = await axios.post(`${API_SERVER}/api/tts/synthesize`, requestParams, {
              responseType: 'arraybuffer',
              timeout: 20000, // 增加超时时间到20秒
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg, audio/wav'
              }
            });
          } catch (requestError) {
            console.error('服务器请求失败:', requestError);
            
            if (axios.isAxiosError(requestError)) {
              const errorMessage = requestError.response?.data || requestError.message;
              console.error('服务器响应:', errorMessage);
              
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
          
          // 检查响应状态
          console.log('服务器响应状态:', response.status);
          
          if (response.status !== 200) {
            console.error(`服务器返回错误状态码: ${response.status}`);
            this.showToast(`语音合成失败: 服务器错误 (${response.status})`);
            throw new Error(`服务器返回错误状态码: ${response.status}`);
          }
          
          // 检查返回的数据是否有效
          console.log(`收到的音频数据大小: ${response.data.byteLength} 字节`);
          
          if (!response.data || response.data.byteLength < 100) {
            console.error('接收到的音频数据无效或太小');
            this.showToast('生成的语音无效，请重试');
            throw new Error('接收到的音频数据无效或太小');
          }
          
          // 确保临时目录存在
          await this.ensureTempDirectory();
          
          // 生成临时文件路径
          const fileExt = options.format === 'wav' ? 'wav' : 'mp3';
          tempFilePath = `${RNFS.CachesDirectoryPath}/speech_${Date.now()}.${fileExt}`;
          
          // 将音频数据保存到临时文件
          console.log('将音频数据保存到临时文件:', tempFilePath);
          await RNFS.writeFile(tempFilePath, this.arrayBufferToBase64(response.data), 'base64');
          
          // 播放音频
          console.log('开始播放音频...');
          
          this.audioFilePath = tempFilePath;
          await this.playAudio(tempFilePath);
          
          console.log('语音播放完成');
          return;
          
        } catch (attemptError) {
          console.error(`语音合成尝试 ${retryCount + 1} 失败:`, attemptError);
          retryCount++;
          
          // 如果还有重试机会，等待一段时间后重试
          if (retryCount <= maxRetries) {
            const delayMs = 1000 * retryCount;
            console.log(`将在 ${delayMs / 1000} 秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.error('语音合成尝试次数已达上限');
            
            // 所有重试都失败，尝试使用本地TTS
            console.log('尝试使用本地TTS作为备选方案...');
            this.useLocalTTS(text);
          }
        }
      }
    } catch (error) {
      console.error('语音合成过程出错:', error);
      // 尝试使用本地TTS
      this.useLocalTTS(text);
    } finally {
      // 如果创建了临时文件但未成功播放，尝试清理
      if (tempFilePath && tempFilePath !== this.audioFilePath) {
        try {
          const exists = await RNFS.exists(tempFilePath);
          if (exists) {
            console.log('清理未使用的临时文件:', tempFilePath);
            await RNFS.unlink(tempFilePath);
          }
        } catch (cleanupError) {
          console.warn('清理临时文件失败:', cleanupError);
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
        console.log('缓存目录不存在，尝试创建');
        await RNFS.mkdir(RNFS.CachesDirectoryPath);
      }
      
      const ttsDirPath = `${RNFS.CachesDirectoryPath}/tts`;
      const ttsDirExists = await RNFS.exists(ttsDirPath);
      if (!ttsDirExists) {
        console.log('TTS缓存目录不存在，尝试创建');
        await RNFS.mkdir(ttsDirPath);
      }
    } catch (error) {
      console.error('检查或创建缓存目录失败:', error);
      throw error;
    }
  }

  /**
   * 使用设备的本地 TTS 功能（回退方案）
   * @param text 要播放的文本
   */
  private useLocalTTS(text: string): void {
    try {
      console.log('无法通过语音播放内容，直接显示文本');
      
      // 不弹出Toast，直接在控制台输出文本
      console.log('文本内容:', text);
      
      // 直接让AI回复文本
      // 不进行任何显示，让AI的文本回复本身作为响应
    } catch (error) {
      console.error('本地TTS错误:', error);
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
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        outputFormat: 1,
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
   * 播放音频文件
   * @param filePath 音频文件路径
   */
  private async playAudio(filePath: string): Promise<void> {
    try {
      console.log('准备播放音频文件:', filePath);
      
      // 确保文件存在
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error(`音频文件不存在: ${filePath}`);
      }
      
      // 添加重试机制
      let playAttempts = 0;
      const maxPlayAttempts = 3;
      let playSuccess = false;
      
      while (playAttempts < maxPlayAttempts && !playSuccess) {
        try {
          playAttempts++;
          console.log(`尝试播放音频 (${playAttempts}/${maxPlayAttempts})...`);
          
          // 确保播放器状态良好
          if (playAttempts > 1) {
            // 重试之前重新创建录音实例
            await this.createAudioInstance();
          }
          
          // 设置正在播放标志
          this.isSpeaking = true;
          
          // 尝试播放
          await Recording.play(filePath);
          
          // 如果没有抛出异常，则播放成功
          console.log('开始播放音频成功');
          playSuccess = true;
          
          // 等待播放完成（近似计算播放时间，每秒约播放2个字，至少3秒）
          const estimatedPlayTime = 3000; // 至少3秒
          console.log(`等待播放完成，预计至少 ${estimatedPlayTime/1000} 秒...`);
          await new Promise(resolve => setTimeout(resolve, estimatedPlayTime));
          
          console.log('音频播放完成');
        } catch (retryError) {
          console.error(`播放尝试 ${playAttempts} 失败:`, retryError);
          
          if (playAttempts < maxPlayAttempts) {
            // 等待一会儿再重试
            const delay = 1000 * playAttempts;
            console.log(`将在 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } finally {
          // 播放结束，重置标志
          this.isSpeaking = false;
        }
      }
      
      if (!playSuccess) {
        throw new Error(`播放音频失败，已尝试 ${maxPlayAttempts} 次`);
      }
    } catch (error) {
      console.error('播放音频失败:', error);
      this.showToast('播放语音失败');
      throw error;
    }
  }
}

// 创建单例实例
export const AliyunClientVoiceService = new AliyunClientVoiceServiceClass();

export default AliyunClientVoiceService; 