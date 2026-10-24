// Centralized API Configuration & Dynamic Host Resolution for AgriApp
import { Platform, NativeModules } from 'react-native';

// Current machine IP on the local Wi-Fi / Ethernet network
export const HOST_LAN_IP = '192.23.1.52';
export const ANDROID_EMULATOR_IP = '10.0.2.2';

let cachedHost: string | null = null;

export const getApiHost = (): string => {
  if (cachedHost) return cachedHost;

  // 1. Web browser: use window.location.hostname
  if (Platform.OS === 'web') {
    const globalWin = (globalThis as any).window;
    if (globalWin && globalWin.location && globalWin.location.hostname) {
      cachedHost = String(globalWin.location.hostname);
      return cachedHost;
    }
    cachedHost = 'localhost';
    return cachedHost;
  }

  // 2. React Native / Expo Metro bundler scriptURL:
  // When Expo bundles on Android/iOS, scriptURL has the exact IP the phone used to download the app bundle
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1]) {
      const detected = match[1];
      // On Android, localhost or 127.0.0.1 resolves to the phone itself, which cannot reach the PC server
      if (Platform.OS === 'android' && (detected === 'localhost' || detected === '127.0.0.1')) {
        cachedHost = HOST_LAN_IP;
        return cachedHost;
      }
      cachedHost = detected;
      return cachedHost;
    }
  }

  // 3. Android fallback: use the PC's local LAN IP so physical devices on Wi-Fi connect seamlessly
  if (Platform.OS === 'android') {
    cachedHost = HOST_LAN_IP;
    return cachedHost;
  }

  cachedHost = 'localhost';
  return cachedHost;
};

// Cloud Production API URL
export const CLOUD_API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://mathira.jeenora.com/api';

export const setApiHost = (newHost: string) => {
  cachedHost = newHost;
  console.log(`[API Config]: Backend host updated to: ${newHost}`);
};

export const getApiBase = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (CLOUD_API_BASE) {
    return CLOUD_API_BASE;
  }
  return `http://${getApiHost()}:5050/api`;
};

// Auto-discovery helper: verifies cloud API first, falls back to local if unavailable
export const probeBackend = async (): Promise<string> => {
  const cloudUrl = getApiBase();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${cloudUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      console.log(`[API Config]: Successfully connected to backend at ${cloudUrl}`);
      return cloudUrl;
    }
  } catch {}

  if (Platform.OS === 'web') return 'localhost';
  const candidates = [getApiHost(), HOST_LAN_IP, ANDROID_EMULATOR_IP, 'localhost'];
  for (const host of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`http://${host}:5050/api/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setApiHost(host);
        return host;
      }
    } catch {}
  }
  return HOST_LAN_IP;
};

// Start probing in background
probeBackend().catch(() => {});

export const API_BASE = getApiBase();

export const API_ENDPOINTS = {
  // Authentication
  get sendOtp() { return `${getApiBase()}/auth/send-otp`; },
  get verifyOtp() { return `${getApiBase()}/auth/verify-otp`; },
  get vendorToken() { return `${getApiBase()}/auth/vendor-token`; },

  // Vendor Onboarding & Management
  get vendorRequests() { return `${getApiBase()}/vendor-requests`; },
  vendorStatus: (phone: string) => `${getApiBase()}/vendor-requests/status/${phone}`,
  approveVendor: (id: string) => `${getApiBase()}/vendor-requests/${id}/approve`,
  rejectVendor: (id: string) => `${getApiBase()}/vendor-requests/${id}/reject`,

  // User Profile
  userProfile: (phone: string) => `${getApiBase()}/user/profile/${phone}`,
  get users() { return `${getApiBase()}/users`; },
  get customers() { return `${getApiBase()}/customers`; },

  // Catalog
  get products() { return `${getApiBase()}/products`; },
  get categories() { return `${getApiBase()}/categories`; },
  get brands() { return `${getApiBase()}/brands`; },

  // Orders, Subscriptions, Deliveries
  get orders() { return `${getApiBase()}/orders`; },
  get subscriptions() { return `${getApiBase()}/subscriptions`; },
  get deliveries() { return `${getApiBase()}/deliveries`; },
  get aiAlerts() { return `${getApiBase()}/ai-alerts`; },
  get userLogs() { return `${getApiBase()}/user-logs`; },
  get dashboardStats() { return `${getApiBase()}/dashboard/stats`; },
  get health() { return `${getApiBase()}/health`; },
  get upload() { return `${getApiBase()}/upload`; },
};

export const uploadImageFile = async (base64OrUri: string, fileName?: string): Promise<string> => {
  try {
    const res = await fetch(`${getApiBase()}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64OrUri, fileName })
    });
    const json = await res.json();
    if (json.success && json.url) {
      return json.url;
    }
  } catch (err) {
    console.warn('[uploadImageFile] failed, fallback to base64 uri:', err);
  }
  return base64OrUri;
};

export default {
  API_BASE,
  API_ENDPOINTS,
  getApiBase,
  getApiHost,
  setApiHost,
  probeBackend
};
