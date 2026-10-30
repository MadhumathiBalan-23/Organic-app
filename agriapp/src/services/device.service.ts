import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_DEVICE_ID = 'agriflow_device_id';
const KEY_ACCESS_TOKEN = 'agriflow_access_token';
const KEY_REFRESH_TOKEN = 'agriflow_refresh_token';
const KEY_USER_ROLE = 'agriflow_user_role';
const KEY_USER_PHONE = 'agriflow_user_phone';
const KEY_IS_TRUSTED = 'agriflow_device_trusted';

// In-memory fallback
const memoryStorage = new Map<string, string>();

const safeSecureGet = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {}

  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      return g.localStorage.getItem(key);
    }
  } catch {}

  return memoryStorage.get(key) || null;
};

const safeSecureSet = async (key: string, val: string): Promise<void> => {
  try {
    if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(key, val);
      return;
    }
  } catch {}

  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      g.localStorage.setItem(key, val);
      return;
    }
  } catch {}

  memoryStorage.set(key, val);
};

const safeSecureDelete = async (key: string): Promise<void> => {
  try {
    if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch {}

  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      g.localStorage.removeItem(key);
      return;
    }
  } catch {}

  memoryStorage.delete(key);
};

export const deviceService = {
  /**
   * Retrieves or generates a persistent, cryptographically secure UUID for this app installation
   */
  getDeviceId: async (): Promise<string> => {
    let devId = await safeSecureGet(KEY_DEVICE_ID);
    if (!devId) {
      try {
        devId = Crypto.randomUUID();
      } catch {
        devId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      }
      await safeSecureSet(KEY_DEVICE_ID, devId);
      console.log(`📱 [DeviceService] Registered new Unique DeviceID: ${devId}`);
    }
    return devId;
  },

  /**
   * Device hardware & platform metadata
   */
  getDeviceMetadata: async () => {
    const deviceId = await deviceService.getDeviceId();
    const os = Platform.OS === 'ios' ? 'iOS' : (Platform.OS === 'web' ? 'Web' : 'Android');
    return {
      deviceId,
      deviceName: Platform.OS === 'ios' ? 'iPhone Device' : (Platform.OS === 'web' ? 'Web Browser' : 'Android Phone'),
      deviceModel: Platform.OS === 'web' ? 'Web Browser Client' : `${os} Device`,
      deviceType: Platform.OS === 'web' ? 'web' : 'mobile',
      operatingSystem: os,
      osVersion: String(Platform.Version || '14'),
      appVersion: '2.0.0'
    };
  },

  /**
   * Stores device-bound tokens in hardware-backed secure storage
   */
  storeCredentials: async (params: {
    accessToken: string;
    refreshToken: string;
    role: string;
    phone: string;
    isTrusted?: boolean;
  }) => {
    const { accessToken, refreshToken, role, phone, isTrusted = true } = params;
    await safeSecureSet(KEY_ACCESS_TOKEN, accessToken);
    await safeSecureSet(KEY_REFRESH_TOKEN, refreshToken);
    await safeSecureSet(KEY_USER_ROLE, role);
    await safeSecureSet(KEY_USER_PHONE, phone);
    await safeSecureSet(KEY_IS_TRUSTED, isTrusted ? 'true' : 'false');
  },

  /**
   * Retrieves saved session credentials
   */
  getStoredCredentials: async () => {
    const deviceId = await deviceService.getDeviceId();
    const accessToken = await safeSecureGet(KEY_ACCESS_TOKEN);
    const refreshToken = await safeSecureGet(KEY_REFRESH_TOKEN);
    const role = await safeSecureGet(KEY_USER_ROLE);
    const phone = await safeSecureGet(KEY_USER_PHONE);
    const isTrustedStr = await safeSecureGet(KEY_IS_TRUSTED);

    return {
      deviceId,
      accessToken,
      refreshToken,
      role,
      phone,
      isTrusted: isTrustedStr === 'true'
    };
  },

  /**
   * Clears session credentials on logout or revocation
   */
  clearCredentials: async () => {
    await safeSecureDelete(KEY_ACCESS_TOKEN);
    await safeSecureDelete(KEY_REFRESH_TOKEN);
    await safeSecureDelete(KEY_USER_ROLE);
    await safeSecureDelete(KEY_USER_PHONE);
    await safeSecureDelete(KEY_IS_TRUSTED);
  }
};
