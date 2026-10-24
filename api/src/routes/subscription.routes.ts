import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();

router.get('/subscriptions', SubscriptionController.getAll);
router.post('/subscriptions', SubscriptionController.create);
router.put('/subscriptions/:id', SubscriptionController.update);
router.delete('/subscriptions/:id', SubscriptionController.delete);

export default router;
