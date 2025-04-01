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

- React Native 0.78.0
- React Navigation 7.x
- React Native Paper
- Redux Toolkit
- React Native Vector Icons
- React Native Reanimated
- React Native Gesture Handler
- React Native Voice
- .....

## 📂 项目结构

```
src/
├── assets/            # 图片和静态资源
├── components/        # 可复用组件
├── navigation/        # 导航配置
├── styles/            # 全局样式和主题
├── services/          # API服务
└── screens/           # 主要页面
    ├── Log_in.jsx     # 登录页面
    ├── Register.jsx   # 注册页面
    ├── Index.jsx      # 主页
    ├── Community.jsx  # 社区页面
    ├── shopping.jsx   # 积分商城
    ├── Setting.jsx    # 设置页面
    ├── Task_detail.jsx# 任务详情
    └── Ability_choice.jsx# 能力选择
    └── Achievement.jsx   # 成就界面
    └── AddCustomTaboo.jsx# 添加禁忌
    .......

```

## 🚀 开始使用

### 前提条件

- Node.js 18+
- Android Studio（Android开发）
- Xcode（iOS开发，仅macOS）
- JDK 11
- Yarn 或 npm

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/jiashi-feng/software.git
```

2. 安装依赖
```bash
yarn install
# 或
npm install
```

3. 启动应用
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

## 📱 应用界面

应用特色界面展示：

| 登录页面 | 主页 | 任务详情 | 设置页面 |
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

## 📞 联系我们

有任何问题或建议，欢迎通过以下方式联系我们：

- 邮箱: 259344725@qq.com

祝您使用愉快！
