import { Router } from 'express';
import { LogController } from '../controllers/log.controller';

const router = Router();

router.get('/user-logs', LogController.getUserLogs);
router.post('/user-logs', LogController.create);
router.get('/logs', LogController.getUserLogs);
router.post('/logs', LogController.create);
router.get('/ai-alerts', LogController.getAIAlerts);

export default router;
