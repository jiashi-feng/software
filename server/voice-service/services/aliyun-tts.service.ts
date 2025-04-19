import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { SpeechSynthesizer } from 'alibabacloud-nls';

// 加载环境变量
dotenv.config();

// 确保临时目录存在
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * 语音合成参数接口
 */
export interface TTSOptions {
  text: string;
  format?: string;
  voice?: string;
  sample_rate?: number;
  volume?: number;
  speech_rate?: number;
  pitch_rate?: number;
  enable_subtitle?: boolean;
}

/**
 * 阿里云语音合成服务类
 */
class AliyunTTSService {
  private appKey: string;
  private token: string | null = null;
  private tokenExpireTime: number = 0;
  private url: string;

  constructor() {
    this.appKey = process.env.ALIYUN_TTS_APP_KEY || '';
    this.url = `wss://${process.env.ALIYUN_TTS_HTTP_ENDPOINT || 'nls-gateway.cn-shanghai.aliyuncs.com'}/ws/v1`;

    if (!this.appKey) {
      throw new Error('阿里云TTS AppKey未配置');
    }

    console.log('阿里云TTS服务初始化完成');
  }

  /**
   * 设置访问令牌
   * @param token 访问令牌
   * @param expireTime 过期时间戳（毫秒）
   */
  public setToken(token: string, expireTime: number): void {
    this.token = token;
    this.tokenExpireTime = expireTime;
  }

  /**
   * 检查令牌是否有效
   */
  public isTokenValid(): boolean {
    return !!this.token && Date.now() < this.tokenExpireTime;
  }

  /**
   * 语音合成方法
   * @param options 语音合成选项
   * @returns 合成音频的Buffer
   */
  public async synthesize(options: TTSOptions): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        console.log('开始语音合成...');
        
        if (!this.isTokenValid()) {
          reject(new Error('访问令牌无效或已过期'));
          return;
        }

        // 生成唯一的临时文件名
        const tempFilePath = path.join(tempDir, `tts_${Date.now()}.${options.format || 'mp3'}`);
        
        // 创建文件写入流
        const fileStream = fs.createWriteStream(tempFilePath);
        
        // 创建语音合成实例
        const tts = new SpeechSynthesizer({
          url: this.url,
          appkey: this.appKey,
          token: this.token!
        });

        // 设置合成参数
        const params = {
          text: options.text,
          voice: options.voice || 'xiaoyun',
          format: options.format || 'mp3',
          sample_rate: options.sample_rate || 16000,
          volume: options.volume || 50,
          speech_rate: options.speech_rate || 0,
          pitch_rate: options.pitch_rate || 0,
          enable_subtitle: options.enable_subtitle || false
        };

        console.log('语音合成参数:', params);

        // 设置事件处理器
        tts.on('meta', (msg: any) => {
          console.log('接收到元信息:', msg);
        });

        tts.on('data', (data: any) => {
          console.log(`接收到音频数据: ${data.length} 字节`);
          fileStream.write(data, 'binary');
        });

        tts.on('completed', async (msg: any) => {
          console.log('语音合成完成:', msg);
          fileStream.end();
          
          // 等待文件写入完成
          await new Promise<void>((res) => fileStream.on('finish', res));
          
          // 读取文件内容并返回
          const data = await promisify(fs.readFile)(tempFilePath);
          
          // 删除临时文件
          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('删除临时文件失败:', err);
          });
          
          resolve(data);
        });

        tts.on('closed', () => {
          console.log('连接已关闭');
        });

        tts.on('failed', (msg: any) => {
          console.error('语音合成失败:', msg);
          fileStream.end();
          fs.unlink(tempFilePath, () => {});
          reject(new Error(`语音合成失败: ${msg}`));
        });

        // 开始合成
        tts.start(params, true, 6000)
          .catch((error: any) => {
            console.error('启动语音合成失败:', error);
            fileStream.end();
            fs.unlink(tempFilePath, () => {});
            reject(error);
          });
      } catch (error) {
        console.error('语音合成过程出错:', error);
        reject(error);
      }
    });
  }
}

// 导出单例实例
export default new AliyunTTSService(); 