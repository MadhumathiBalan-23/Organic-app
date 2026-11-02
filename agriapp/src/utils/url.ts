// ============================================================================
// AgriApp — URL Building Utilities
// Centralized API URL construction with proper query parameter encoding.
// ============================================================================

import { getApiBase } from '../config/api';

/**
 * Build a full API URL from a path, ensuring the base is prefixed.
 */
export const buildApiUrl = (path: string): string => {
  const base = getApiBase();
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${normalizedPath}`;
};

/**
 * Append query parameters to a URL.
 */
export const withQueryParams = (
  url: string,
  params: Record<string, string | number | boolean | undefined>
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${url}?${query}` : url;
};

/**
 * Build a paginated API URL with phone number filter (common pattern).
 */
export const buildUserFilterUrl = (
  endpoint: (phone: string) => string,
  phone: string
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return endpoint(cleanPhone);
};