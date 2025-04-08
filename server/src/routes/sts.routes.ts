import { Router } from 'express';
import stsController from '../controllers/sts.controller';

const router = Router();

// STS临时访问凭证路由
router.post('/credentials', stsController.getTemporaryCredentials);

export default router; 