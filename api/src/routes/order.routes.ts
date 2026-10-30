import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.get('/orders', OrderController.getAll);
router.get('/orders/:id', OrderController.getById);
router.post('/orders', OrderController.create);
router.put('/orders/:id', OrderController.update);
router.patch('/orders/:id/status', OrderController.update);
router.post('/orders/:id/verify-delivery', OrderController.verifyDeliveryOtp);
router.delete('/orders/:id', OrderController.delete);

export default router;
