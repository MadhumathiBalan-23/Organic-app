// ============================================================================
// AgriApp — Safe Storage Utilities
// Cross-platform storage abstraction (SecureStore → localStorage → memory).
// Extracted from App.tsx and device.service.ts for reuse.
// ============================================================================

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

// Synchronous wrappers for localStorage/memory only (used where async is not possible)
const safeSecureGetSync = (key: string): string | null => {
  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      return g.localStorage.getItem(key);
    }
  } catch {}
  return memoryStorage.get(key) || null;
};

const safeSecureSetSync = (key: string, val: string): void => {
  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      g.localStorage.setItem(key, val);
      return;
    }
  } catch {}
  memoryStorage.set(key, val);
};

const safeSecureDeleteSync = (key: string): void => {
  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage) {
      g.localStorage.removeItem(key);
      return;
    }
  } catch {}
  memoryStorage.delete(key);
};

export const safeStorage = {
  getItem: safeSecureGet,
  setItem: safeSecureSet,
  removeItem: safeSecureDelete,
  getItemSync: safeSecureGetSync,
  setItemSync: safeSecureSetSync,
  removeItemSync: safeSecureDeleteSync,
};