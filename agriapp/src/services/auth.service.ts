// Authentication & User Profile API Service
import { API_ENDPOINTS } from './api.client';
import axios from 'axios';
import { deviceService } from './device.service';

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

export interface UserDeviceItem {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deviceType: string;
  operatingSystem: string;
  osVersion: string;
  isTrusted: boolean;
  isActive: boolean;
  appVersion?: string;
  trustedAt: string | null;
  lastLoginAt: string;
  createdAt: string;
}

export const authService = {
  /**
   * Request 6-digit OTP (60s timer, role-aware)
   */
  sendOtp: async (phoneNumber: string, role: string = 'customer'): Promise<{
    success: boolean;
    message?: string;
    phoneNumber?: string;
    expiresInSeconds?: number;
    expiresAt?: string;
    role?: string;
    otp?: string;
    waitSeconds?: number;
    lockoutSeconds?: number;
  }> => {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await axios.post(
        API_ENDPOINTS.sendOtp,
        { phoneNumber: cleanPhone, role },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  /**
   * Verify 6-digit OTP and register device
   */
  verifyOtp: async (params: {
    phoneNumber: string;
    otp: string;
    trustDevice?: boolean;
    role?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    deviceId?: string;
    isTrusted?: boolean;
    user?: any;
    remainingAttempts?: number;
    lockoutSeconds?: number;
  }> => {
    const { phoneNumber, otp, trustDevice = true, role = 'customer' } = params;
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const deviceInfo = await deviceService.getDeviceMetadata();

    try {
      const res = await axios.post(
        API_ENDPOINTS.verifyOtp,
        {
          phoneNumber: cleanPhone,
          otp: otp.trim(),
          deviceInfo,
          trustDevice,
          role
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const data = res.data;
      if (data.success && data.accessToken && data.refreshToken) {
        await deviceService.storeCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role || role,
          phone: cleanPhone,
          isTrusted: data.isTrusted
        });
      }

      return data;
    } catch (err: any) {
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  /**
   * Automatic Login on Trusted Device via Device-Bound Refresh Token
   */
  refreshToken: async (role?: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    deviceId?: string;
    user?: any;
    message?: string;
  }> => {
    const creds = await deviceService.getStoredCredentials();
    if (!creds.refreshToken || !creds.deviceId) {
      throw new Error('No refresh credentials found on device.');
    }

    try {
      const res = await axios.post(
        API_ENDPOINTS.refreshToken,
        {
          refreshToken: creds.refreshToken,
          deviceId: creds.deviceId,
          role: role || creds.role || 'customer'
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const data = res.data;
      if (data.success && data.accessToken && data.refreshToken) {
        // Rotate stored refresh token securely
        await deviceService.storeCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role || creds.role || 'customer',
          phone: creds.phone || '',
          isTrusted: true
        });
      }

      return data;
    } catch (err: any) {
      // If refresh fails due to token reuse, revocation, or expiry: clear local credentials
      if (err.response?.status === 401 || err.response?.status === 403) {
        await deviceService.clearCredentials();
      }
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  /**
   * Logout current device session
   */
  logout: async (userId: string): Promise<any> => {
    try {
      const creds = await deviceService.getStoredCredentials();
      await axios.post(
        API_ENDPOINTS.logout,
        {
          userId,
          deviceId: creds.deviceId,
          refreshToken: creds.refreshToken
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
    } catch {}
    await deviceService.clearCredentials();
    return { success: true };
  },

  /**
   * Revoke all sessions across all devices
   */
  logoutAll: async (userId: string, accessToken?: string): Promise<any> => {
    try {
      const creds = await deviceService.getStoredCredentials();
      const token = accessToken || creds.accessToken;
      await axios.post(
        API_ENDPOINTS.logoutAll,
        { userId },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          timeout: 5000
        }
      );
    } catch {}
    await deviceService.clearCredentials();
    return { success: true };
  },

  /**
   * Device Management APIs
   */
  getMyDevices: async (userId: string): Promise<UserDeviceItem[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.userDevices(userId), { timeout: 10000 });
      if (res.data?.success && Array.isArray(res.data.devices)) {
        return res.data.devices;
      }
      return [];
    } catch (err: any) {
      console.warn('⚠️ [AuthService.getMyDevices] Error:', err.message);
      return [];
    }
  },

  revokeDeviceTrust: async (deviceId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axios.post(
        API_ENDPOINTS.revokeDeviceTrust(deviceId),
        { userId },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return res.data;
    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  deleteDevice: async (deviceId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axios.delete(API_ENDPOINTS.deleteDevice(deviceId), {
        data: { userId },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

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

  updateUserProfile: async (phoneOrData: string | UserProfile, dataObj?: UserProfile): Promise<{ success: boolean; user?: any }> => {
    if (typeof phoneOrData === 'string' && dataObj) {
      return authService.saveUserProfile({ ...dataObj, phoneNumber: phoneOrData });
    }
    return authService.saveUserProfile(phoneOrData as UserProfile);
  },

  verifyDevice: async (phoneNumber: string, deviceId: string): Promise<any> => {
    return { success: true, isTrusted: true };
  },

  revokeDevice: async (phoneNumber: string, deviceId: string): Promise<any> => {
    return { success: true };
  }
};
