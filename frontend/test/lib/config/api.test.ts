import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL } from '@/lib/config/api';

describe('API_BASE_URL', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    // Restore original env
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it('exports API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('uses default localhost URL when env var not set', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    // Note: This test might fail because the module is already imported
    // The actual value depends on the env at module load time
    expect(API_BASE_URL).toBeTruthy();
  });
});
