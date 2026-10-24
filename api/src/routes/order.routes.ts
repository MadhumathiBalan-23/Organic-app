import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.get('/orders', OrderController.getAll);
router.post('/orders', OrderController.create);
router.put('/orders/:id', OrderController.update);
router.delete('/orders/:id', OrderController.delete);

export default router;
