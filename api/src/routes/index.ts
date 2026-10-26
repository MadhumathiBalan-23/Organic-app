import { Router } from 'express';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import userRoutes from './user.routes';
import subscriptionRoutes from './subscription.routes';
import orderRoutes from './order.routes';
import deliveryRoutes from './delivery.routes';
import logRoutes from './log.routes';
import dashboardRoutes from './dashboard.routes';
import authRoutes from './auth.routes';
import vendorRoutes from './vendor.routes';
import uploadRoutes from './upload.routes';
import locationRoutes from './location.routes';
import bannerRoutes from './banner.routes';

const router = Router();

// Mount all modular domain routes
router.use(healthRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use(brandRoutes);
router.use(userRoutes);
router.use(subscriptionRoutes);
router.use(orderRoutes);
router.use(deliveryRoutes);
router.use(logRoutes);
router.use(dashboardRoutes);
router.use(authRoutes);
router.use(vendorRoutes);
router.use(uploadRoutes);
router.use(locationRoutes);
router.use(bannerRoutes);

export default router;
