import { Request, Response } from 'express';
import aliyunSTSService from '../services/aliyun-sts.service';

/**
 * 阿里云STS临时访问凭证控制器
 */
class STSController {
  /**
   * 获取临时访问凭证
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getTemporaryCredentials(req: Request, res: Response): Promise<void> {
    try {
      console.log('收到获取临时访问凭证请求');
      
      // 可以从请求中获取自定义会话名称（可选，用于区分不同客户端）
      const { sessionName, clientInfo } = req.body;
      
      // 生成临时访问凭证
      const credentials = await aliyunSTSService.generateTemporaryCredentials(
        sessionName || `mobile-client-${clientInfo || 'unknown'}`
      );
      
      // 返回凭证信息以及其他必要的配置信息
      res.json({
        success: true,
        data: {
          ...credentials,
          // 发送其他必要的配置信息
          region: process.env.ALIYUN_REGION || 'cn-shanghai',
          ttsEndpoint: process.env.ALIYUN_TTS_HTTP_ENDPOINT || 'nls-speech.cn-shanghai.aliyuncs.com',
          ttsApiVersion: process.env.ALIYUN_TTS_API_VERSION || '2023-11-01',
          appKey: process.env.ALIYUN_TTS_APP_KEY || ''
        }
      });
      
      console.log('临时访问凭证已发送');
    } catch (error) {
      console.error('获取临时访问凭证错误:', error);
      console.error('错误详情:', error instanceof Error ? error.stack : '未知错误');
      
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '获取临时访问凭证失败',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      });
    }
  }
}

export default new STSController(); 