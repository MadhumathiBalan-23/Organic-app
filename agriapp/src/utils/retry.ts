// ============================================================================
// AgriApp — Retry / Network Resilience Utilities
// Centralized retry logic for API calls.
// ============================================================================

/**
 * Execute a function with retry on failure.
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delayMs - Delay between retries in milliseconds
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), delayMs);
        });
      }
    }
  }
  throw lastError;
};

/**
 * Sleep utility for delaying execution.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};