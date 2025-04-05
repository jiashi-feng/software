import { Router } from 'express';
import asrController from '../controllers/asr.controller';

const router = Router();

// 语音识别接口
router.post('/recognize', asrController.speechToText);

export default router;
