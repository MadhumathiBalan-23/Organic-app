import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.get('/products', ProductController.getAll);
router.post('/products/seed', ProductController.seedInfo);
router.get('/products/:id', ProductController.getById);
router.post('/products', ProductController.create);
router.put('/products/:id', ProductController.update);
router.delete('/products/:id', ProductController.delete);

export default router;
