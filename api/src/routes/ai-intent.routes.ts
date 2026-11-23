import { Router } from 'express';
import { AiIntentController } from '../controllers/ai-intent.controller';

const router = Router();

// AI Natural Language & Voice Intent Processor
router.post('/ai/process-intent', AiIntentController.processIntent);

// WhatsApp Meta Cloud API Webhook Handlers
router.get('/webhooks/whatsapp', AiIntentController.verifyWhatsAppWebhook);
router.post('/webhooks/whatsapp', AiIntentController.handleWhatsAppWebhook);

// Outbound WhatsApp message
router.post('/whatsapp/send', AiIntentController.sendWhatsApp);

export default router;
