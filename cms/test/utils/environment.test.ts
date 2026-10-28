import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isMainEnvironment,
  isInternalEnvironment,
  getCurrentEnvironment,
  getApiUrl,
} from 'src/utils/environment';

describe('environment utils', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('isMainEnvironment', () => {
    it('returns true when API URL includes cchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://cchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(true);
    });

    it('returns false when API URL is internalcchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://internalcchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(false);
    });

    it('returns false when API URL is stagingcchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://stagingcchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(false);
    });

    it('returns false when API URL is empty', () => {
      vi.stubEnv('VITE_API_URL', '');
      expect(isMainEnvironment()).toBe(false);
    });

    it('returns false for localhost URL', () => {
      vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api/v1');
      expect(isMainEnvironment()).toBe(false);
    });
  });

  describe('isInternalEnvironment', () => {
    it('returns true when API URL includes internalcchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://internalcchatapi.mmenu.io/api/v1');
      expect(isInternalEnvironment()).toBe(true);
    });

    it('returns false when API URL is cchatapi.mmenu.io (main)', () => {
      vi.stubEnv('VITE_API_URL', 'https://cchatapi.mmenu.io/api/v1');
      expect(isInternalEnvironment()).toBe(false);
    });

    it('returns false when API URL is empty', () => {
      vi.stubEnv('VITE_API_URL', '');
      expect(isInternalEnvironment()).toBe(false);
    });

    it('returns false for localhost URL', () => {
      vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api/v1');
      expect(isInternalEnvironment()).toBe(false);
    });
  });

  describe('getCurrentEnvironment', () => {
    it('returns main when on main environment', () => {
      vi.stubEnv('VITE_API_URL', 'https://cchatapi.mmenu.io/api/v1');
      expect(getCurrentEnvironment()).toBe('main');
    });

    it('returns internal when on internal environment', () => {
      vi.stubEnv('VITE_API_URL', 'https://internalcchatapi.mmenu.io/api/v1');
      expect(getCurrentEnvironment()).toBe('internal');
    });

    it('returns internal when API URL is empty (fallback)', () => {
      vi.stubEnv('VITE_API_URL', '');
      expect(getCurrentEnvironment()).toBe('internal');
    });

    it('returns internal for localhost', () => {
      vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api/v1');
      expect(getCurrentEnvironment()).toBe('internal');
    });
  });

  describe('getApiUrl', () => {
    it('returns configured API URL when set', () => {
      vi.stubEnv('VITE_API_URL', 'https://cchatapi.mmenu.io/api/v1');
      expect(getApiUrl()).toBe('https://cchatapi.mmenu.io/api/v1');
    });

    it('returns internal API URL when set', () => {
      vi.stubEnv('VITE_API_URL', 'https://internalcchatapi.mmenu.io/api/v1');
      expect(getApiUrl()).toBe('https://internalcchatapi.mmenu.io/api/v1');
    });

    it('returns localhost default when API URL is not set', () => {
      vi.stubEnv('VITE_API_URL', '');
      expect(getApiUrl()).toBe('http://localhost:3000/api/v1');
    });

    it('returns custom URL when configured', () => {
      vi.stubEnv('VITE_API_URL', 'https://custom.api.com');
      expect(getApiUrl()).toBe('https://custom.api.com');
    });
  });

  describe('integration tests', () => {
    it('checks environment detection with cchatapi.mmenu.io (main)', () => {
      vi.stubEnv('VITE_API_URL', 'https://cchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(true);
      expect(isInternalEnvironment()).toBe(false);
      expect(getCurrentEnvironment()).toBe('main');
    });

    it('checks environment detection with internalcchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://internalcchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(false);
      expect(isInternalEnvironment()).toBe(true);
      expect(getCurrentEnvironment()).toBe('internal');
    });

    it('checks environment detection with stagingcchatapi.mmenu.io', () => {
      vi.stubEnv('VITE_API_URL', 'https://stagingcchatapi.mmenu.io/api/v1');
      expect(isMainEnvironment()).toBe(false);
      expect(isInternalEnvironment()).toBe(false);
      expect(getCurrentEnvironment()).toBe('internal');
    });
  });
});
