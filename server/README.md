# 整合后端服务

本项目包含两个后端服务，已整合到一起运行：

1. **任务分配系统** - 提供任务管理和分配功能
2. **语音服务** - 提供语音识别和语音合成功能

## 目录结构

```
server/
├── .env.example            # 环境变量示例文件
├── index.js                # 主入口文件(同时启动两个服务)
├── package.json            # 后端依赖配置
├── task-service/           # 任务分配系统服务
│   ├── server.js           # 任务服务入口
│   ├── controllers/        # API控制器
│   ├── middlewares/        # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # API路由
│   ├── services/           # 业务逻辑服务
│   ├── utils/              # 工具函数
│   └── seeds/              # 种子数据
│
└── voice-service/          # 语音服务
    ├── index.ts            # 语音服务入口
    ├── tsconfig.json       # TypeScript配置
    ├── controllers/        # API控制器
    ├── routes/             # API路由
    └── services/           # 业务逻辑服务
```

## 安装与配置

1. **安装依赖**

```bash
cd server
npm install
```

2. **环境变量配置**

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写所有必要的配置项：
- 任务分配系统配置（MongoDB连接、JWT密钥等）
- 语音服务配置（阿里云和百度云API密钥等）

## 启动服务

### 开发模式

同时启动两个服务：

```bash
npm run dev
```

单独启动服务：

```bash
npm run dev:task    # 只启动任务分配系统
npm run dev:voice   # 只启动语音服务
```

### 生产模式

构建并启动：

```bash
npm run build
npm start
```

## API接口

### 任务分配系统 API (端口5000)

**健康检查**
- URL: `http://localhost:5000/health`
- 方法: GET

**用户相关**
- 登录: POST `/api/users/login`
- 注册: POST `/api/users/register`
- 获取用户资料: GET `/api/users/profile`
- 更新用户资料: PUT `/api/users/profile`

**任务相关**
- 获取任务列表: GET `/api/tasks`
- 获取任务详情: GET `/api/tasks/:id`
- 创建任务: POST `/api/tasks`
- 更新任务: PUT `/api/tasks/:id`
- 删除任务: DELETE `/api/tasks/:id`

**任务分配相关**
- 获取分配列表: GET `/api/assignments`
- 分配任务: POST `/api/assignments`
- 完成任务: PUT `/api/assignments/:id/complete`

### 语音服务 API (端口3000)

**健康检查**
- URL: `http://localhost:3000/health`
- 方法: GET

**语音识别**
- 语音转文字: POST `/api/asr/recognize`

**语音合成**
- 文字转语音: POST `/api/tts/synthesize`

**安全令牌**
- 获取临时凭证: POST `/api/sts/credentials`

## 前端API调用

前端代码使用 `src/services/api.js` 统一管理API调用，已配置好根据不同设备环境自动选择正确的服务器地址。

示例用法：

```javascript
import api from '../services/api';

// 调用任务服务
const tasks = await api.task.getTasks();

// 调用语音服务
const speechText = await api.voice.speechToText(audioData);
```

## 文件移动指南

从原始项目结构移动到新结构的指南：

1. 将 `src/server.js` 移动到 `server/task-service/server.js`
2. 将 `src/controllers/`, `src/routes/`, `src/models/` 等后端目录移动到 `server/task-service/` 下
3. 将 `server/src/` 下的语音服务代码移动到 `server/voice-service/` 下

## 注意事项

- 两个服务使用不同的端口，互不干扰
- 在生产环境部署时，建议使用Nginx等反向代理将不同API路径指向不同服务 