import { Request, Response } from 'express';
import baiduASRService from '../services/baidu-asr.service';

/**
 * 语音识别控制器类
 */
class ASRController {
  /**
   * 识别语音
   * @param req 请求对象
   * @param res 响应对象
   */
  public async recognize(req: Request, res: Response): Promise<void> {
    try {
      console.log('收到语音识别请求');
      
      // 检查请求体是否包含音频数据
      const { audio, format, rate, dev_pid, channel } = req.body;
      
      if (!audio) {
        res.status(400).json({ 
          err_no: 2000,
          err_msg: '缺少音频数据',
          sn: this.generateSN()
        });
        return;
      }
      
      // 检查音频数据格式
      if (typeof audio !== 'string') {
        res.status(400).json({ 
          err_no: 2001,
          err_msg: '音频数据必须是Base64编码的字符串',
          sn: this.generateSN()
        });
        return;
      }

      // 检查采样率是否有效
      if (rate && (!Number.isInteger(rate) || rate <= 0)) {
        res.status(400).json({
          err_no: 2002,
          err_msg: '采样率必须是正整数',
          sn: this.generateSN()
        });
        return;
      }
      
      console.log(`准备识别${format || 'wav'}格式的音频, 采样率: ${rate || 16000}Hz`);
      
      // 识别音频
      const recognizedText = await baiduASRService.recognize(audio, {
        format: format,
        rate: rate,
        dev_pid: dev_pid,
        channel: channel
      });
      
      console.log('语音识别完成, 结果:', recognizedText ? `"${recognizedText}"` : '无文本');
      
      // 生成唯一标识
      const sn = this.generateSN();
      
      // 返回识别结果，按照百度云文档格式
      res.json({
        err_no: 0,
        err_msg: 'success.',
        corpus_no: Date.now().toString(),
        sn: sn,
        result: recognizedText ? [recognizedText] : []
      });
      
    } catch (error) {
      console.error('语音识别处理失败:', error);
      
      // 获取错误消息
      const errorMessage = error instanceof Error ? error.message : '语音识别失败';
      
      // 确定错误代码
      let errorCode = 3000; // 默认服务器错误码
      
      if (errorMessage.includes('凭证未配置') || errorMessage.includes('无法获取百度访问令牌')) {
        errorCode = 3302; // 访问令牌相关错误
      } else if (errorMessage.includes('格式不正确') || errorMessage.includes('缺少音频数据')) {
        errorCode = 2003; // 请求格式错误
      }
      
      // 返回错误信息，按照百度云文档格式
      res.status(500).json({
        err_no: errorCode,
        err_msg: errorMessage,
        sn: this.generateSN()
      });
    }
  }
  
  /**
   * 生成唯一的请求标识
   * @returns 唯一标识字符串
   */
  private generateSN(): string {
    // 生成类似百度文档中的SN格式
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sn = '';
    
    // 生成类似 "481D633F-73BA-726F-49EF-8659ACCC2F3D" 的格式
    for (let i = 0; i < 4; i++) {
      const segment = Array.from({length: i === 0 ? 8 : 4}, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      sn += (i > 0 ? '-' : '') + segment;
    }
    
    return sn;
  }
}

export default new ASRController(); 