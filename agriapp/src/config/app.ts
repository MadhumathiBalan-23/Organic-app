// ============================================================================
// AgriApp — Application Configuration
// App version, device metadata defaults, delivery fee defaults, etc.
// ============================================================================

export const APP_CONFIG = {
  // App version — read from package.json at build time, fallback here
  appVersion: '2.0.0',

  // Default OS version fallback when Platform.Version is unavailable
  defaultOsVersion: '14',

  // Default delivery charge fallback (used when backend is unreachable)
  defaultDeliveryCharge: 20,

  // Secure store keys
  secureStore: {
    deviceId: 'agriflow_device_id',
    accessToken: 'agriflow_access_token',
    refreshToken: 'agriflow_refresh_token',
    userRole: 'agriflow_user_role',
    userPhone: 'agriflow_user_phone',
    isTrusted: 'agriflow_device_trusted',
    selectedLocation: 'agriflow_selected_location',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;