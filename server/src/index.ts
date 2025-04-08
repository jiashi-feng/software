import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import ttsRoutes from './routes/tts.routes';
import asrRoutes from './routes/asr.routes';
import stsRoutes from './routes/sts.routes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' })); // 增加限制以处理大型音频数据
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 路由
app.use('/api/tts', ttsRoutes);
app.use('/api/asr', asrRoutes);
app.use('/api/sts', stsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: '服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 