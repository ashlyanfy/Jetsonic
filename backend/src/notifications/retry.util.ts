/**
 * Retries an async function up to `maxAttempts` times with exponential backoff.
 * Useful for transient network failures on Telegram / Resend API calls.
 *
 * Delays: attempt 1→2: 2s, attempt 2→3: 6s. Total extra wait ≤ 8s.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 2_000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(3, attempt - 1); // 2s, 6s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
