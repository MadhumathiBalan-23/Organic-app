// Subscription API Service (Database-Driven Rules & Schedules)
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';
import { Product } from '../constants/mockData';

export interface DeliverySlotOption {
  id: string;
  time: string;
  label: string;
  icon?: string;
}

export interface UnitMultiplierOption {
  label: string;
  qty: number;
}

export interface ProductSubscriptionSettingsModel {
  id: string;
  productId: string;
  isSubscriptionEnabled: boolean;
  allowedFrequencies: ('Daily' | 'Weekly' | 'Monthly')[];
  minimumQuantity: number;
  maximumQuantity: number;
  quantityUnit: string;
  unitMultipliers: UnitMultiplierOption[];
  allowedDeliverySlots: DeliverySlotOption[];
  customTimeAllowed: boolean;
  morningDeliveryEnabled: boolean;
  eveningDeliveryEnabled: boolean;
  defaultSlot?: string;
  minimumDuration: number;
  maximumDuration: number;
  deliveryCutoffTime: string;
  categoryNotice?: string;
  badgeText?: string;
}

export interface ScheduleCalculationResult {
  product: Product;
  quantity: number;
  unit: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  selectedDays?: string[];
  selectedDates?: number[];
  duration: number;
  startDate: string;
  endDate: string;
  totalDeliveries: number;
  deliveryDates: string[];
  nextDeliveryDate: string;
  pricePerDelivery: number;
  priceTotal: number;
  formula: string;
}

export const subscriptionService = {
  // Fetch database-driven subscription rules for a specific product
  getSettingsForProduct: async (productId: string): Promise<ProductSubscriptionSettingsModel | null> => {
    try {
      if (!productId) return null;
      const res = await axios.get(API_ENDPOINTS.subscriptionSettings(productId), { timeout: 10000 });
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.getSettingsForProduct] Error:', err.message);
      return null;
    }
  },

  // Calculate delivery schedule, dates, and dynamic price
  calculateSchedule: async (params: {
    productId: string;
    quantity: number;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    selectedDays?: string[];
    selectedDates?: number[];
    duration?: number;
    startDate?: string;
    customEndDate?: string;
    skippedDates?: string[];
  }): Promise<ScheduleCalculationResult | null> => {
    try {
      const res = await axios.post(API_ENDPOINTS.calculateSubscription, params, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.calculateSchedule] Error:', err.message);
      return null;
    }
  },

  // Create new subscription in database with generated delivery schedules
  createSubscription: async (data: any): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.subscriptions, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [subscriptionService.createSubscription] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch subscriptions for customer phone
  getUserSubscriptions: async (userPhone?: string): Promise<any[]> => {
    try {
      const cleanPhone = userPhone ? String(userPhone).replace(/[^0-9]/g, '') : '';
      const endpoint = cleanPhone ? API_ENDPOINTS.userSubscriptions(cleanPhone) : API_ENDPOINTS.subscriptions;
      const res = await axios.get(endpoint, { timeout: 12000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.getUserSubscriptions] Error:', err.message);
      return [];
    }
  },

  // Toggle skip date in database
  skipDate: async (subscriptionId: string, date: string): Promise<boolean> => {
    try {
      const res = await axios.put(
        API_ENDPOINTS.skipSubscriptionDate(subscriptionId),
        { date },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return res.data?.success || false;
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.skipDate] Error:', err.message);
      return false;
    }
  },

  // Toggle pause/resume in database
  togglePause: async (subscriptionId: string): Promise<any> => {
    try {
      const res = await axios.put(API_ENDPOINTS.pauseSubscription(subscriptionId), {}, { timeout: 10000 });
      return res.data;
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.togglePause] Error:', err.message);
      return { success: false };
    }
  },

  // Delete subscription
  deleteSubscription: async (subscriptionId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_ENDPOINTS.subscriptions}/${subscriptionId}`, { timeout: 10000 });
      return true;
    } catch (err: any) {
      console.warn('⚠️ [subscriptionService.deleteSubscription] Error:', err.message);
      return false;
    }
  },
};
