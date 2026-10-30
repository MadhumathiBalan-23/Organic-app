import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { ProductController } from '../controllers/product.controller';
import { OrderController } from '../controllers/order.controller';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();

// ── Vendors Public & Admin Directory ──
router.get('/vendors', VendorController.getAllVendors);
router.get('/vendors/:id', VendorController.getVendorById);
router.get('/vendors/by-phone/:phoneNumber', VendorController.getVendorByPhone);

// ── Vendor Registration & Verification Requests ──
router.post('/vendor-requests', VendorController.submit);
router.get('/vendor-requests', VendorController.getAll);
router.get('/vendor-requests/status/:phoneNumber', VendorController.getStatus);
router.post('/vendor-requests/:id/approve', VendorController.approve);
router.post('/vendor-requests/:id/reject', VendorController.reject);
router.delete('/vendor-requests/:id', VendorController.delete);

// ── Vendor-Specific Product Management ──
router.get('/vendor/products', ProductController.getAll);
router.post('/vendor/products', ProductController.create);
router.put('/vendor/products/:id', ProductController.update);
router.delete('/vendor/products/:id', ProductController.delete);

// ── Vendor-Specific Order Management ──
router.get('/vendor/orders', OrderController.getAll);
router.get('/vendor/orders/:id', OrderController.getById);
router.patch('/vendor/orders/:id/status', OrderController.update);
router.put('/vendor/orders/:id/status', OrderController.update);

// ── Vendor-Specific Subscriptions ──
router.get('/vendor/subscriptions', SubscriptionController.getAll);

export default router;
