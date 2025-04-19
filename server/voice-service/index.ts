import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import ttsRoutes from './routes/tts.routes';
import asrRoutes from './routes/asr.routes';
import stsRoutes from './routes/sts.routes';
import aliyunService from './services/aliyun.service';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.VOICE_SERVICE_PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' })); // 增加限制以处理大型音频数据
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: '语音服务',
    timestamp: new Date().toISOString(),
    message: '语音服务运行正常'
  });
});

// 添加调试路由
app.get('/debug/token', async (req, res) => {
  try {
    console.log('收到令牌调试请求');
    const token = await aliyunService.getToken();
    res.json({ success: true, token: token.substring(0, 10) + '...' });
  } catch (error) {
    console.error('令牌调试错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取令牌失败'
    });
  }
});

// API路由
app.use('/api/tts', ttsRoutes);
app.use('/api/asr', asrRoutes);
app.use('/api/sts', stsRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`语音服务运行在 http://localhost:${PORT}`);
}); 