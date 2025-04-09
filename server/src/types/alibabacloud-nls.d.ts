declare module 'alibabacloud-nls' {
  interface SpeechSynthesizerConfig {
    url: string;
    appkey: string;
    token: string;
  }

  interface SpeechSynthesizerParams {
    text: string;
    voice?: string;
    format?: string;
    sample_rate?: number;
    volume?: number;
    speech_rate?: number;
    pitch_rate?: number;
    enable_subtitle?: boolean;
  }

  type EventHandler = (data: any) => void;

  class SpeechSynthesizer {
    constructor(config: SpeechSynthesizerConfig);
    
    defaultStartParams(): SpeechSynthesizerParams;
    
    on(event: 'meta' | 'data' | 'completed' | 'closed' | 'failed', handler: EventHandler): void;
    
    start(param: SpeechSynthesizerParams, enablePing?: boolean, pingInterval?: number): Promise<void>;
  }

  export { SpeechSynthesizer };
} 