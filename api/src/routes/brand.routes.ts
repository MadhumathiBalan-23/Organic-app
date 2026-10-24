import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';

const router = Router();

router.get('/brands', BrandController.getAll);
router.post('/brands', BrandController.create);
router.put('/brands/:id', BrandController.update);
router.delete('/brands/:id', BrandController.delete);

export default router;
