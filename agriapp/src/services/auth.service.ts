// Authentication & User Profile API Service
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';

export interface UserProfile {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  location?: string;
  deliveryAddress?: string;
  role?: string;
  totalOrders?: number;
  activeSubscriptions?: number;
  totalSpend?: number;
  loyaltyPoints?: number;
  [key: string]: any;
}

export const authService = {
  // Send SMS OTP
  sendOtp: async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.sendOtp, { phoneNumber }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [AuthService.sendOtp] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Verify entered OTP
  verifyOtp: async (phoneNumber: string, otp: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.verifyOtp, { phoneNumber, otp }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [AuthService.verifyOtp] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Device hardware lock check
  verifyDevice: async (phoneNumber: string, deviceId: string): Promise<any> => {
    try {
      const res = await axios.post(API_ENDPOINTS.verifyDevice, { phoneNumber, deviceId }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('⚠️ [AuthService.verifyDevice] Error:', err.message);
      return { success: false };
    }
  },

  // Revoke device hardware lock
  revokeDevice: async (phoneNumber: string, deviceId: string): Promise<any> => {
    try {
      const res = await axios.post(API_ENDPOINTS.revokeDevice, { phoneNumber, deviceId }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('⚠️ [AuthService.revokeDevice] Error:', err.message);
      return { success: false };
    }
  },

  // Fetch user profile by phone
  getUserProfile: async (phoneNumber: string): Promise<UserProfile | null> => {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await axios.get(API_ENDPOINTS.userProfile(cleanPhone), { timeout: 10000 });
      return res.data?.user || res.data?.data || null;
    } catch (err: any) {
      console.warn('⚠️ [AuthService.getUserProfile] Error:', err.message);
      return null;
    }
  },

  // Save profile changes
  saveUserProfile: async (data: UserProfile): Promise<{ success: boolean; user?: any }> => {
    try {
      const res = await axios.post(`${API_ENDPOINTS.users}/update`, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [AuthService.saveUserProfile] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  updateUserProfile: async (phoneNumber: string, data: Partial<UserProfile>): Promise<{ success: boolean; user?: any }> => {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await axios.put(API_ENDPOINTS.userProfile(cleanPhone), data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [AuthService.updateUserProfile] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch registered customers (Admin)
  getCustomers: async (): Promise<any[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.customers, { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [AuthService.getCustomers] Error:', err.message);
      return [];
    }
  },
};

export default authService;
