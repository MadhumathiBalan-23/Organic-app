import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

// Notification Management
router.get('/notifications', NotificationController.getNotifications);
router.patch('/notifications/:id/read', NotificationController.markAsRead);
router.patch('/notifications/read-all', NotificationController.markAllAsRead);

// Automated Voice & Delay Testing
router.post('/notifications/test-voice-call', NotificationController.testVoiceCall);
router.post('/delivery/broadcast-delay', NotificationController.broadcastDelay);

// Webhook callback
router.post('/webhooks/telephony/status', NotificationController.telephonyWebhook);

export default router;
