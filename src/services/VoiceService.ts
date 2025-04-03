import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * 语音识别结果回调
 */
type SpeechRecognitionCallback = (text: string) => void;

/**
 * 语音识别错误回调
 */
type SpeechErrorCallback = (error: string) => void;

/**
 * 语音服务状态
 */
interface VoiceServiceState {
  isListening: boolean;
  isSpeaking: boolean;
  hasPermission: boolean;
  isInitialized: boolean;
}

/**
 * 语音服务，提供语音识别和语音合成功能
 */
class VoiceServiceClass {
  private state: VoiceServiceState = {
    isListening: false,
    isSpeaking: false,
    hasPermission: false,
    isInitialized: false,
  };

  // 添加 voice 实例变量
  private voice: typeof Voice | null = null;
  
  // 添加回调属性声明
  private onSpeechResultsCallback: SpeechRecognitionCallback | null = null;
  private onSpeechErrorCallback: SpeechErrorCallback | null = null;
  private onSpeakStartCallback: (() => void) | null = null;
  private onSpeakEndCallback: (() => void) | null = null;

  constructor() {
    // 延迟初始化，确保 Voice 模块完全加载
    setTimeout(() => {
      this.init().catch(error => {
        console.error('Failed to initialize voice service:', error);
      });
    }, 500);
  }

  private async init() {
    try {
      // 检查并初始化 Voice
      if (!this.voice) {
        try {
          this.voice = Voice;
          console.log('Voice module loaded:', !!this.voice);
        } catch (err) {
          console.error('Failed to load Voice module:', err);
          return false;
        }
      }

      if (!this.voice) {
        console.error('Voice module is not available');
        return false;
      }

      // 初始化语音识别
      this.voice.onSpeechStart = this.handleSpeechStart;
      this.voice.onSpeechEnd = this.handleSpeechEnd;
      this.voice.onSpeechResults = this.handleSpeechResults;
      this.voice.onSpeechError = this.handleSpeechError;
      
      // 检查权限
      this.state.hasPermission = await this.checkPermission();
      
      if (!this.state.hasPermission) {
        console.error('No microphone permission granted');
        throw new Error('没有麦克风权限');
      }
      
      // 初始化TTS
      try {
        // 等待TTS初始化完成
        await new Promise<void>((resolve, reject) => {
          const checkTTS = async () => {
            try {
              await Tts.getInitStatus();
              resolve();
            } catch (err) {
              console.warn('TTS not ready yet, retrying...');
              setTimeout(checkTTS, 500);
            }
          };
          
          // 开始检查
          checkTTS();
          
          // 10秒后超时
          setTimeout(() => {
            reject(new Error('TTS初始化超时'));
          }, 10000);
        });
        
        // 配置TTS
        await Tts.setDefaultLanguage('zh-CN');
        await Tts.setDefaultRate(0.5);
        await Tts.setDefaultPitch(1.0);
        
        // 设置事件监听器
        Tts.addEventListener('tts-start', this.handleSpeakStart);
        Tts.addEventListener('tts-finish', this.handleSpeakEnd);
        Tts.addEventListener('tts-error', this.handleSpeakError);
        
        console.log('TTS initialized successfully');
      } catch (err) {
        console.error('TTS initialization failed:', err);
        throw new Error('语音合成初始化失败');
      }

      // 标记初始化完成
      this.state.isInitialized = true;
      console.log('VoiceService initialized successfully');
      return true;
    } catch (err) {
      console.error('Voice service initialization failed:', err);
      this.state.isInitialized = false;
      if (this.onSpeechErrorCallback) {
        const errorMessage = err instanceof Error ? err.message : '语音服务初始化失败';
        this.onSpeechErrorCallback(errorMessage);
      }
      return false;
    }
  }

  /**
   * 确保服务已初始化
   */
  private async ensureInitialized() {
    if (!this.state.isInitialized) {
      try {
        await this.init();
      } catch (err) {
        console.error('Failed to initialize voice service:', err);
        throw new Error('语音服务未能初始化');
      }
    }
    return this.state.isInitialized;
  }
  
  /**
   * 设置语音识别结果回调
   * @param callback 回调函数
   */
  public setOnSpeechResults(callback: SpeechRecognitionCallback) {
    this.onSpeechResultsCallback = callback;
  }
  
  /**
   * 设置语音识别错误回调
   * @param callback 回调函数
   */
  public setOnSpeechError(callback: SpeechErrorCallback) {
    this.onSpeechErrorCallback = callback;
  }
  
  /**
   * 设置语音合成开始回调
   * @param callback 回调函数
   */
  public setOnSpeakStart(callback: () => void) {
    this.onSpeakStartCallback = callback;
  }
  
  /**
   * 设置语音合成结束回调
   * @param callback 回调函数
   */
  public setOnSpeakEnd(callback: () => void) {
    this.onSpeakEndCallback = callback;
  }
  
  /**
   * 检查麦克风权限
   */
  private async checkPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '需要麦克风权限',
            message: '要使用语音功能，应用需要访问您的麦克风',
            buttonPositive: '确定',
            buttonNegative: '取消',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return true;
  }
  
  /**
   * 处理语音识别开始
   */
  private handleSpeechStart = () => {
    this.state.isListening = true;
  };
  
  /**
   * 处理语音识别结束
   */
  private handleSpeechEnd = () => {
    this.state.isListening = false;
  };
  
  /**
   * 处理语音识别结果
   * @param e 语音识别结果事件
   */
  private handleSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      if (this.onSpeechResultsCallback) {
        this.onSpeechResultsCallback(recognizedText);
      }
    }
  };
  
  /**
   * 处理语音识别错误
   * @param e 语音识别错误事件
   */
  private handleSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech recognition error:', e);
    if (this.onSpeechErrorCallback) {
      this.onSpeechErrorCallback(e.error?.message || 'Unknown error');
    }
  };
  
  /**
   * 处理语音合成开始
   */
  private handleSpeakStart = () => {
    this.state.isSpeaking = true;
    if (this.onSpeakStartCallback) {
      this.onSpeakStartCallback();
    }
  };
  
  /**
   * 处理语音合成结束
   */
  private handleSpeakEnd = () => {
    this.state.isSpeaking = false;
    if (this.onSpeakEndCallback) {
      this.onSpeakEndCallback();
    }
  };
  
  /**
   * 处理语音合成错误
   */
  // 修改错误处理方法
  private handleSpeakError = (error: any) => {
    const errorMessage = error?.message || JSON.stringify(error);
    console.error('TTS error:', errorMessage);
    
    // 尝试重新初始化 TTS
    this.state.isSpeaking = false;
    this.state.isInitialized = false;
    
    // 延迟重新初始化
    setTimeout(() => {
      this.init().catch(initError => {
        console.error('Failed to reinitialize TTS:', initError);
      });
    }, 1000);
  
    if (this.onSpeakEndCallback) {
      this.onSpeakEndCallback();
    }
  };
  
  /**
   * 获取当前状态
   */
  public getState(): VoiceServiceState {
    return { ...this.state };
  }
  
  /**
   * 开始语音识别
   */
  public async startListening() {
    try {
      console.log('Starting speech recognition...');
      // 确保服务已初始化
      const isReady = await this.ensureInitialized();
      if (!isReady || !this.voice) {
        console.error('Voice service initialization failed');
        throw new Error('语音服务初始化失败');
      }
      
      // 检查权限
      if (!this.state.hasPermission) {
        this.state.hasPermission = await this.checkPermission();
        if (!this.state.hasPermission) {
          throw new Error('没有麦克风权限');
        }
      }
      
      // 如果已经在监听，先停止
      if (this.state.isListening) {
        try {
          await this.stopListening();
          // 短暂等待确保上一次监听完全结束
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.warn('Error stopping previous listening session:', e);
        }
      }
      
      // 开始语音识别
      console.log('Calling Voice.start()...');
      await this.voice.start('zh-CN');
      this.state.isListening = true;
      console.log('Voice.start() completed successfully');
    } catch (e) {
      console.error('Start listening error:', e);
      const errorMessage = e instanceof Error ? e.message : '语音识别启动失败';
      if (this.onSpeechErrorCallback) {
        this.onSpeechErrorCallback(errorMessage);
      }
      throw e;
    }
  }
  
  /**
   * 停止语音识别
   */
  public async stopListening() {
    try {
      if (!this.voice) {
        throw new Error('语音识别组件不可用');
      }
      
      // 只有正在监听时才停止
      if (this.state.isListening) {
        await this.voice.stop();
      }
    } catch (e) {
      console.error('Stop listening error:', e);
      const errorMessage = e instanceof Error ? e.message : '语音识别停止失败';
      if (this.onSpeechErrorCallback) {
        this.onSpeechErrorCallback(errorMessage);
      }
    }
  }
  
  /**
   * 取消语音识别
   */
  public async cancelListening() {
    try {
      // 检查 Voice 对象
      if (!this.voice) {
        throw new Error('语音识别组件不可用');
      }
      
      await this.voice.cancel();
    } catch (e) {
      console.error('Cancel listening error:', e);
    }
  }
  
  /**
   * 文字转语音
   * @param text 要播放的文本
   */
  public async speak(text: string) {
    try {
      // 确保服务已初始化
      await this.ensureInitialized();
      
      // 如果当前正在说话，先停止
      if (this.state.isSpeaking) {
        await this.stopSpeaking();
      }
      
      // 分段处理长文本
      const segments = text.match(/[^。！？.!?]+[。！？.!?]?/g) || [text];
      
      for (const segment of segments) {
        if (segment.trim()) {
          await Tts.speak(segment.trim());
          
          // 等待一小段时间再说下一句
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.error('Speak error:', error);
      this.handleSpeakError(error);
    }
  }
  
  /**
   * 停止语音合成
   */
  public async stopSpeaking() {
    try {
      await Tts.stop();
    } catch (e) {
      console.error('Stop speaking error:', e);
    }
  }
  
  /**
   * 销毁语音服务
   */
  public async destroy() {
    try {
      // 停止语音识别
      if (this.state.isListening) {
        await this.stopListening();
      }
      
      // 停止语音合成
      if (this.state.isSpeaking) {
        await this.stopSpeaking();
      }
      
      // 移除所有监听器
      if (this.voice) {
        await this.voice.destroy();
        this.voice.removeAllListeners();
        this.voice = null;
      }
      
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
      
      // 重置状态
      this.state.isInitialized = false;
    } catch (e) {
      console.error('Destroy voice service error:', e);
    }
  }
}

// 创建单例实例
export const VoiceService = new VoiceServiceClass();

export default VoiceService;