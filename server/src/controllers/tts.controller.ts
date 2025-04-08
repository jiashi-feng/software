import { Request, Response } from 'express';
import aliyunService from '../services/aliyun.service';

/**
 * 文本转语音控制器
 */
class TTSController {
  /**
   * 将文本转换为语音
   * @param req 请求对象
   * @param res 响应对象
   */
  public async textToSpeech(req: Request, res: Response): Promise<void> {
    try {
      console.log('收到语音合成请求:', JSON.stringify(req.body));
      
      const { text, options = {} } = req.body;

      // 验证文本参数
      if (!text || typeof text !== 'string') {
        console.log('无效的文本参数:', text);
        res.status(400).json({ success: false, message: '无效的文本参数' });
        return;
      }

      // 限制文本长度（阿里云TTS有长度限制，通常为300个字符）
      if (text.length > 300) {
        console.log('文本长度超过限制:', text.length);
        res.status(400).json({ 
          success: false, 
          message: '文本长度超过限制（最大300个字符）' 
        });
        return;
      }
      
      // 验证区域参数
      if (options.region && typeof options.region === 'string') {
        const validRegions = ['shanghai', 'beijing', 'shenzhen'];
        if (!validRegions.includes(options.region)) {
          console.log('无效的区域参数:', options.region);
          // 使用默认区域，而不是返回错误
          options.region = process.env.ALIYUN_SERVICE_REGION || 'shanghai';
          console.log('使用默认区域:', options.region);
        }
      }

      console.log('开始调用阿里云服务进行语音合成...');
      // 调用阿里云服务进行文本转语音
      const audioBuffer = await aliyunService.textToSpeech(text, options);
      console.log('阿里云语音合成成功, 音频大小:', audioBuffer.length);

      // 设置响应头
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename=speech.mp3');
      
      // 发送音频数据
      res.send(audioBuffer);
      console.log('语音合成响应已发送');
    } catch (error) {
      console.error('文本转语音错误:', error);
      console.error('错误详情:', error instanceof Error ? error.stack : '未知错误');
      
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '文本转语音失败',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      });
    }
  }
}

export default new TTSController(); 