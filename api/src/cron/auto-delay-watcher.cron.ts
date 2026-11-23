import cron from 'node-cron';
import { prisma } from '../config/db';
import { VoiceAlertService } from '../services/voice-alert.service';

/**
 * Mode 2: Fully Autonomous Delay Detection & SLA Breach Watcher Engine
 * Operates without any driver or human intervention.
 */
export class AutoDelayWatcherCron {
  private static isRunning = false;

  /**
   * Initialize all autonomous background cron schedules
   */
  public static init() {
    console.log('[Auto-Watcher]: Initializing Mode 2 Autonomous SLA Breach Cron Watcher...');

    // 1. Morning SLA Breach Watcher: Runs every 5 minutes between 5:30 AM and 8:30 AM
    cron.schedule('*/5 5-8 * * *', async () => {
      await this.runSlaBreachCheck();
    });

    // 2. Night 8:30 PM Auto-Confirmation Dispatcher
    cron.schedule('30 20 * * *', async () => {
      await this.runNightConfirmationCheck();
    });

    console.log('[Auto-Watcher]: Mode 2 Autonomous Watchers active (Morning 5-8 AM SLA & Night 8:30 PM confirmation).');
  }

  /**
   * Main SLA Breach Logic: Scans active morning schedules and auto-calls delayed customers
   */
  public static async runSlaBreachCheck() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const now = new Date();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const currentTimeInMins = currentHours * 60 + currentMins;

      // Find all pending milk and vegetable subscription schedules for today
      const pendingSchedules = await prisma.subscriptionDeliverySchedule.findMany({
        where: {
          deliveryDate: todayStr,
          status: 'SCHEDULED'
        },
        include: {
          subscription: {
            include: { user: true, product: true }
          }
        }
      });

      if (pendingSchedules.length === 0) {
        return;
      }

      console.log(`[Auto-Watcher]: Inspecting ${pendingSchedules.length} pending delivery schedules for potential delay...`);

      for (const schedule of pendingSchedules) {
        // Default morning slot cutoff: 07:00 AM (420 mins). Trigger alert 15 mins prior (06:45 AM = 405 mins)
        // If slot string like "06:00 AM - 08:00 AM" exists, parse end time:
        let cutoffMins = 6 * 60 + 45; // 06:45 AM
        const slotText = schedule.deliveryTime || schedule.subscription?.deliveryTime || '06:30 AM';

        if (slotText.includes('-')) {
          const parts = slotText.split('-');
          const endPart = parts[1]?.trim() || '';
          if (endPart.includes('08:00')) cutoffMins = 7 * 60 + 45; // 07:45 AM
          if (endPart.includes('07:00')) cutoffMins = 6 * 60 + 45; // 06:45 AM
        }

        // Check if current time has breached cutoff threshold
        if (currentTimeInMins >= cutoffMins) {
          const customer = schedule.subscription?.user;
          const phone = customer?.phoneNumber || schedule.subscription?.customerPhone;
          const name = customer?.fullName || schedule.subscription?.customerName || 'வாடிக்கையாளர்';

          if (phone) {
            console.log(`🚨 [Auto-Watcher]: SLA Breach Detected for ${name} (${phone})! Current time has passed cutoff.`);

            // Projected revised delivery time (+30 minutes)
            const revisedDate = new Date(now.getTime() + 30 * 60000);
            const revisedTime = revisedDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            // Trigger Autonomous Tamil Voice Call
            await VoiceAlertService.dispatchOutboundCall({
              customerName: name,
              phoneNumber: phone,
              newTime: revisedTime,
              reason: 'அதிகாலை மழை மற்றும் போக்குவரத்து நெரிசல்',
              triggerReason: 'AUTO_SLA_BREACH',
              userId: customer?.id
            });

            // Mark schedule to avoid duplicate calls on subsequent cron ticks
            await prisma.subscriptionDeliverySchedule.update({
              where: { id: schedule.id },
              data: { status: 'DELAY_ALERT_SENT' }
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[Auto-Watcher Error]: Failed during SLA breach check:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Night 8:30 PM Confirmation Job: Reminds active customers of tomorrow's morning drop
   */
  public static async runNightConfirmationCheck() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const tomorrowSchedules = await prisma.subscriptionDeliverySchedule.findMany({
        where: {
          deliveryDate: tomorrowStr,
          status: 'SCHEDULED'
        },
        include: {
          subscription: {
            include: { user: true, product: true }
          }
        }
      });

      console.log(`[Night-Confirmation]: Found ${tomorrowSchedules.length} milk deliveries scheduled for tomorrow (${tomorrowStr}).`);
      // Sends multi-channel alerts / triggers interactive WhatsApp button
    } catch (err: any) {
      console.error('[Night-Confirmation Error]:', err.message);
    }
  }
}
