import dotenv from 'dotenv';
import axios from 'axios';

// 加载环境变量
dotenv.config();

/**
 * 百度语音服务接口
 */
interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  session_key: string;
  refresh_token?: string;
}

/**
 * 百度语音服务类
 * 负责获取和管理百度AI开放平台的访问令牌
 */
class BaiduVoiceService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  
  constructor() {
    this.clientId = process.env.BAIDU_API_KEY || '';
    this.clientSecret = process.env.BAIDU_SECRET_KEY || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('百度API凭证未配置，部分语音功能可能不可用');
    } else {
      console.log('百度语音服务初始化完成');
      
      // 初始化时尝试获取访问令牌
      this.getAccessToken()
        .then(token => {
          console.log('初始化时成功获取百度访问令牌');
        })
        .catch(error => {
          console.error('初始化时获取百度访问令牌失败:', error);
        });
    }
  }
  
  /**
   * 获取百度AI平台访问令牌
   * @returns 访问令牌
   */
  public async getAccessToken(): Promise<string> {
    try {
      // 检查缓存的令牌是否有效
      const now = Date.now();
      if (this.accessToken && this.tokenExpireTime > now) {
        return this.accessToken;
      }
      
      console.log('开始获取百度AI平台访问令牌...');
      
      if (!this.clientId || !this.clientSecret) {
        throw new Error('百度API凭证未配置');
      }
      
      const url = `https://aip.baidubce.com/oauth/2.0/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;
      
      const response = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('获取百度访问令牌失败：无效的响应格式');
      }
      
      const data = response.data as BaiduTokenResponse;
      
      this.accessToken = data.access_token;
      
      // 设置令牌过期时间（减去30分钟的安全边界）
      this.tokenExpireTime = now + (data.expires_in * 1000) - (30 * 60 * 1000);
      
      console.log('成功获取百度访问令牌，过期时间:', new Date(this.tokenExpireTime).toISOString());
      
      return this.accessToken;
    } catch (error) {
      console.error('获取百度访问令牌失败:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('百度API响应:', error.response?.data);
      }
      
      throw new Error('获取百度访问令牌失败');
    }
  }
  
  /**
   * 检查访问令牌是否有效
   */
  public isTokenValid(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpireTime;
  }
}

// 导出单例实例
export default new BaiduVoiceService(); 