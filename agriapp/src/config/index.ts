// ============================================================================
// AgriApp — Centralized Configuration Barrel
// Single import point for all app configuration.
// ============================================================================

export * from './api';
export * from './app';

export const Config = {
  api: {
    TIMEOUTS: {
      SHORT: 5000,
      STANDARD: 10000,
      EXTENDED: 15000,
      UPLOAD: 30000,
    },
    DEFAULT_PORT: 5050,
    PATH_PREFIX: '/api',
    getBase: () => require('./api').getApiBase(),
    getHost: () => require('./api').getApiHost(),
    setHost: (host: string) => require('./api').setApiHost(host),
    BASE: require('./api').API_BASE,
  },
  app: {
    version: '2.0.0',
    defaultOsVersion: '14',
    defaultDeliveryCharge: 20,
    secureStore: {
      deviceId: 'agriflow_device_id',
      accessToken: 'agriflow_access_token',
      refreshToken: 'agriflow_refresh_token',
      userRole: 'agriflow_user_role',
      userPhone: 'agriflow_user_phone',
      isTrusted: 'agriflow_device_trusted',
    },
  },
} as const;

export default Config;