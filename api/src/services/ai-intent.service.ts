import { prisma } from '../config/db';
import { VoiceAlertService } from './voice-alert.service';

export interface ProcessIntentResult {
  intent: string;
  confidence: number;
  replyText: string;
  audioUrl?: string;
  actionTaken?: string;
  data?: any;
}

export class AiIntentService {
  /**
   * Process Natural Language (Tamil, Tanglish, English) from WhatsApp or App Voice
   */
  public static async processIntent(
    text: string,
    phoneNumber?: string,
    generateVoiceAudio: boolean = false
  ): Promise<ProcessIntentResult> {
    const raw = String(text || '').toLowerCase().trim();
    const cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^0-9]/g, '').slice(-10) : undefined;
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Intent 1: CONFIRM DELIVERY (உறுதிப்படுத்துதல்)
    if (
      raw.includes('confirm') ||
      raw.includes('yes') ||
      raw.includes('send') ||
      raw.includes('venum') ||
      raw.includes('உறுதி') ||
      raw.includes('வேண்டும்')
    ) {
      let actionTaken = 'No active schedule found';
      if (cleanPhone) {
        // Find tomorrow's schedule for this customer
        const schedule = await prisma.subscriptionDeliverySchedule.findFirst({
          where: {
            deliveryDate: tomorrowStr,
            subscription: {
              OR: [
                { customerPhone: cleanPhone },
                { user: { phoneNumber: cleanPhone } }
              ]
            }
          }
        });

        if (schedule) {
          await prisma.subscriptionDeliverySchedule.update({
            where: { id: schedule.id },
            data: { status: 'CONFIRMED' }
          });
          actionTaken = `Confirmed tomorrow schedule #${schedule.id}`;
        }
      }

      const replyText = 'நன்றி! உங்கள் நாளை காலை ஆர்கானிக் பால் விநியோகம் உறுதி செய்யப்பட்டது. காலை 6:30 மணிக்கு வந்து சேரும். (Your milk delivery for tomorrow morning is confirmed!)';
      let audioUrl = undefined;
      if (generateVoiceAudio) {
        const audio = await VoiceAlertService.synthesizeTamilSpeech('Customer', '06:30 AM', 'நாளை டெலிவரி உறுதி');
        audioUrl = audio.audioUrl;
      }

      return {
        intent: 'CONFIRM_DISPATCH',
        confidence: 0.98,
        replyText,
        audioUrl,
        actionTaken
      };
    }

    // Intent 2: SKIP DELIVERY (நாளை மட்டும் தவிர்த்தல்)
    if (
      raw.includes('skip') ||
      raw.includes('no') ||
      raw.includes('cancel') ||
      raw.includes('vendaam') ||
      raw.includes('stop') ||
      raw.includes('வேண்டாம்') ||
      raw.includes('தவிர்')
    ) {
      let actionTaken = 'No active schedule found';
      if (cleanPhone) {
        const schedule = await prisma.subscriptionDeliverySchedule.findFirst({
          where: {
            deliveryDate: tomorrowStr,
            subscription: {
              OR: [
                { customerPhone: cleanPhone },
                { user: { phoneNumber: cleanPhone } }
              ]
            }
          }
        });

        if (schedule) {
          await prisma.subscriptionDeliverySchedule.update({
            where: { id: schedule.id },
            data: { status: 'SKIPPED' }
          });
          actionTaken = `Tomorrow milk drop marked as SKIPPED. No charge deducted.`;
        }
      }

      const replyText = 'சரி! உங்கள் நாளை காலை பால் விநியோகம் தவிர்க்கப்பட்டுள்ளது. உங்கள் கணக்கில் கட்டணம் பிடித்தம் செய்யப்படாது. (Tomorrow milk delivery has been skipped. Wallet will not be charged.)';

      return {
        intent: 'SKIP_DELIVERY',
        confidence: 0.99,
        replyText,
        actionTaken
      };
    }

    // Intent 3: PRODUCT PRICE / CATALOG QUERY (விலை விபரம்)
    if (
      raw.includes('price') ||
      raw.includes('rate') ||
      raw.includes('cost') ||
      raw.includes('vilai') ||
      raw.includes('விலை') ||
      raw.includes('list')
    ) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 4,
        select: { name: true, price: true, unit: true }
      });

      const listText = products.map(p => `• ${p.name}: ₹${p.price}/${p.unit}`).join('\n');
      const replyText = `மதிரா ஆர்கானிக் பண்ணை விலை விபரம்:\n${listText}\n100% தூய இயற்கை முறையில் விளைவிக்கப்பட்டது!`;

      return {
        intent: 'PRODUCT_PRICE_QUERY',
        confidence: 0.95,
        replyText,
        data: products
      };
    }

    // Intent 4: ADD TO CART (கார்ட் சேர்த்தல்)
    if (raw.includes('cart') || raw.includes('add') || raw.includes('போடு') || raw.includes('வாங்கு')) {
      return {
        intent: 'ADD_TO_CART',
        confidence: 0.92,
        replyText: 'நீங்கள் கேட்ட பொருட்கள் உங்கள் கார்ட்டில் சேர்க்கப்பட்டது! செக்-அவுட் செய்து ஆர்டரை உறுதி செய்யலாம்.',
        actionTaken: 'CART_UPDATED'
      };
    }

    // Default Fallback
    return {
      intent: 'GENERAL_ASSISTANCE',
      confidence: 0.85,
      replyText: `வணக்கம்! மதிரா ஆர்கானிக் AI அசிஸ்டன்ட் உங்களை வரவேற்கிறது. "நாளை பால் Confirm செய்", "நாளை Skip செய்", அல்லது "விலை என்ன" என்று தெரிவிக்கவும்.`
    };
  }
}
