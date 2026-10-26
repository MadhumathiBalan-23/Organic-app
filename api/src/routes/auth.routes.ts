import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/send-otp', AuthController.sendOtp);
router.post('/auth/verify-otp', AuthController.verifyOtp);
router.post('/auth/verify-device', AuthController.verifyTrustedDevice);
router.post('/auth/revoke-device', AuthController.revokeTrustedDevice);
router.post('/auth/vendor-token', AuthController.generateVendorToken);

export default router;
