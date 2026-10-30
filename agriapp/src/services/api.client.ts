// Base API Client, Dynamic Host Resolution & Response Parsers
import { Platform, NativeModules } from 'react-native';
import axios from 'axios';

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

  // 2. React Native / Expo Metro bundler scriptURL
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1]) {
      const detected = match[1];
      if (Platform.OS === 'android' && (detected === 'localhost' || detected === '127.0.0.1')) {
        cachedHost = HOST_LAN_IP;
        return cachedHost;
      }
      cachedHost = detected;
      return cachedHost;
    }
  }

  // 3. Android fallback: use LAN IP
  if (Platform.OS === 'android') {
    cachedHost = HOST_LAN_IP;
    return cachedHost;
  }

  cachedHost = 'localhost';
  return cachedHost;
};

export const setApiHost = (newHost: string) => {
  cachedHost = newHost;
  console.log(`[API Config]: Backend host updated to: ${newHost}`);
};

export const getApiBase = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return `http://${getApiHost()}:5050/api`;
};

export const API_BASE = getApiBase();

// Configure Axios fallback: If HTTPS fails, seamlessly fallback to HTTP
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config._retry &&
      config.url &&
      config.url.startsWith('https://mathira.jeenora.com')
    ) {
      console.warn('⚠️ [Network Interceptor]: Retrying seamlessly with HTTP fallback...');
      config._retry = true;
      config.url = config.url.replace(/^https:\/\/mathira\.jeenora\.com/, 'http://mathira.jeenora.com');
      return axios(config);
    }
    return Promise.reject(error);
  }
);

/**
 * Safely extracts array data from API response regardless of JSON nesting
 */
export const extractDataList = <T = any>(responseData: any): T[] => {
  if (!responseData) return [];
  let parsed = responseData;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.data)) return parsed.data;
  return [];
};

// Probe local and candidate backend endpoints
export const probeBackend = async (): Promise<string> => {
  const localUrl = getApiBase();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${localUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      console.log(`[API Config]: Connected to local backend at ${localUrl}`);
      return localUrl;
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

probeBackend().catch(() => {});

// Comprehensive API Endpoints Registry
export const API_ENDPOINTS = {
  // Authentication & Device Security
  get sendOtp() { return `${getApiBase()}/auth/send-otp`; },
  get verifyOtp() { return `${getApiBase()}/auth/verify-otp`; },
  get refreshToken() { return `${getApiBase()}/auth/refresh-token`; },
  get logout() { return `${getApiBase()}/auth/logout`; },
  get logoutAll() { return `${getApiBase()}/auth/logout-all`; },
  get me() { return `${getApiBase()}/auth/me`; },

  // Role-Specific Endpoints
  get customerLogin() { return `${getApiBase()}/customer/auth/login`; },
  get customerRefresh() { return `${getApiBase()}/customer/auth/refresh`; },
  get vendorLogin() { return `${getApiBase()}/vendor/auth/login`; },
  get vendorRefresh() { return `${getApiBase()}/vendor/auth/refresh`; },
  get adminLogin() { return `${getApiBase()}/admin/auth/login`; },
  get adminRefresh() { return `${getApiBase()}/admin/auth/refresh`; },

  // Device Management
  get registerDevice() { return `${getApiBase()}/devices/register`; },
  userDevices: (userId: string) => `${getApiBase()}/devices/my-devices?userId=${encodeURIComponent(userId)}`,
  revokeDeviceTrust: (deviceId: string) => `${getApiBase()}/devices/${deviceId}/revoke-trust`,
  deleteDevice: (deviceId: string) => `${getApiBase()}/devices/${deviceId}`,
  get verifyDevice() { return `${getApiBase()}/auth/verify-device`; },
  get revokeDevice() { return `${getApiBase()}/auth/revoke-device`; },
  get vendorToken() { return `${getApiBase()}/auth/vendor-token`; },

  // Vendor Onboarding & Directory
  get vendors() { return `${getApiBase()}/vendors`; },
  vendorDetails: (id: string) => `${getApiBase()}/vendors/${id}`,
  vendorByPhone: (phone: string) => `${getApiBase()}/vendors/by-phone/${String(phone || '').replace(/[^0-9]/g, '')}`,
  get vendorRequests() { return `${getApiBase()}/vendor-requests`; },
  vendorStatus: (phone: string) => `${getApiBase()}/vendor-requests/status/${phone}`,
  approveVendor: (id: string) => `${getApiBase()}/vendor-requests/${id}/approve`,
  rejectVendor: (id: string) => `${getApiBase()}/vendor-requests/${id}/reject`,

  // Vendor Delivery Radius & Pricing
  vendorDeliverySettings: (phone: string) => `${getApiBase()}/vendors/delivery-settings/${phone}`,
  get saveVendorDeliverySettings() { return `${getApiBase()}/vendors/delivery-settings`; },
  get calculateDeliveryCharge() { return `${getApiBase()}/delivery/calculate-charge`; },
  nearbyVendors: (lat: number, lng: number) => `${getApiBase()}/vendors/nearby?lat=${lat}&lng=${lng}`,
  reverseGeocode: (lat: number, lon: number) => `${getApiBase()}/location/reverse-geocode?lat=${lat}&lon=${lon}`,
  searchLocation: (query: string) => `${getApiBase()}/location/search?q=${encodeURIComponent(query)}`,
  get saveLocation() { return `${getApiBase()}/location/save`; },

  // User Profile
  userProfile: (phone: string) => `${getApiBase()}/user/profile/${phone}`,
  get users() { return `${getApiBase()}/users`; },
  get customers() { return `${getApiBase()}/customers`; },

  // Catalog & Customer Discovery
  get products() { return `${getApiBase()}/products`; },
  get categories() { return `${getApiBase()}/categories`; },
  get brands() { return `${getApiBase()}/brands`; },
  get customerCategories() { return `${getApiBase()}/customer/categories`; },
  customerCategoryDetails: (categoryId: string) => `${getApiBase()}/customer/categories/${encodeURIComponent(categoryId)}`,
  customerCategoryVendors: (categoryId: string) => `${getApiBase()}/customer/categories/${encodeURIComponent(categoryId)}/vendors`,
  get customerProducts() { return `${getApiBase()}/customer/products`; },
  customerVendorProducts: (vendorId: string) => `${getApiBase()}/customer/vendors/${encodeURIComponent(vendorId)}/products`,
  customerProductDetails: (productId: string) => `${getApiBase()}/customer/products/${encodeURIComponent(productId)}`,
  get customerSearch() { return `${getApiBase()}/customer/products/search`; },

  // Orders, Subscriptions, Deliveries
  get orders() { return `${getApiBase()}/orders`; },
  userOrders: (phone: string) => `${getApiBase()}/orders?phoneNumber=${String(phone || '').replace(/[^0-9]/g, '')}`,
  vendorOrders: (vendorId: string) => `${getApiBase()}/orders?vendorId=${encodeURIComponent(vendorId)}`,
  vendorSubscriptions: (vendorId: string) => `${getApiBase()}/subscriptions?vendorId=${encodeURIComponent(vendorId)}`,
  verifyDeliveryOtp: (id: string) => `${getApiBase()}/orders/${id}/verify-delivery`,
  get subscriptions() { return `${getApiBase()}/subscriptions`; },
  userSubscriptions: (phone: string) => `${getApiBase()}/subscriptions?phoneNumber=${String(phone || '').replace(/[^0-9]/g, '')}`,
  subscriptionSettings: (productId: string) => `${getApiBase()}/subscriptions/settings/${productId}`,
  get allSubscriptionSettings() { return `${getApiBase()}/subscriptions/settings`; },
  get calculateSubscription() { return `${getApiBase()}/subscriptions/calculate`; },
  skipSubscriptionDate: (id: string) => `${getApiBase()}/subscriptions/${id}/skip`,
  pauseSubscription: (id: string) => `${getApiBase()}/subscriptions/${id}/pause`,
  vendorProducts: (vendorId: string) => `${getApiBase()}/products?vendorId=${encodeURIComponent(String(vendorId || ''))}`,
  get deliveries() { return `${getApiBase()}/deliveries`; },
  get aiAlerts() { return `${getApiBase()}/ai-alerts`; },
  get userLogs() { return `${getApiBase()}/user-logs`; },
  get dashboardStats() { return `${getApiBase()}/dashboard/stats`; },
  get health() { return `${getApiBase()}/health`; },
  get upload() { return `${getApiBase()}/upload`; },
  get banners() { return `${getApiBase()}/banners/active`; },
  get allBanners() { return `${getApiBase()}/admin/banners`; },
  get createBanner() { return `${getApiBase()}/banners`; },
  updateBanner: (id: string) => `${getApiBase()}/banners/${id}`,
  deleteBanner: (id: string) => `${getApiBase()}/banners/${id}`,

  // Customer Persistent Cart (Stored in Database)
  get cart() { return `${getApiBase()}/cart`; },
  userCart: (phone: string) => `${getApiBase()}/cart?phoneNumber=${String(phone || '').replace(/[^0-9]/g, '')}`,
  get addToCart() { return `${getApiBase()}/cart/add`; },
  get updateCartQty() { return `${getApiBase()}/cart/update`; },
  removeFromCart: (productId: string, phone: string) => `${getApiBase()}/cart/${productId}?phoneNumber=${String(phone || '').replace(/[^0-9]/g, '')}`,
  clearCart: (phone: string) => `${getApiBase()}/cart/clear?phoneNumber=${String(phone || '').replace(/[^0-9]/g, '')}`,
  get syncCart() { return `${getApiBase()}/cart/sync`; },
};

export const safeCategory = (cat: any): string => {
  if (typeof cat === 'string') return cat;
  if (cat && typeof cat.name === 'string') return cat.name;
  return 'Uncategorized';
};

export interface DynamicBanner {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl?: string;
  ctaText?: string;
  targetType?: string;
  targetId?: string;
  backgroundColor?: string;
  accentColor?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface DynamicCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export { axios };
