import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { VendorDeliveryController } from '../controllers/vendor-delivery.controller';

const router = Router();

// Standard Delivery Management
router.get('/deliveries', DeliveryController.getAll);
router.post('/deliveries', DeliveryController.create);
router.put('/deliveries/:id', DeliveryController.update);
router.delete('/deliveries/:id', DeliveryController.delete);

// Vendor Delivery Radius & Per-Km Charges
router.get('/vendors/delivery-settings/:vendorPhone', VendorDeliveryController.getSettings);
router.post('/vendors/delivery-settings', VendorDeliveryController.saveSettings);
router.post('/delivery/calculate-charge', VendorDeliveryController.calculateFee);
router.get('/vendors/nearby', VendorDeliveryController.getNearbyVendors);

export default router;
