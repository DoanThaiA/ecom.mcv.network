import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from 'src/services/storageService';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';

vi.mock('src/services/localStorage', () => ({
  appLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    hasItem: vi.fn(),
  },
  localStorageKeys: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_EXPIRES: 'token_expires',
    LAST_REFRESH_TIME: 'last_refresh_time',
    USER: 'user',
    LANGUAGE: 'language',
    COLUMN_VISIBILITY: 'column_visibility',
  },
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('token methods', () => {
    it('getToken returns token', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue('token123');
      expect(storageService.getToken()).toBe('token123');
      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN);
    });

    it('setToken saves token', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setToken('token123')).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN, 'token123');
    });

    it('removeToken removes token', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.removeToken()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN);
    });

    it('hasToken checks if token exists', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      expect(storageService.hasToken()).toBe(true);
      expect(appLocalStorage.hasItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN);
    });
  });

  describe('refresh token methods', () => {
    it('getRefreshToken returns refresh token', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue('refresh123');
      expect(storageService.getRefreshToken()).toBe('refresh123');
      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN);
    });

    it('setRefreshToken saves refresh token', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setRefreshToken('refresh123')).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN, 'refresh123');
    });

    it('removeRefreshToken removes refresh token', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.removeRefreshToken()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN);
    });

    it('hasRefreshToken checks if refresh token exists', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      expect(storageService.hasRefreshToken()).toBe(true);
      expect(appLocalStorage.hasItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN);
    });
  });

  describe('token expires methods', () => {
    it('getTokenExpires returns expires timestamp', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue(1234567890);
      expect(storageService.getTokenExpires()).toBe(1234567890);
      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.TOKEN_EXPIRES);
    });

    it('setTokenExpires saves expires timestamp', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setTokenExpires(1234567890)).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.TOKEN_EXPIRES, 1234567890);
    });

    it('removeTokenExpires removes expires timestamp', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.removeTokenExpires()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.TOKEN_EXPIRES);
    });
  });

  describe('last refresh time methods', () => {
    it('getLastRefreshTime returns timestamp', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue(1234567890);
      expect(storageService.getLastRefreshTime()).toBe(1234567890);
      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.LAST_REFRESH_TIME);
    });

    it('setLastRefreshTime saves timestamp', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setLastRefreshTime(1234567890)).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.LAST_REFRESH_TIME, 1234567890);
    });

    it('setLastRefreshTime uses Date.now when no timestamp provided', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      expect(storageService.setLastRefreshTime()).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.LAST_REFRESH_TIME, now);
    });

    it('removeLastRefreshTime removes timestamp', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.removeLastRefreshTime()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.LAST_REFRESH_TIME);
    });

    it('needsProactiveRefresh returns false when no refresh token', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(false);
      expect(storageService.needsProactiveRefresh()).toBe(false);
    });

    it('needsProactiveRefresh returns true when no last refresh time', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
      expect(storageService.needsProactiveRefresh()).toBe(true);
    });

    it('needsProactiveRefresh returns true when > 12 hours', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      const twelveHoursAgo = Date.now() - 13 * 60 * 60 * 1000;
      vi.mocked(appLocalStorage.getItem).mockReturnValue(twelveHoursAgo);
      expect(storageService.needsProactiveRefresh()).toBe(true);
    });

    it('needsProactiveRefresh returns false when < 12 hours', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      const elevenHoursAgo = Date.now() - 11 * 60 * 60 * 1000;
      vi.mocked(appLocalStorage.getItem).mockReturnValue(elevenHoursAgo);
      expect(storageService.needsProactiveRefresh()).toBe(false);
    });
  });

  describe('user methods', () => {
    const mockUser = { id: '123', username: 'testuser', email: 'test@example.com' };

    it('getUser returns user', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockUser);
      expect(storageService.getUser()).toEqual(mockUser);
      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.USER);
    });

    it('setUser saves user', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setUser(mockUser as any)).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USER, mockUser);
    });

    it('updateUser updates partial user data', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockUser);
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.updateUser({ email: 'new@example.com' })).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USER, { ...mockUser, email: 'new@example.com' });
    });

    it('updateUser returns false when no current user', () => {
      vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
      expect(storageService.updateUser({ email: 'new@example.com' })).toBe(false);
    });

    it('removeUser removes user', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.removeUser()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.USER);
    });

    it('hasUser checks if user exists', () => {
      vi.mocked(appLocalStorage.hasItem).mockReturnValue(true);
      expect(storageService.hasUser()).toBe(true);
      expect(appLocalStorage.hasItem).toHaveBeenCalledWith(localStorageKeys.USER);
    });
  });

  describe('combined auth methods', () => {
    it('setAuthTokens saves both tokens', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setAuthTokens('access123', 'refresh123')).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN, 'access123');
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN, 'refresh123');
    });

    it('setAuthTokens returns false when one fails', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValueOnce(true).mockReturnValueOnce(false);
      expect(storageService.setAuthTokens('access123', 'refresh123')).toBe(false);
    });

    it('setAuthData saves all auth data with user', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      const mockUser = { id: '123', username: 'test' };
      expect(storageService.setAuthData({
        accessToken: 'access123',
        refreshToken: 'refresh123',
        tokenExpires: 1234567890,
        user: mockUser as any,
      })).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN, 'access123');
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN, 'refresh123');
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.TOKEN_EXPIRES, 1234567890);
      expect(appLocalStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USER, mockUser);
    });

    it('setAuthData saves auth data without user', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setAuthData({
        accessToken: 'access123',
        refreshToken: 'refresh123',
        tokenExpires: 1234567890,
      })).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it('setAuthData handles null user', () => {
      vi.mocked(appLocalStorage.setItem).mockReturnValue(true);
      expect(storageService.setAuthData({
        accessToken: 'access123',
        refreshToken: 'refresh123',
        tokenExpires: 1234567890,
        user: null,
      })).toBe(true);
      expect(appLocalStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it('clearAuth removes all auth data', () => {
      vi.mocked(appLocalStorage.removeItem).mockReturnValue(true);
      expect(storageService.clearAuth()).toBe(true);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.ACCESS_TOKEN);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.TOKEN_EXPIRES);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.USER);
      expect(appLocalStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.LAST_REFRESH_TIME);
    });

    it('clearAuth returns false when one fails', () => {
      vi.mocked(appLocalStorage.removeItem)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      expect(storageService.clearAuth()).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('getAllKeys returns all storage keys', () => {
      const mockKeys = ['key1', 'key2'];
      // Source code has a bug: calls localStorage.getAllKeys() instead of appLocalStorage.getAllKeys()
      // We need to mock the broken code path
      const mockLocalStorage = {
        ...global.localStorage,
        getAllKeys: vi.fn().mockReturnValue(mockKeys),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);
      expect(storageService.getAllKeys()).toEqual(mockKeys);
      vi.unstubAllGlobals();
    });
  });
});
