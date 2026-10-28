/**
 * Fetch with timeout support for SSR requests
 * Prevents page from hanging indefinitely when backend is slow
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number; next?: { revalidate?: number } } = {}
): Promise<Response> {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Helper to handle timeout errors gracefully
 * Returns true if the error is a timeout/abort error
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
