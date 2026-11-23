import { Request, Response } from 'express';
import { AiIntentService } from '../services/ai-intent.service';
import { WhatsAppService } from '../services/whatsapp.service';

export class AiIntentController {
  /**
   * POST /api/ai/process-intent
   * Natural Language (Tamil / Tanglish) Voice/Text processing from App
   */
  public static async processIntent(req: Request, res: Response) {
    try {
      const { text, phoneNumber, generateVoiceAudio } = req.body;

      if (!text) {
        return res.status(400).json({ success: false, message: 'text prompt is required' });
      }

      const result = await AiIntentService.processIntent(text, phoneNumber, !!generateVoiceAudio);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/webhooks/whatsapp
   * Meta Webhook verification handshake
   */
  public static verifyWhatsAppWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const verified = WhatsAppService.verifyWebhook(mode, token, challenge);
    if (verified) {
      return res.status(200).send(verified);
    }
    return res.status(403).send('Forbidden');
  }

  /**
   * POST /api/webhooks/whatsapp
   * Meta Webhook incoming message receiver
   */
  public static async handleWhatsAppWebhook(req: Request, res: Response) {
    // Meta requires an immediate 200 OK acknowledgment
    res.status(200).send('EVENT_RECEIVED');
    await WhatsAppService.handleIncomingWebhook(req.body);
  }

  /**
   * POST /api/whatsapp/send
   * Direct manual message sending
   */
  public static async sendWhatsApp(req: Request, res: Response) {
    try {
      const { phoneNumber, message } = req.body;
      if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, message: 'phoneNumber and message are required' });
      }

      const result = await WhatsAppService.sendTextMessage(phoneNumber, message);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
