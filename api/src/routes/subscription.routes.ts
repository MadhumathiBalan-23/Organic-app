import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();

router.get('/subscriptions', SubscriptionController.getAll);
router.post('/subscriptions', SubscriptionController.create);
router.post('/subscriptions/calculate', SubscriptionController.calculate);
router.get('/subscriptions/settings', SubscriptionController.getAllSettings);
router.get('/subscriptions/settings/:productId', SubscriptionController.getSettings);
router.put('/subscriptions/:id/skip', SubscriptionController.skipDate);
router.put('/subscriptions/:id/pause', SubscriptionController.togglePause);
router.put('/subscriptions/:id', SubscriptionController.update);
router.delete('/subscriptions/:id', SubscriptionController.delete);

export default router;
