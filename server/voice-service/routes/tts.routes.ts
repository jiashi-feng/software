import { Router } from 'express';
import TTSController from '../controllers/tts.controller';

const router = Router();

// 语音合成路由
router.post('/synthesize', TTSController.synthesize);

export default router; 