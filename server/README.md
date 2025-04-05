# 语音合成后端服务

这是一个提供阿里云语音合成服务的 Express 后端 API。

## 功能

- 提供阿里云语音合成（TTS）API
- 使用 RAM 角色安全访问阿里云服务
- 支持环境变量配置
- TypeScript 支持

## 安装

```bash
# 使用 yarn 安装依赖
yarn install
```

## 配置

1. 复制 `.env.example` 到 `.env`
2. 在 `.env` 中填写你的阿里云访问密钥和应用配置

```
ALIYUN_ACCESS_KEY_ID=你的访问密钥ID
ALIYUN_ACCESS_KEY_SECRET=你的访问密钥Secret
ALIYUN_TTS_APP_KEY=你的语音合成AppKey
```

## 运行

```bash
# 开发模式
yarn dev

# 生产模式
yarn build
yarn start
```

## API 接口

### 文本转语音

- **URL**: `/api/tts/synthesize`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "text": "要转换为语音的文本内容",
    "options": {
      "format": "mp3",
      "sampleRate": 16000,
      "voice": "xiaoyun",
      "volume": 50,
      "speed": 0,
      "pitch": 0
    }
  }
  ```
- **响应**: 返回 MP3 格式的音频文件 