import Core from '@alicloud/pop-core';
import dotenv from 'dotenv';
import axios from 'axios';

// 加载环境变量
dotenv.config();

interface TokenResponse {
  Token: {
    Id: string;
    ExpireTime: number;
  }
}

class AliyunService {
  private client: Core;
  private accessKeyId: string;
  private accessKeySecret: string;
  private appKey: string;
  private tokenUrl: string = 'https://nls-meta.cn-shanghai.aliyuncs.com/pop/2019-02-28/token';
  
  // 更新为最新的TTS URLs
  private ttsServiceURLs = {
    shanghai: 'https://nls-gateway-cn-shanghai.aliyuncs.com/rest/v1/tts', // 上海服务区域
    beijing: 'https://nls-gateway-cn-beijing.aliyuncs.com/rest/v1/tts', // 北京服务区域
    shenzhen: 'https://nls-gateway-cn-shenzhen.aliyuncs.com/rest/v1/tts', // 深圳服务区域
  };
  
  private token: string | null = null;
  private tokenExpireTime: number = 0;

  constructor() {
    this.accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || '';
    this.accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
    this.appKey = process.env.ALIYUN_TTS_APP_KEY || '';

    if (!this.accessKeyId || !this.accessKeySecret) {
      throw new Error('阿里云访问凭证未配置');
    }

    // 创建 POP Core 客户端
    this.client = new Core({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      endpoint: `https://${process.env.ALIYUN_ENDPOINT || 'nls-meta.cn-shanghai.aliyuncs.com'}`,
      apiVersion: '2019-02-28'
    });
  }

  /**
   * 获取阿里云访问令牌
   */
  private async getToken(): Promise<string> {
    // 检查缓存的令牌是否有效
    const now = Date.now();
    if (this.token && this.tokenExpireTime > now) {
      return this.token;
    }

    try {
      const params = {
        "Action": "CreateToken",
        "Format": "JSON",
        "Version": "2019-02-28",
        "Timestamp": new Date().toISOString(),
        "SignatureNonce": Math.random().toString(36).substr(2, 15),
      };

      const result = await this.client.request('CreateToken', params, { method: 'POST' }) as TokenResponse;
      
      if (result && result.Token && result.Token.Id) {
        this.token = result.Token.Id;
        // 设置过期时间为令牌有效期的80%
        const expireTime = result.Token.ExpireTime * 1000;
        this.tokenExpireTime = now + (expireTime - now) * 0.8;
        return result.Token.Id;
      } else {
        throw new Error('获取阿里云令牌失败');
      }
    } catch (error) {
      console.error('获取阿里云令牌错误:', error);
      throw new Error('获取阿里云令牌失败');
    }
  }

  /**
   * 获取当前配置的TTS服务URL
   * @returns TTS服务URL
   */
  private getTTSServiceURL(region?: string): string {
    const configRegion = region || process.env.ALIYUN_SERVICE_REGION || 'shanghai';
    
    if (configRegion in this.ttsServiceURLs) {
      return this.ttsServiceURLs[configRegion as keyof typeof this.ttsServiceURLs];
    }
    
    // 默认使用上海区域
    return this.ttsServiceURLs.shanghai;
  }

  /**
   * 文本转语音
   * @param text 要转换的文本
   * @param options 合成选项
   */
  public async textToSpeech(text: string, options?: {
    format?: string;
    sampleRate?: number;
    voice?: string;
    volume?: number;
    speed?: number;
    pitch?: number;
    region?: string;
  }): Promise<Buffer> {
    try {
      console.log('准备获取阿里云访问令牌...');
      // 获取令牌
      const token = await this.getToken();
      console.log('获取令牌成功:', token.substring(0, 10) + '...');

      // 默认参数
      const defaultOptions = {
        format: 'mp3',           // 音频格式，支持 wav、mp3
        sampleRate: 16000,        // 采样率
        voice: 'xiaoyun',         // 发音人，如 xiaoyun、xiaogang 等
        volume: 50,               // 音量，范围是 0-100
        speed: 0,                 // 语速，范围是-500~500
        pitch: 0,                 // 语调，范围是-500~500
      };

      // 合并选项
      const mergedOptions = { ...defaultOptions, ...options };
      console.log('语音合成参数:', JSON.stringify(mergedOptions));

      // 获取TTS服务URL
      const ttsUrl = this.getTTSServiceURL(options?.region);
      console.log('准备调用阿里云TTS API:', ttsUrl);
      
      // 构建请求参数
      const params = new URLSearchParams();
      params.append('appkey', this.appKey);
      params.append('token', token);
      params.append('text', text);
      params.append('format', mergedOptions.format);
      params.append('sample_rate', mergedOptions.sampleRate.toString());
      params.append('voice', mergedOptions.voice);
      params.append('volume', mergedOptions.volume.toString());
      params.append('speech_rate', mergedOptions.speed.toString());
      params.append('pitch_rate', mergedOptions.pitch.toString());

      // 发送请求并获取音频数据
      console.log('发送请求到阿里云TTS服务...');
      const response = await axios.post(ttsUrl, params, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000 // 设置超时为15秒
      });

      // 检查是否成功
      console.log('阿里云TTS响应状态码:', response.status);
      if (response.status !== 200) {
        throw new Error(`阿里云语音合成请求失败: ${response.status}`);
      }

      console.log('阿里云TTS响应数据大小:', response.data.length);
      return Buffer.from(response.data);
    } catch (error) {
      console.error('阿里云语音合成出错:', error);
      if (axios.isAxiosError(error)) {
        console.error('请求详情:', {
          status: error.response?.status,
          headers: error.response?.headers,
          data: error.response?.data
        });
      }
      throw new Error('阿里云语音合成失败');
    }
  }
}

export default new AliyunService(); 