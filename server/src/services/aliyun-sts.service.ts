import dotenv from 'dotenv';
// @ts-ignore
import STS20150401, { AssumeRoleRequest } from '@alicloud/sts-sdk';
// @ts-ignore
import * as OpenApi from '@alicloud/openapi-client';
// @ts-ignore
import * as Util from '@alicloud/tea-util';

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
 * 阿里云STS服务类
 * 负责生成临时访问凭证，用于客户端直接调用阿里云API
 */
class AliyunSTSService {
  private client: any; // 使用any类型避免类型错误
  private roleArn: string;
  private sessionName: string;
  private durationSeconds: number;
  
  constructor() {
    // 获取配置
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || '';
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
    const endpoint = process.env.ALIYUN_STS_ENDPOINT || 'sts.cn-shanghai.aliyuncs.com';
    this.roleArn = process.env.ALIYUN_RAM_ROLE_ARN || '';
    this.sessionName = process.env.ALIYUN_RAM_SESSION_NAME || 'speech-app-session';
    this.durationSeconds = parseInt(process.env.ALIYUN_STS_DURATION_SECONDS || '3600', 10);
    
    // 验证必要配置
    if (!accessKeyId || !accessKeySecret || !this.roleArn) {
      throw new Error('阿里云STS配置不完整，请检查环境变量设置');
    }
    
    // 创建STS客户端配置
    const config: any = {
      accessKeyId,
      accessKeySecret,
      endpoint
    };
    
    this.client = new STS20150401(config);
    
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
      
      // 构建请求
      const sessionName = customSessionName || this.sessionName;
      
      // 添加会话唯一标识
      const uniqueSessionName = `${sessionName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const assumeRoleRequest = new AssumeRoleRequest({
        roleArn: this.roleArn,
        roleSessionName: uniqueSessionName,
        durationSeconds: this.durationSeconds
      });
      
      // 设置运行选项
      const runtime = new Util.RuntimeOptions({});
      
      // 发送请求
      const response = await this.client.assumeRoleWithOptions(assumeRoleRequest, runtime);
      
      // 验证响应
      if (!response.body?.credentials) {
        throw new Error('生成临时访问凭证失败：响应格式错误');
      }
      
      const credentials = response.body.credentials;
      
      console.log('生成临时访问凭证成功，过期时间:', credentials.expiration);
      
      return {
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.securityToken,
        expiration: credentials.expiration
      };
    } catch (error) {
      console.error('生成临时访问凭证失败:', error);
      throw new Error(`生成临时访问凭证失败: ${(error as Error).message}`);
    }
  }
}

// 导出单例实例
export default new AliyunSTSService(); 