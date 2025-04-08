declare module 'react-native-recording' {
  interface RecordingConfig {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    audioSource: number;
    outputFormat: number;
  }

  interface Recording {
    init(config: RecordingConfig): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<string>;
    play(filePath: string): Promise<void>;
  }

  const recording: Recording;
  export default recording;
} 