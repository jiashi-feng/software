# 语音服务后端

这是勤云小筑家务管理应用的后端服务，提供语音识别和语音合成API。

## 功能

- **百度语音识别 (ASR)** - 将语音转换为文本
- **阿里云语音合成 (TTS)** - 将文本转换为语音
- **阿里云STS令牌服务** - 提供临时安全凭证

## 安装与配置

### 安装依赖

```bash
# 使用 yarn 安装依赖
yarn install

# 或使用 npm
npm install
```

### 环境变量配置

1. 复制 `.env.example` 到 `.env`
2. 在 `.env` 中填写你的配置信息：

```
# 服务器配置
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# 阿里云访问配置
ALIYUN_ACCESS_KEY_ID=你的阿里云AccessKey
ALIYUN_ACCESS_KEY_SECRET=你的阿里云AccessKey密钥
ALIYUN_REGION=cn-shanghai
ALIYUN_ENDPOINT=nls-meta.cn-shanghai.aliyuncs.com

# 阿里云语音合成配置
ALIYUN_TTS_APP_KEY=你的语音应用AppKey
ALIYUN_TTS_API_VERSION=2023-11-01
ALIYUN_TTS_HTTP_ENDPOINT=nls-gateway-cn-shanghai.aliyuncs.com

# 百度语音云配置
BAIDU_API_KEY=你的百度语音API Key
BAIDU_SECRET_KEY=你的百度语音Secret Key
BAIDU_CUID=speechapp
```

### 获取百度语音API密钥

1. 访问 [百度智能云](https://cloud.baidu.com/) 并注册/登录
2. 创建语音技术应用，获取API Key和Secret Key
3. 确保应用开通了"短语音识别"服务权限

### 获取阿里云API密钥

1. 访问 [阿里云控制台](https://console.aliyun.com/) 并注册/登录
2. 创建AccessKey，记录AccessKey ID和Secret
3. 开通智能语音交互服务，并创建项目获取AppKey

## 运行

```bash
# 开发模式
yarn dev

# 生产模式
yarn build
yarn start
```

## API 接口

### 1. 语音识别 (ASR)

将语音数据转换为文本。

- **URL**: `/api/asr/recognize`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "audio": "Base64编码的音频数据",
    "format": "wav",    // 可选，默认wav
    "rate": 16000,      // 可选，默认16000Hz
    "dev_pid": 1537,    // 可选，默认1537(普通话，含标点)
    "channel": 1        // 可选，默认1(单声道)
  }
  ```
- **响应**:
  ```json
  {
    "err_no": 0,
    "err_msg": "success.",
    "corpus_no": "15984125203285346378",
    "sn": "481D633F-73BA-726F-49EF-8659ACCC2F3D",
    "result": ["识别出的文本"]
  }
  ```

### 2. 语音合成 (TTS)

将文本转换为语音。

- **URL**: `/api/tts/synthesize`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "text": "要转换为语音的文本内容",
    "options": {
      "format": "mp3",       // 可选，默认mp3
      "voice": "xiaoyun",    // 可选，默认xiaoyun
      "sample_rate": 16000,  // 可选，默认16000Hz
      "volume": 50,          // 可选，默认50
      "speech_rate": 0,      // 可选，默认0
      "pitch_rate": 0        // 可选，默认0
    }
  }
  ```
- **响应**: 返回音频文件

### 3. 安全令牌 (STS)

获取阿里云临时访问凭证。

- **URL**: `/api/sts/token`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "sessionName": "custom-session-name",  // 可选
    "clientInfo": "device-id"              // 可选
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "accessKeyId": "STS.xxx",
      "accessKeySecret": "xxx",
      "securityToken": "xxx",
      "expiration": "2023-04-10T12:00:00Z",
      "region": "cn-shanghai",
      "ttsEndpoint": "nls-gateway-cn-shanghai.aliyuncs.com",
      "ttsApiVersion": "2023-11-01",
      "appKey": "xxx"
    }
  }
  ```

## 目录结构

```
src/
├── controllers/           # API控制器
│   ├── asr.controller.ts  # 语音识别控制器
│   ├── tts.controller.ts  # 语音合成控制器
│   └── sts.controller.ts  # 安全令牌控制器
├── routes/                # API路由
│   ├── asr.routes.ts      # 语音识别路由
│   ├── tts.routes.ts      # 语音合成路由
│   └── sts.routes.ts      # 安全令牌路由
├── services/              # 业务逻辑服务
│   ├── baidu-asr.service.ts     # 百度语音识别服务
│   ├── baidu-voice.service.ts   # 百度语音访问令牌服务
│   ├── aliyun.service.ts        # 阿里云访问服务
│   ├── aliyun-tts.service.ts    # 阿里云语音合成服务
│   └── aliyun-sts.service.ts    # 阿里云安全令牌服务
└── index.ts               # 服务器入口
```

## 调试帮助

- 访问 `/health` 端点检查服务器状态
- 访问 `/debug/token` 端点测试阿里云令牌获取 