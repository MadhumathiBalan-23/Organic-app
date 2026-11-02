// ============================================================================
// AgriApp — Centralized API Configuration
// All environment-dependent values live here. No hardcoded IPs, domains, or ports.
// ============================================================================

import { Platform, NativeModules } from 'react-native';

// ---------------------------------------------------------------------------
// Timeout constants (ms) — single source of truth
// ---------------------------------------------------------------------------
export const API_TIMEOUTS = {
  SHORT: 5000,      // health checks, quick probes
  STANDARD: 10000,  // most GET/POST requests
  EXTENDED: 15000,  // create/update with payloads
  UPLOAD: 30000,    // image uploads
} as const;

// ---------------------------------------------------------------------------
// Default ports
// ---------------------------------------------------------------------------
export const DEFAULT_API_PORT = 5050;
export const API_PATH_PREFIX = '/api';

// ---------------------------------------------------------------------------
// Dynamic host resolution (no hardcoded LAN IPs)
// ---------------------------------------------------------------------------
let cachedHost: string = '';

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
    const match = scriptURL.match(/https?:\/([^/:]+)/);
    if (match && match[1]) {
      const detected = match[1];
      // Android Metro bundler reports localhost — dev machine IP should be resolved at runtime
      if (Platform.OS === 'android' && (detected === 'localhost' || detected === '127.0.0.1')) {
        // Fall through to android default below
      } else {
        cachedHost = detected;
        return cachedHost;
      }
    }
  }

  // 3. Platform fallback — configurable via env, with sensible defaults
  if (Platform.OS === 'android') {
    cachedHost = process.env.EXPO_PUBLIC_ANDROID_EMULATOR_HOST ?? '10.0.2.2';
    return cachedHost;
  }

  cachedHost = process.env.EXPO_PUBLIC_WEB_HOST ?? 'localhost';
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
  return `http://${getApiHost()}:${DEFAULT_API_PORT}${API_PATH_PREFIX}`;
};

export const API_BASE = getApiBase();

// ---------------------------------------------------------------------------
// HTTPS → HTTP fallback interceptor (domain-agnostic)
// Instead of hardcoding mathira.jeenora.com, we derive the HTTPS host from
// the configured API base and attempt HTTP fallback on the same host.
// ---------------------------------------------------------------------------
import axios from 'axios';

const getHostFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config._retry &&
      config.url &&
      config.url.startsWith('https://')
    ) {
      const host = getHostFromUrl(config.url);
      if (host) {
        console.warn(
          `⚠️ [Network Interceptor]: HTTPS failed for ${host}, retrying with HTTP fallback...`
        );
        config._retry = true;
        config.url = config.url.replace(/^https:/, 'http:');
        return axios(config);
      }
    }
    return Promise.reject(error);
  }
);