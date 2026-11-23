import axios from 'axios';
import { prisma } from '../config/db';
import { NotificationService } from './notification.service';

export interface VoiceAlertOptions {
  customerName: string;
  phoneNumber: string;
  newTime: string;
  reason?: string;
  triggerReason?: 'AUTO_SLA_BREACH' | 'MANUAL_DRIVER_DELAY' | 'NIGHT_CONFIRMATION' | 'HUB_DELAY' | 'TEST_CALL';
  userId?: string;
}

export class VoiceAlertService {
  /**
   * Step 1: Synthesize Tamil Speech using Sarvam AI (Bulbul TTS)
   */
  public static async synthesizeTamilSpeech(
    customerName: string,
    newTime: string,
    reason: string = 'சாலை போக்குவரத்து நெரிசல்'
  ): Promise<{ audioUrl: string; transcript: string; isSimulated: boolean }> {
    const tamilText = `வணக்கம் ${customerName}! மதிரா ஆர்கானிக் ஃபார்மிலிருந்து அழைக்கிறோம். ${reason} காரணமாக இன்று உங்கள் பால் விநியோகம் காலை ${newTime} மணிக்கு வந்து சேரும். சிரமத்திற்கு மன்னிக்கவும்.`;
    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey || apiKey === 'YOUR_SARVAM_API_KEY') {
      console.log(`[VoiceAlertService - Sarvam AI Mock]: SARVAM_API_KEY not configured. Generating simulated Tamil speech audio.`);
      return {
        audioUrl: 'https://cdn.mathiraorganic.com/audio/simulated-tamil-delay-alert.mp3',
        transcript: tamilText,
        isSimulated: true
      };
    }

    try {
      const response = await axios.post(
        'https://api.sarvam.ai/text-to-speech',
        {
          inputs: [tamilText],
          target_language_code: 'ta-IN',
          speaker: 'meera',
          model: 'bulbul:v1',
          pitch: 0,
          pace: 0.95
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': apiKey
          },
          timeout: 10000
        }
      );

      const audioUrl = response.data.audio_url || (response.data.audios && response.data.audios[0]) || '';
      return {
        audioUrl,
        transcript: tamilText,
        isSimulated: false
      };
    } catch (err: any) {
      console.warn(`[VoiceAlertService]: Sarvam AI API request failed (${err.message}). Using fallback audio stream.`);
      return {
        audioUrl: 'https://cdn.mathiraorganic.com/audio/fallback-tamil-delay-alert.mp3',
        transcript: tamilText,
        isSimulated: true
      };
    }
  }

  /**
   * Step 2: Trigger Outbound Call to Customer Phone (via Exotel / Telephony)
   */
  public static async dispatchOutboundCall(options: VoiceAlertOptions) {
    const cleanPhone = String(options.phoneNumber).replace(/[^0-9]/g, '').slice(-10);
    const triggerReason = options.triggerReason || 'AUTO_SLA_BREACH';
    const reasonText = options.reason || 'சாலை போக்குவரத்து நெரிசல் மற்றும் அதிக மழை';

    console.log(`[VoiceAlertService]: Triggering Automated Tamil Voice Call to ${options.customerName} (${cleanPhone})...`);

    // 1. Synthesize Tamil Audio
    const { audioUrl, transcript, isSimulated } = await this.synthesizeTamilSpeech(
      options.customerName,
      options.newTime,
      reasonText
    );

    // 2. Create Audit Record in DB
    const log = await prisma.voiceCallLog.create({
      data: {
        customerPhone: cleanPhone,
        customerName: options.customerName,
        triggerReason,
        audioUrl,
        callStatus: 'INITIATED'
      }
    });

    const exotelSid = process.env.EXOTEL_SID;
    const exotelToken = process.env.EXOTEL_TOKEN;
    const callerId = process.env.EXOTEL_VIRTUAL_NUMBER;

    // Check if live Telephony is configured
    if (!exotelSid || !exotelToken || !callerId) {
      console.log(`[VoiceAlertService - Telephony Simulation]: Exotel credentials not configured.`);
      console.log(`📞 [Simulated Call Ringing on +91-${cleanPhone}]: "${transcript}"`);

      // Update call as completed in simulation mode
      await prisma.voiceCallLog.update({
        where: { id: log.id },
        data: {
          callSid: `SIM_${Date.now()}_${cleanPhone}`,
          callStatus: 'COMPLETED',
          durationSecs: 24,
          completedAt: new Date()
        }
      });

      // Also dispatch multi-channel notification (In-app, WhatsApp, SMS)
      await NotificationService.send({
        userId: options.userId,
        phoneNumber: cleanPhone,
        title: 'பால் டெலிவரி நேர மாற்றம் (Milk Delivery Update)',
        message: `மழை/போக்குவரத்து காரணமாக உங்கள் பால் டெலிவரி காலை ${options.newTime} மணிக்கு வரும்.`,
        type: 'DELIVERY_DELAY',
        channels: ['IN_APP', 'WHATSAPP', 'SMS']
      });

      return {
        success: true,
        callSid: `SIM_${log.id}`,
        callStatus: 'COMPLETED',
        transcript,
        isSimulated: true
      };
    }

    // Live Exotel Outbound API Call
    try {
      const backendUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:5000';
      const response = await axios.post(
        `https://api.exotel.com/v1/Accounts/${exotelSid}/Calls/connect.json`,
        new URLSearchParams({
          From: callerId,
          To: `0${cleanPhone}`,
          CallerId: callerId,
          Url: `http://my.exotel.com/${exotelSid}/exomls/play_audio?audio_url=${encodeURIComponent(audioUrl)}`,
          StatusCallback: `${backendUrl}/api/webhooks/telephony/status?logId=${log.id}`,
          CallType: 'trans'
        }),
        {
          auth: { username: exotelSid, password: exotelToken },
          timeout: 10000
        }
      );

      const callSid = response.data?.Call?.Sid || null;
      await prisma.voiceCallLog.update({
        where: { id: log.id },
        data: { callSid, callStatus: 'RINGING' }
      });

      return {
        success: true,
        callSid,
        callStatus: 'RINGING',
        transcript,
        isSimulated: false
      };
    } catch (error: any) {
      console.error(`[VoiceAlertService Error]: Telephony failed for ${cleanPhone}:`, error.message);

      await prisma.voiceCallLog.update({
        where: { id: log.id },
        data: { callStatus: 'FAILED', fallbackSent: true }
      });

      // Trigger instant fallback to WhatsApp & SMS
      await NotificationService.send({
        userId: options.userId,
        phoneNumber: cleanPhone,
        title: 'பால் டெலிவரி நேர மாற்றம் 🥛',
        message: `மழை/போக்குவரத்து காரணமாக உங்கள் பால் விநியோகம் காலை ${options.newTime} மணிக்கு வந்து சேரும்.`,
        type: 'DELIVERY_DELAY',
        channels: ['IN_APP', 'WHATSAPP', 'SMS']
      });

      return {
        success: false,
        error: error.message,
        fallbackTriggered: true
      };
    }
  }

  /**
   * Broadcast delay to all customers affected on a delivery route or morning cluster
   */
  public static async broadcastDelay(params: {
    delayMinutes: number;
    reason?: string;
    routeId?: string;
    slot?: string;
  }) {
    const delayMinutes = params.delayMinutes || 30;
    const reason = params.reason || 'கனமழை காரணமாக சாலைகளில் நீர் தேங்கியுள்ளது';
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute new expected delivery time (e.g. 06:45 AM + 30 mins = 07:15 AM)
    const now = new Date();
    const revisedDate = new Date(now.getTime() + delayMinutes * 60000);
    const newTime = revisedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    console.log(`[VoiceAlertService - Broadcast]: Initiating Broadcast Delay (+${delayMinutes} mins -> ${newTime})...`);

    // Fetch active morning subscription schedules for today
    const schedules = await prisma.subscriptionDeliverySchedule.findMany({
      where: {
        deliveryDate: todayStr,
        status: { in: ['SCHEDULED', 'DELAY_ALERT_SENT'] }
      },
      include: {
        subscription: {
          include: { user: true, product: true }
        }
      }
    });

    const results: any[] = [];
    const calledPhones = new Set<string>();

    for (const schedule of schedules) {
      const user = schedule.subscription?.user;
      const phone = user?.phoneNumber || schedule.subscription?.customerPhone;
      const name = user?.fullName || schedule.subscription?.customerName || 'வாடிக்கையாளர்';

      if (!phone || calledPhones.has(phone)) continue;
      calledPhones.add(phone);

      const callResult = await this.dispatchOutboundCall({
        customerName: name,
        phoneNumber: phone,
        newTime,
        reason,
        triggerReason: 'MANUAL_DRIVER_DELAY',
        userId: user?.id
      });

      results.push({ phone, name, result: callResult });
    }

    return {
      totalRecipients: calledPhones.size,
      delayMinutes,
      newTime,
      details: results
    };
  }
}
