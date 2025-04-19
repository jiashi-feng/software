/**
 * 后端服务器整合入口文件
 * 
 * 此文件负责启动两个后端服务：
 * 1. 任务分配系统服务 (task-service)
 * 2. 语音服务 (voice-service)
 */

const path = require('path');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

// 加载环境变量
dotenv.config();

// 定义服务及其配置
const services = [
  {
    name: '任务分配服务',
    command: 'node',
    args: [path.join(__dirname, 'task-service/server.js')],
    env: { PORT: process.env.TASK_SERVICE_PORT || 5000 }
  },
  {
    name: '语音服务',
    command: process.env.NODE_ENV === 'production' ? 'node' : 'ts-node',
    args: [
      process.env.NODE_ENV === 'production' 
        ? path.join(__dirname, 'dist/voice-service/index.js') 
        : path.join(__dirname, 'voice-service/index.ts')
    ],
    env: { PORT: process.env.VOICE_SERVICE_PORT || 3000 }
  }
];

// 启动所有服务
services.forEach(service => {
  console.log(`启动 ${service.name}...`);
  
  // 合并环境变量
  const env = { ...process.env, ...service.env };
  
  // 启动服务进程
  const proc = spawn(service.command, service.args, { 
    env,
    stdio: 'inherit' // 将子进程的输出传递到主进程
  });
  
  // 监听进程退出
  proc.on('close', (code) => {
    console.log(`${service.name} 已退出，退出码: ${code}`);
  });
  
  // 监听进程错误
  proc.on('error', (err) => {
    console.error(`启动 ${service.name} 时出错:`, err);
  });
});

console.log('所有后端服务已启动'); 