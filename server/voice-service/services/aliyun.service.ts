import Core from '@alicloud/pop-core';
import dotenv from 'dotenv';
import aliyunTTSService from './aliyun-tts.service';
import axios from 'axios';
import crypto from 'crypto-js';

// 加载环境变量
dotenv.config();

interface CreateTokenResponse {
  RequestId?: string;
  Token: {
    Id: string;
    ExpireTime: number;
  }
}

/**
 * 阿里云服务类
 * 主要负责获取访问令牌和管理基础服务
 */
class AliyunService {
  private client: Core;
  private accessKeyId: string;
  private accessKeySecret: string;
  private appKey: string;
  private endpoint: string;
  
  private token: string | null = null;
  private tokenExpireTime: number = 0;

  constructor() {
    this.accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || '';
    this.accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
    this.appKey = process.env.ALIYUN_TTS_APP_KEY || '';
    this.endpoint = process.env.ALIYUN_ENDPOINT || 'nls-meta.cn-shanghai.aliyuncs.com';

    // 确保端点格式正确
    if (!this.endpoint.startsWith('http')) {
      this.endpoint = `https://${this.endpoint}`;
    }

    if (!this.accessKeyId || !this.accessKeySecret) {
      console.error('阿里云访问凭证未配置，请检查环境变量');
      throw new Error('阿里云访问凭证未配置');
    }

    console.log(`初始化阿里云服务，端点: ${this.endpoint}`);

    // 创建 POP Core 客户端
    this.client = new Core({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      endpoint: this.endpoint,
      apiVersion: '2019-02-28'
    });
    
    // 初始化时尝试获取访问令牌
    this.getToken()
      .then(token => {
        console.log('初始化时成功获取令牌');
        // 将令牌传递给TTS服务
        aliyunTTSService.setToken(token, this.tokenExpireTime);
      })
      .catch(error => {
        console.error('初始化时获取令牌失败:', error);
      });
  }

  /**
   * 获取阿里云访问令牌
   * @throws {Error} 当获取令牌失败时抛出错误
   * @returns 访问令牌
   */
  public async getToken(): Promise<string> {
    try {
      // 检查缓存的令牌是否有效
      const now = Date.now();
      if (this.token && this.tokenExpireTime > now) {
        console.log('使用缓存的访问令牌');
        return this.token;
      }

      console.log('开始获取阿里云访问令牌...');

      // 准备请求参数
      const params = {
        Action: 'CreateToken',
        Format: 'JSON',
        RegionId: process.env.ALIYUN_REGION || 'cn-shanghai',
        Version: '2019-02-28'
      };

      console.log(`发送请求到 ${this.endpoint}, 参数:`, params);

      try {
        // 直接使用客户端发送请求
        // 使用客户端发送请求
        const response = await this.client.request('CreateToken', params, {
          method: 'POST',
          timeout: 10000,
          formatParams: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }) as CreateTokenResponse;

        console.log('收到响应:', JSON.stringify(response).substring(0, 200));

        // 处理响应
        if (!response?.Token?.Id) {
          throw new Error('获取访问令牌失败：无效的响应格式');
        }

        this.token = response.Token.Id;
        
        // 设置令牌过期时间（转换为毫秒并预留5分钟安全边界）
        this.tokenExpireTime = response.Token.ExpireTime * 1000 - (5 * 60 * 1000);

        console.log('成功获取访问令牌，过期时间:', new Date(this.tokenExpireTime).toISOString());
        
        // 将令牌传递给TTS服务
        aliyunTTSService.setToken(this.token, this.tokenExpireTime);
        
        if (!this.token) {
          throw new Error('获取访问令牌失败：令牌为空');
        }

        return this.token;
      } catch (requestError) {
        console.error('POP Core客户端请求失败:', requestError);
        
        // 尝试第二种方法 - 直接使用签名器创建请求
        try {
          console.log('尝试使用第二种方法获取令牌...');
          return await this.getTokenWithSignature();
        } catch (secondError) {
          console.error('第二种方法也失败:', secondError);
          
          // 如果都失败了，尝试一种简化方式
          return await this.getTokenSimplified();
        }
      }
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      if (error instanceof Error) {
        throw new Error(`获取阿里云令牌失败: ${error.message}`);
      } else {
        throw new Error('获取阿里云令牌失败');
      }
    }
  }

  /**
   * 使用正确的签名方式获取令牌
   */
  private async getTokenWithSignature(): Promise<string> {
    console.log('使用签名器创建请求...');
    
    try {
      // 创建标准的参数对象
      const date = new Date();
      // ISO 8601格式的时间戳，例如：2022-01-01T12:00:00Z
      const timestamp = date.toISOString().replace(/\.\d{3}Z$/, 'Z'); 
      const nonce = Date.now().toString();
      
      const parameters: Record<string, string> = {
        AccessKeyId: this.accessKeyId,
        Action: 'CreateToken',
        Format: 'JSON',
        RegionId: process.env.ALIYUN_REGION || 'cn-shanghai',
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: nonce,
        SignatureVersion: '1.0',
        Timestamp: timestamp,
        Version: '2019-02-28'
      };
      
      // 1. 构造规范化请求字符串
      const sortedKeys = Object.keys(parameters).sort();
      let canonicalizedQueryString = '';
      
      sortedKeys.forEach((key) => {
        if (key !== 'Signature' && parameters[key]) {
          // 参数值需要URL编码
          const encodedValue = encodeURIComponent(parameters[key])
            .replace(/\+/g, '%20')
            .replace(/\*/g, '%2A')
            .replace(/%7E/g, '~');
            
          // 参数键也需要URL编码
          const encodedKey = encodeURIComponent(key);
          
          if (canonicalizedQueryString.length > 0) {
            canonicalizedQueryString += '&';
          }
          canonicalizedQueryString += `${encodedKey}=${encodedValue}`;
        }
      });
      
      // 2. 构造待签名字符串
      const httpMethod = 'GET';
      const stringToSign = httpMethod + '&' + 
                           encodeURIComponent('/') + '&' + 
                           encodeURIComponent(canonicalizedQueryString);
      
      console.log('待签名字符串:', stringToSign);
      
      // 3. 计算签名
      const secretKey = this.accessKeySecret + '&'; // 注意这里要加上'&'
      const signature = crypto.HmacSHA1(stringToSign, secretKey);
      const base64Signature = crypto.enc.Base64.stringify(signature);
      
      console.log('生成的签名:', base64Signature);
      
      // 4. 添加签名参数
      const signedQuery = canonicalizedQueryString + '&' + 
                          encodeURIComponent('Signature') + '=' + 
                          encodeURIComponent(base64Signature);
      
      // 5. 构造最终URL
      const requestUrl = `https://${this.endpoint.replace(/^https?:\/\//, '')}/?${signedQuery}`;
      
      console.log('请求URL:', requestUrl.substring(0, 100) + '...');
      
      // 6. 发送请求
      const response = await axios.get(requestUrl);
      console.log('响应:', JSON.stringify(response.data).substring(0, 200));
      
      // 7. 处理响应
      if (!response.data?.Token?.Id) {
        throw new Error('令牌响应无效');
      }
      
      this.token = response.data.Token.Id;
      this.tokenExpireTime = response.data.Token.ExpireTime * 1000 - (5 * 60 * 1000);
      
      // 将令牌传递给TTS服务
      if (this.token) {
        aliyunTTSService.setToken(this.token, this.tokenExpireTime);
      }
      
      console.log('签名方法成功获取令牌');
      return this.token || '';
    } catch (error) {
      console.error('签名方法获取令牌失败:', error);
      throw error;
    }
  }

  /**
   * 使用简化方式获取令牌（最后尝试）
   */
  private async getTokenSimplified(): Promise<string> {
    console.log('尝试使用简化方式获取令牌...');
    
    try {
      // 为了简单起见，使用阿里云SDK
      const newClient = new Core({
        accessKeyId: this.accessKeyId,
        accessKeySecret: this.accessKeySecret,
        endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
        apiVersion: '2019-02-28'
      });
      
      const result = await newClient.request('CreateToken', {}, {
        method: 'POST'
      }) as { Token?: { Id: string; ExpireTime: number } };
      
      console.log('简化方式响应:', JSON.stringify(result).substring(0, 200));
      
      if (!result?.Token?.Id) {
        throw new Error('简化方式获取令牌失败');
      }
      
      this.token = result.Token.Id;
      this.tokenExpireTime = result.Token.ExpireTime * 1000 - (5 * 60 * 1000);
      
      if (this.token) {
        aliyunTTSService.setToken(this.token, this.tokenExpireTime);
      }
      
      return this.token || '';
    } catch (error) {
      console.error('简化方式获取令牌失败:', error);
      throw new Error('所有获取令牌方法均失败，请检查阿里云凭证和权限');
    }
  }
}

// 导出单例实例
export default new AliyunService(); 