import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';

const router = Router();

router.post('/vendor-requests', VendorController.submit);
router.get('/vendor-requests', VendorController.getAll);
router.get('/vendor-requests/status/:phoneNumber', VendorController.getStatus);
router.post('/vendor-requests/:id/approve', VendorController.approve);
router.post('/vendor-requests/:id/reject', VendorController.reject);
router.delete('/vendor-requests/:id', VendorController.delete);

export default router;
