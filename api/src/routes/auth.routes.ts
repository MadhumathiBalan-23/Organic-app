import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// ── Common Authentication ──
router.post('/auth/send-otp', AuthController.sendOtp);
router.post('/auth/verify-otp', AuthController.verifyOtp);
router.post('/auth/refresh-token', AuthController.refreshToken);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/logout-all', authenticateToken, AuthController.logoutAll);
router.get('/auth/me', authenticateToken, AuthController.getMe);

// ── Device Management ──
router.post('/devices/register', AuthController.registerDevice);
router.get('/devices/my-devices', AuthController.getMyDevices);
router.post('/devices/:deviceId/revoke-trust', AuthController.revokeDeviceTrust);
router.delete('/devices/:deviceId', AuthController.deleteDevice);

// ── Vendor Token (check vendor approval & issue token) ──
router.post('/auth/vendor-token', AuthController.vendorToken);

// ── Role-Specific Routes (Customer) ──
router.post('/customer/auth/login', AuthController.customerLogin);
router.post('/customer/auth/refresh', AuthController.customerRefresh);

// ── Role-Specific Routes (Vendor) ──
router.post('/vendor/auth/login', AuthController.vendorLogin);
router.post('/vendor/auth/refresh', AuthController.vendorRefresh);

// ── Role-Specific Routes (Admin) ──
router.post('/admin/auth/login', AuthController.adminLogin);
router.post('/admin/auth/refresh', AuthController.adminRefresh);

export default router;
