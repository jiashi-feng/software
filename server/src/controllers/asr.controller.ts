import { Request, Response } from 'express';
import baiduService from '../services/baidu.service';

/**
 * 语音识别控制器
 */
class ASRController {
  /**
   * 将语音转换为文本
   * @param req 请求对象
   * @param res 响应对象
   */
  public async speechToText(req: Request, res: Response): Promise<void> {
    try {
      const { audio, format, rate } = req.body;

      // 验证音频参数
      if (!audio || typeof audio !== 'string') {
        res.status(400).json({ success: false, message: '无效的音频数据' });
        return;
      }

      // 调用百度服务进行语音识别
      const text = await baiduService.speechToText(audio, format, rate);

      // 返回识别结果
      res.json({ 
        success: true, 
        text 
      });
    } catch (error) {
      console.error('语音识别错误:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '语音识别失败' 
      });
    }
  }
}

export default new ASRController(); 