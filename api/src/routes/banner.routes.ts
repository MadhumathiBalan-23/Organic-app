import { Router } from 'express';
import { BannerController } from '../controllers/banner.controller';

const router = Router();

// Public customer banner endpoint
router.get('/banners/active', BannerController.getActive);
router.get('/banners', BannerController.getActive);
router.get('/banners/:id', BannerController.getById);

// Admin operations
router.get('/admin/banners', BannerController.getAll);
router.post('/banners', BannerController.create);
router.put('/banners/:id', BannerController.update);
router.delete('/banners/:id', BannerController.delete);

export default router;
