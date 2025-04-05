import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

class BaiduService {
  private apiKey: string;
  private secretKey: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private tokenUrl: string = 'https://aip.baidubce.com/oauth/2.0/token';
  private asrUrl: string = 'https://vop.baidu.com/server_api';

  constructor() {
    this.apiKey = process.env.BAIDU_API_KEY || '';
    this.secretKey = process.env.BAIDU_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      throw new Error('百度语音云访问凭证未配置');
    }
  }

  /**
   * 获取百度访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 检查缓存的令牌是否有效
    const now = Date.now();
    if (this.accessToken && this.tokenExpireTime > now) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(this.tokenUrl, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey,
        },
      });

      if (!response.data.access_token) {
        throw new Error('获取百度访问令牌失败');
      }

      this.accessToken = response.data.access_token;
      
      // 设置令牌过期时间（百度令牌默认有效期30天，这里设为25天以确保安全）
      this.tokenExpireTime = now + 25 * 24 * 60 * 60 * 1000;
      
      return response.data.access_token;
    } catch (error) {
      console.error('获取百度访问令牌错误:', error);
      throw new Error('获取百度访问令牌失败');
    }
  }

  /**
   * 语音识别
   * @param audioData 音频数据（Base64编码）
   * @param format 音频格式
   * @param rate 采样率
   */
  public async speechToText(audioData: string, format: string = 'wav', rate: number = 16000): Promise<string> {
    try {
      // 获取访问令牌
      const token = await this.getAccessToken();

      // 发送语音识别请求
      const response = await axios.post(this.asrUrl, {
        format: format,
        rate: rate,
        channel: 1,
        token: token,
        cuid: 'server_app',
        speech: audioData,
        len: Buffer.from(audioData, 'base64').length,
      });

      // 处理识别结果
      if (response.data.result && response.data.result.length > 0) {
        return response.data.result[0];
      } else {
        throw new Error('语音识别失败，未返回结果');
      }
    } catch (error) {
      console.error('百度语音识别错误:', error);
      throw new Error('百度语音识别失败');
    }
  }
}

export default new BaiduService(); 