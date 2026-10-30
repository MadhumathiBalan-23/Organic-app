import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';

const router = Router();

router.get('/cart', CartController.getCart);
router.post('/cart/add', CartController.addToCart);
router.post('/cart', CartController.addToCart);
router.put('/cart/update', CartController.updateQty);
router.put('/cart/:productId', CartController.updateQty);
router.delete('/cart/clear', CartController.clearCart);
router.delete('/cart/:productId', CartController.removeItem);
router.delete('/cart', CartController.clearCart);
router.post('/cart/sync', CartController.syncCart);

export default router;
