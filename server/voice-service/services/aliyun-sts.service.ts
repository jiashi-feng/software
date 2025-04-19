import dotenv from 'dotenv';
import Core from '@alicloud/pop-core';

// 加载环境变量
dotenv.config();

/**
 * 阿里云临时访问凭证响应接口
 */
export interface STSCredentials {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;
}

/**
 * 阿里云STS响应接口
 */
interface AssumeRoleResponse {
  RequestId?: string;
  Credentials: {
    AccessKeyId: string;
    AccessKeySecret: string;
    SecurityToken: string;
    Expiration: string;
  };
}

/**
 * 阿里云STS服务类
 * 负责生成临时访问凭证，用于客户端直接调用阿里云API
 */
class AliyunSTSService {
  private client: Core;
  private roleArn: string;
  private sessionName: string;
  private durationSeconds: number;
  
  constructor() {
    // 获取配置
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || '';
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
    this.roleArn = process.env.ALIYUN_RAM_ROLE_ARN || '';
    this.sessionName = process.env.ALIYUN_RAM_SESSION_NAME || 'speech-app-session';
    this.durationSeconds = parseInt(process.env.ALIYUN_STS_DURATION_SECONDS || '3600', 10);
    
    // 验证必要配置
    if (!accessKeyId || !accessKeySecret || !this.roleArn) {
      throw new Error('阿里云STS配置不完整，请检查环境变量设置');
    }
    
    // 创建STS客户端
    this.client = new Core({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
      endpoint: 'https://sts.aliyuncs.com',
      apiVersion: '2015-04-01'
    });
    
    console.log('阿里云STS服务初始化完成');
  }
  
  /**
   * 生成临时访问凭证
   * @param customSessionName 可选的自定义会话名称，用于区分不同客户端
   * @returns 临时访问凭证对象
   */
  public async generateTemporaryCredentials(customSessionName?: string): Promise<STSCredentials> {
    try {
      console.log('开始生成阿里云临时访问凭证...');
      
      // 生成唯一的会话名称
      const sessionName = customSessionName || this.sessionName;
      const uniqueSessionName = `${sessionName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // 请求参数
      const params = {
        RoleArn: this.roleArn,
        RoleSessionName: uniqueSessionName,
        DurationSeconds: this.durationSeconds
      };
      
      // 发送请求
      console.log('调用阿里云STS服务...');
      const result = await this.client.request('AssumeRole', params, {
        method: 'POST',
        formatParams: true,
        timeout: 10000
      }) as AssumeRoleResponse;
      
      console.log('STS服务响应:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
      
      // 验证响应
      if (!result || !result.Credentials) {
        throw new Error('生成临时访问凭证失败：响应格式错误');
      }
      
      const credentials = result.Credentials;
      
      console.log('生成临时访问凭证成功，过期时间:', credentials.Expiration);
      
      return {
        accessKeyId: credentials.AccessKeyId,
        accessKeySecret: credentials.AccessKeySecret,
        securityToken: credentials.SecurityToken,
        expiration: credentials.Expiration
      };
    } catch (error) {
      console.error('生成临时访问凭证失败:', error);
      throw new Error(`生成临时访问凭证失败: ${(error as Error).message}`);
    }
  }
}

// 导出单例实例
export default new AliyunSTSService(); 