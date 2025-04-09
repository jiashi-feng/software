import dotenv from 'dotenv';
import axios from 'axios';
import baiduVoiceService from './baidu-voice.service';

// 加载环境变量
dotenv.config();

/**
 * 语音识别参数接口
 */
export interface ASROptions {
  format?: string;
  rate?: number;
  dev_pid?: number;
  channel?: number;
}

/**
 * 百度语音识别服务类
 */
class BaiduASRService {
  // 根据百度云文档，修改为HTTP协议而非HTTPS
  private apiUrl: string = 'http://vop.baidu.com/server_api';
  
  constructor() {
    console.log('百度语音识别服务初始化完成');
  }
  
  /**
   * 语音识别方法
   * @param audioData Base64编码的音频数据
   * @param options 识别选项
   * @returns 识别出的文本
   */
  public async recognize(audioData: string, options?: ASROptions): Promise<string> {
    try {
      console.log('开始语音识别...');
      
      // 获取访问令牌
      const accessToken = await baiduVoiceService.getAccessToken();
      
      if (!accessToken) {
        throw new Error('无法获取百度访问令牌');
      }
      
      // 确保音频数据是Base64格式
      if (!audioData.startsWith('data:audio') && !audioData.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/)) {
        throw new Error('音频数据格式不正确，需要提供Base64编码的数据');
      }
      
      // 如果音频数据包含data URI前缀，则去除
      const base64Data = audioData.includes('base64,') 
        ? audioData.split('base64,')[1] 
        : audioData;
      
      // 计算音频数据长度
      const audioLength = Buffer.from(base64Data, 'base64').length;
      
      // 请求参数
      const requestData = {
        format: options?.format || 'wav',
        rate: options?.rate || 16000,
        channel: options?.channel || 1,
        cuid: process.env.BAIDU_CUID || 'speechapp', // 用户唯一标识，可以是设备ID
        token: accessToken,
        dev_pid: options?.dev_pid || 1537, // 中文普通话(有标点)
        speech: base64Data, // Base64编码的语音数据
        len: audioLength // 语音数据长度
      };
      
      // 发送请求
      console.log(`发送语音识别请求到 ${this.apiUrl}，格式: ${requestData.format}, 采样率: ${requestData.rate}Hz, 音频长度: ${audioLength}字节`);
      const response = await axios({
        method: 'POST',
        url: this.apiUrl,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15秒超时
      });
      
      // 处理响应
      console.log('收到语音识别响应:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      if (!response.data) {
        throw new Error('语音识别服务返回空响应');
      }
      
      // 检查错误码
      if (response.data.err_no !== 0) {
        console.error('语音识别失败，错误码:', response.data.err_no, '错误描述:', response.data.err_msg);
        throw new Error(`语音识别失败: ${response.data.err_msg || '未知错误'}`);
      }
      
      // 提取识别结果
      if (response.data.result && response.data.result.length > 0) {
        const text = response.data.result[0];
        console.log('语音识别成功，结果:', text);
        return text;
      } else {
        console.log('语音识别成功，但没有识别出文本');
        return ''; // 没有识别到文本
      }
    } catch (error) {
      console.error('百度语音识别出错:', error);
      
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        console.error('百度API错误响应:', responseData);
        
        // 处理常见API错误
        if (responseData?.err_no) {
          const errorMsg = `百度语音识别API错误 (${responseData.err_no}): ${responseData.err_msg}`;
          throw new Error(errorMsg);
        }
      }
      
      throw new Error(error instanceof Error ? `语音识别失败: ${error.message}` : '语音识别失败');
    }
  }
}

// 导出单例实例
export default new BaiduASRService(); 