import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { VoiceAlertService } from '../services/voice-alert.service';
import { prisma } from '../config/db';

export class NotificationController {
  /**
   * GET /api/notifications
   */
  public static async getNotifications(req: Request, res: Response) {
    try {
      const { userId, phoneNumber, limit } = req.query;
      const notifications = await NotificationService.getNotifications(
        userId ? String(userId) : undefined,
        phoneNumber ? String(phoneNumber) : undefined,
        limit ? Number(limit) : 30
      );

      res.json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  public static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   */
  public static async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId, phoneNumber } = req.body;
      await NotificationService.markAllAsRead(userId, phoneNumber);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/notifications/test-voice-call
   * Test Tamil automated voice call generation via Sarvam AI & Telephony
   */
  public static async testVoiceCall(req: Request, res: Response) {
    try {
      const { phoneNumber, customerName, newTime, reason } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'phoneNumber is required for testing voice call'
        });
      }

      const result = await VoiceAlertService.dispatchOutboundCall({
        customerName: customerName || 'Mathira Customer',
        phoneNumber,
        newTime: newTime || '07:15 AM',
        reason: reason || 'கனமழை மற்றும் வண்டி பழுது',
        triggerReason: 'TEST_CALL'
      });

      res.json({
        success: true,
        message: 'Automated Tamil Voice Call initiated successfully',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/delivery/broadcast-delay
   * Manual override trigger for Admins / Drivers to report route delay
   */
  public static async broadcastDelay(req: Request, res: Response) {
    try {
      const { delayMinutes, reason, routeId } = req.body;

      const result = await VoiceAlertService.broadcastDelay({
        delayMinutes: Number(delayMinutes) || 30,
        reason,
        routeId
      });

      res.json({
        success: true,
        message: `Broadcast delay initiated to ${result.totalRecipients} customers`,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/webhooks/telephony/status
   * Telephony webhook callback to capture call completion, duration & missed calls
   */
  public static async telephonyWebhook(req: Request, res: Response) {
    try {
      const { logId } = req.query;
      const { CallSid, Status, Duration, RecordingUrl } = req.body;

      console.log(`[Telephony Webhook]: CallSid ${CallSid} Status: ${Status}, Duration: ${Duration}s`);

      if (logId) {
        await prisma.voiceCallLog.update({
          where: { id: String(logId) },
          data: {
            callStatus: Status || 'COMPLETED',
            durationSecs: Number(Duration) || 0,
            completedAt: new Date()
          }
        });
      }

      res.status(200).send('OK');
    } catch (err: any) {
      res.status(200).send('ERROR_ACK');
    }
  }
}
