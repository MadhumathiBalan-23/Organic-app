import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';

const router = Router();

router.get('/deliveries', DeliveryController.getAll);
router.post('/deliveries', DeliveryController.create);
router.put('/deliveries/:id', DeliveryController.update);
router.delete('/deliveries/:id', DeliveryController.delete);

export default router;
