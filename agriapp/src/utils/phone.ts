// ============================================================================
// AgriApp — Phone Number Utilities
// Centralized phone normalization used across all services and screens.
// ============================================================================

/**
 * Strip all non-digit characters from a phone number.
 * Example: "+91 98765 43210" → "919876543210"
 */
export const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  return String(phone).replace(/[^0-9]/g, '');
};

/**
 * Format a phone number for display (Indian format: +91 XXXXX XXXXX)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const clean = normalizePhone(phone);
  if (clean.startsWith('91') && clean.length === 12) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean;
};

/**
 * Check if a phone number is valid (at least 10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  const clean = normalizePhone(phone);
  return clean.length >= 10;
};