import { Request, Response } from 'express';
import aliyunService from '../services/aliyun.service';
import aliyunTTSService, { TTSOptions } from '../services/aliyun-tts.service';

/**
 * TTS控制器类
 * 处理语音合成相关的请求
 */
class TTSController {
  /**
   * 合成语音
   * @param req 请求对象，包含要合成的文本和选项
   * @param res 响应对象
   */
  public async synthesize(req: Request, res: Response): Promise<void> {
    try {
      console.log('收到语音合成请求');
      
      // 检查请求体是否包含文本
      const { text, options } = req.body;
      
      if (!text) {
        res.status(400).json({ success: false, message: '缺少必需的文本参数' });
        return;
      }
      
      // 如果文本太长，拒绝请求
      if (text.length > 300) {
        res.status(400).json({ 
          success: false, 
          message: '文本过长，文本长度不能超过300个字符'
        });
        return;
      }
      
      console.log('准备合成文本:', text);
      
      // 确保令牌有效
      if (!aliyunTTSService.isTokenValid()) {
        console.log('令牌无效或已过期，尝试获取新令牌');
        const token = await aliyunService.getToken();
        console.log('成功获取新令牌:', token.substring(0, 10) + '...');
      }
      
      // 合成音频
      const ttsOptions: TTSOptions = {
        text,
        format: options?.format || 'mp3',
        voice: options?.voice || 'xiaoyun',
        sample_rate: options?.sampleRate || options?.sample_rate || 16000,
        volume: options?.volume || 50,
        speech_rate: options?.speed || options?.speech_rate || 0,
        pitch_rate: options?.pitch || options?.pitch_rate || 0
      };
      
      console.log('开始语音合成，参数:', ttsOptions);
      
      const audioData = await aliyunTTSService.synthesize(ttsOptions);
      
      console.log(`语音合成成功，生成 ${audioData.length} 字节的音频数据`);
      
      // 设置响应类型
      const contentType = ttsOptions.format === 'wav' ? 'audio/wav' : 'audio/mpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', audioData.length);
      
      // 发送音频数据
      res.send(audioData);
      
    } catch (error) {
      console.error('语音合成错误:', error);
      
      // 根据错误类型设置状态码
      const isClientError = error instanceof Error && 
        (error.message.includes('token') || error.message.includes('文本'));
      
      const statusCode = isClientError ? 400 : 500;
      
      res.status(statusCode).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '语音合成失败'
      });
    }
  }
}

export default new TTSController(); 