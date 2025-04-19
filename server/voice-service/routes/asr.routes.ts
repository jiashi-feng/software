import { Router } from 'express';
import asrController from '../controllers/asr.controller';

const router = Router();

// 语音识别路由
router.post('/recognize', asrController.recognize);

export default router;
