import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

// Customer and User listings
router.get('/customers', UserController.getAll);
router.get('/users', UserController.getAll);

// User Profile management
router.get('/user/profile/:phoneNumber', UserController.getProfile);
router.put('/user/profile/:phoneNumber', UserController.updateProfile);

export default router;
