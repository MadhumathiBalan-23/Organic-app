import { getApiBase } from './api.client';
import axios from 'axios';

export interface AppNotification {
  id: string;
  userId?: string | null;
  phoneNumber?: string | null;
  title: string;
  message: string;
  type: string;
  channel: string;
  status: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  /**
   * Fetch customer notifications
   */
  async getNotifications(phoneNumber?: string, userId?: string): Promise<AppNotification[]> {
    try {
      const params: any = {};
      if (phoneNumber) params.phoneNumber = phoneNumber;
      if (userId) params.userId = userId;

      const response = await axios.get(`${getApiBase()}/notifications`, { params, timeout: 5000 });
      return response.data?.data || [];
    } catch (err: any) {
      console.warn('[notificationService.getNotifications]:', err.message);
      return [];
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await axios.patch(`${getApiBase()}/notifications/${notificationId}/read`, {}, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Trigger automated voice call for testing
   */
  async triggerTestVoiceCall(params: {
    phoneNumber: string;
    customerName: string;
    newTime?: string;
    reason?: string;
  }) {
    try {
      const response = await axios.post(`${getApiBase()}/notifications/test-voice-call`, params, { timeout: 10000 });
      return response.data;
    } catch (err: any) {
      console.error('[notificationService.triggerTestVoiceCall]:', err.message);
      throw err;
    }
  },

  /**
   * Admin / Driver manual delay broadcast
   */
  async broadcastDelay(delayMinutes: number, reason?: string, routeId?: string) {
    try {
      const response = await axios.post(`${getApiBase()}/delivery/broadcast-delay`, {
        delayMinutes,
        reason,
        routeId
      }, { timeout: 10000 });
      return response.data;
    } catch (err: any) {
      console.error('[notificationService.broadcastDelay]:', err.message);
      throw err;
    }
  }
};
