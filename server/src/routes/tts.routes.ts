import { Router } from 'express';
import ttsController from '../controllers/tts.controller';

const router = Router();

// 文本转语音接口
router.post('/synthesize', ttsController.textToSpeech);

export default router; 