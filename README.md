# 勤云小筑家务管理 App

![React Native](https://img.shields.io/badge/React%20Native-0.78.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

勤云小筑是一款家庭任务智能管理应用，帮助家庭成员协作完成家务任务，提高家庭生活质量和沟通效率。

## 📱 功能特点

- 👨‍👩‍👧‍👦 创建和加入家庭群组
- ✅ 家务任务分配与追踪
- 🌟 积分奖励系统与积分商城
- 💬 家庭成员实时聊天
- 🏆 成就系统与排行榜
- 🎯 个性化设置
- 🤖 AI 助理（支持语音交互）
- 📅 社区联动服务

## 🔧 技术栈

### 前端
- React Native 0.78.0
- React Navigation 7.x
- React Native Paper
- Redux Toolkit
- React Native Vector Icons
- React Native Reanimated
- React Native Gesture Handler
- React Native Recording (语音录制与播放)

### 后端
- Node.js/Express.js
- TypeScript
- 阿里云语音合成服务 (TTS)
- 百度语音识别服务 (ASR)
- 阿里云访问控制 (RAM/STS)

## 📂 项目结构

```
├── src/                    # 客户端代码
│   ├── assets/             # 图片和静态资源
│   ├── components/         # 可复用组件
│   ├── navigation/         # 导航配置
│   ├── styles/             # 全局样式和主题
│   ├── services/           # API服务
│   │   ├── AliyunClientVoiceService.ts  # 阿里云语音合成客户端服务
│   │   ├── MixedVoiceService.ts         # 混合语音服务(录音与识别)
│   │   └── TaskService.ts               # 任务服务
│   ├── store/              # Redux状态管理
│   └── [各页面组件].jsx    # 主要页面组件
│
├── server/                 # 服务器端代码
│   ├── src/
│   │   ├── controllers/    # API控制器
│   │   │   ├── asr.controller.ts   # 语音识别控制器
│   │   │   ├── tts.controller.ts   # 语音合成控制器
│   │   │   └── sts.controller.ts   # 安全令牌控制器
│   │   ├── routes/         # API路由
│   │   ├── services/       # 业务逻辑服务
│   │   │   ├── baidu-asr.service.ts    # 百度语音识别服务
│   │   │   ├── baidu-voice.service.ts  # 百度语音访问令牌服务
│   │   │   ├── aliyun.service.ts       # 阿里云访问服务
│   │   │   ├── aliyun-tts.service.ts   # 阿里云语音合成服务
│   │   │   └── aliyun-sts.service.ts   # 阿里云安全令牌服务
│   │   └── index.ts        # 服务器入口
│   ├── .env                # 环境变量配置
│   └── package.json        # 服务器依赖
│
├── screenshots/            # 应用截图
├── android/                # Android原生代码
├── ios/                    # iOS原生代码
└── package.json            # 客户端依赖
```

## 🚀 开始使用

### 前提条件

- Node.js 18+
- Android Studio（Android开发）
- Xcode（iOS开发，仅macOS）
- JDK 11
- Yarn 或 npm
- 阿里云账号（用于语音合成）
- 百度智能云账号（用于语音识别）

### 环境变量配置

1. 服务器端配置 (server/.env)
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

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/jiashi-feng/software.git
cd software
```

2. 安装客户端依赖
```bash
yarn install
# 或
npm install
```

3. 安装服务器依赖
```bash
cd server
yarn install
# 或
npm install
cd ..
```

4. 配置环境变量
   - 复制 `server/.env.example` 到 `server/.env`
   - 填写你的阿里云和百度云API密钥

5. 启动服务器
```bash
cd server
yarn dev
# 或
npm run dev
```

6. 启动应用（在另一个终端）
```bash
# Android
yarn android
# 或
npm run android

# iOS (仅macOS)
yarn ios
# 或
npm run ios
```

## 📱 语音交互功能

本应用集成了语音识别和语音合成功能，支持用户通过语音与AI助手交互：

### 语音录制
- 使用 React Native Recording 实现高质量音频录制
- 支持自动音频格式转换和编码
- 提供录音实时反馈和可视化波形

### 语音识别 (Speech-to-Text)
- 使用百度智能云的语音识别API
- 支持中文普通话识别
- 适用于AI助手的用户语音输入

### 语音合成 (Text-to-Speech)
- 使用阿里云的语音合成服务
- 支持多种音色选择
- 适用于AI助手回复的语音播报

### 服务器API接口

#### 语音识别
- **URL**: `/api/asr/recognize`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "audio": "Base64编码的音频数据",
    "format": "wav",
    "rate": 16000,
    "dev_pid": 1537,
    "channel": 1
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

#### 语音合成
- **URL**: `/api/tts/synthesize`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "text": "要转换为语音的文本内容",
    "options": {
      "format": "mp3",
      "voice": "xiaoyun",
      "sample_rate": 16000,
      "volume": 50,
      "speech_rate": 0,
      "pitch_rate": 0
    }
  }
  ```
- **响应**: 返回音频文件

## 📱 应用界面

应用特色界面展示：

| 登录页面 | 主页 | 任务详情 |
|:---:|:---:|:---:|:---:|
| ![登录页面](./screenshots/login.png) | ![主页](./screenshots/home.png) | ![社区服务](./screenshots/commnuity.png) |

## 🤝 如何贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

提交代码前请确保：
- 运行 `yarn lint` 检查代码风格
- 确保所有测试通过
- 更新相关文档

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件

## 📝 待办事项

- [ ] 增强AI助手功能
- [ ] 添加任务提醒通知
- [ ] 优化动画效果
- [ ] 增加家庭统计分析
- [ ] 支持更多多语言
- [ ] 完善语音识别容错机制
- [ ] 优化语音合成质量
- [ ] 添加更多音色选项

## 📞 联系我们

有任何问题或建议，欢迎通过以下方式联系我们：

- 邮箱: 259344725@qq.com

祝您使用愉快！
