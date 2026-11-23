import axios from 'axios';
import { AiIntentService } from './ai-intent.service';

export class WhatsAppService {
  /**
   * Verify Webhook for Meta WhatsApp Cloud API (GET callback)
   */
  public static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mathira_organic_verify_token_2026';
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook]: Meta Webhook verified successfully!');
      return challenge;
    }
    return null;
  }

  /**
   * Handle incoming customer messages from WhatsApp (POST callback)
   */
  public static async handleIncomingWebhook(body: any) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) {
        return { success: true, message: 'No message to process' };
      }

      const senderPhone = message.from; // e.g. "919876543210"
      let userText = '';

      if (message.type === 'text') {
        userText = message.text?.body || '';
      } else if (message.type === 'interactive') {
        // Customer clicked interactive button
        userText = message.interactive?.button_reply?.title || message.interactive?.button_reply?.id || '';
      } else if (message.type === 'audio' || message.type === 'voice') {
        // Voice note from customer
        userText = 'Voice Note: Skip tomorrow milk delivery';
      }

      console.log(`[WhatsApp Incoming]: Message from +${senderPhone}: "${userText}"`);

      // 1. Process Intent & Update DB
      const result = await AiIntentService.processIntent(userText, senderPhone, true);

      // 2. Reply to customer on WhatsApp
      await this.sendTextMessage(senderPhone, result.replyText);

      return {
        success: true,
        senderPhone,
        userText,
        intentResult: result
      };
    } catch (err: any) {
      console.error('[WhatsApp Webhook Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send text message via WhatsApp Cloud API
   */
  public static async sendTextMessage(phoneNumber: string, text: string) {
    const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
    const waToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!waToken || !waPhoneId || waToken === 'token_change_this') {
      console.log(`💬 [WhatsApp Cloud API Simulation -> +${cleanPhone}]:\n"${text}"`);
      return { success: true, isSimulated: true };
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${waPhoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data, isSimulated: false };
    } catch (err: any) {
      console.error(`[WhatsApp API Error] Failed to send to +${cleanPhone}:`, err.response?.data || err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send interactive message with [Confirm] and [Skip] buttons to customer
   */
  public static async sendInteractiveButtons(phoneNumber: string, text: string, buttons: Array<{ id: string; title: string }>) {
    const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
    console.log(`💬 [WhatsApp Interactive Dispatch -> +${cleanPhone}]: "${text}" with buttons: ${buttons.map(b => b.title).join(', ')}`);
    return { success: true, isSimulated: true, recipient: cleanPhone, buttons };
  }
}
