import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard/stats', DashboardController.getStats);

export default router;
