import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '@/lib/services/storage.service';
import type { User } from '@/types/gen/shared/shared/users/user';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear all storage before each test
    storageService.clearAll();
    vi.clearAllMocks();
  });

  describe('Token Methods', () => {
    it('sets and gets access token', () => {
      const token = 'test-access-token';
      expect(storageService.setToken(token)).toBe(true);
      expect(storageService.getToken()).toBe(token);
    });

    it('checks if token exists', () => {
      expect(storageService.hasToken()).toBe(false);
      storageService.setToken('test-token');
      expect(storageService.hasToken()).toBe(true);
    });

    it('removes token', () => {
      storageService.setToken('test-token');
      expect(storageService.removeToken()).toBe(true);
      expect(storageService.getToken()).toBeNull();
    });
  });

  describe('Refresh Token Methods', () => {
    it('sets and gets refresh token', () => {
      const token = 'test-refresh-token';
      expect(storageService.setRefreshToken(token)).toBe(true);
      expect(storageService.getRefreshToken()).toBe(token);
    });

    it('checks if refresh token exists', () => {
      expect(storageService.hasRefreshToken()).toBe(false);
      storageService.setRefreshToken('test-refresh');
      expect(storageService.hasRefreshToken()).toBe(true);
    });

    it('removes refresh token', () => {
      storageService.setRefreshToken('test-refresh');
      expect(storageService.removeRefreshToken()).toBe(true);
      expect(storageService.getRefreshToken()).toBeNull();
    });
  });

  describe('User Methods', () => {
    const mockUser: User = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
    } as User;

    it('sets and gets user', () => {
      expect(storageService.setUser(mockUser)).toBe(true);
      expect(storageService.getUser()).toEqual(mockUser);
    });

    it('updates user partially', () => {
      storageService.setUser(mockUser);
      expect(storageService.updateUser({ firstName: 'Jane' })).toBe(true);

      const updated = storageService.getUser();
      expect(updated?.firstName).toBe('Jane');
      expect(updated?.lastName).toBe('Doe');
    });

    it('returns false when updating non-existent user', () => {
      expect(storageService.updateUser({ firstName: 'Jane' })).toBe(false);
    });

    it('checks if user exists', () => {
      expect(storageService.hasUser()).toBe(false);
      storageService.setUser(mockUser);
      expect(storageService.hasUser()).toBe(true);
    });

    it('removes user', () => {
      storageService.setUser(mockUser);
      expect(storageService.removeUser()).toBe(true);
      expect(storageService.getUser()).toBeNull();
    });
  });

  describe('Token Expires Methods', () => {
    it('sets and gets token expires', () => {
      const expires = Date.now() + 3600000;
      expect(storageService.setTokenExpires(expires)).toBe(true);
      expect(storageService.getTokenExpires()).toBe(expires);
    });

    it('removes token expires', () => {
      storageService.setTokenExpires(Date.now());
      expect(storageService.removeTokenExpires()).toBe(true);
      expect(storageService.getTokenExpires()).toBeNull();
    });
  });

  describe('Language Methods', () => {
    it('sets and gets language', () => {
      expect(storageService.setLanguage('vi')).toBe(true);
      expect(storageService.getLanguage()).toBe('vi');
    });

    it('removes language', () => {
      storageService.setLanguage('en');
      expect(storageService.removeLanguage()).toBe(true);
      expect(storageService.getLanguage()).toBeNull();
    });
  });

  describe('Auth Methods (Combined)', () => {
    const mockUser: User = { id: '123' } as User;

    it('sets all auth tokens', () => {
      const result = storageService.setAuthTokens(
        'access-token',
        'refresh-token',
        Date.now() + 3600000,
        mockUser
      );
      expect(result).toBe(true);
      expect(storageService.getToken()).toBe('access-token');
      expect(storageService.getRefreshToken()).toBe('refresh-token');
      expect(storageService.getUser()).toEqual(mockUser);
    });

    it('sets auth tokens without expires', () => {
      const result = storageService.setAuthTokens(
        'access',
        'refresh'
      );
      expect(result).toBe(true);
      expect(storageService.getToken()).toBe('access');
    });

    it('clears all auth data', () => {
      storageService.setAuthTokens('access', 'refresh', Date.now(), mockUser);
      expect(storageService.clearAuth()).toBe(true);
      expect(storageService.getToken()).toBeNull();
      expect(storageService.getRefreshToken()).toBeNull();
      expect(storageService.getUser()).toBeNull();
      expect(storageService.getTokenExpires()).toBeNull();
    });

    it('checks if authenticated', () => {
      expect(storageService.isAuthenticated()).toBe(false);
      storageService.setToken('test');
      expect(storageService.isAuthenticated()).toBe(false); // still needs user
      storageService.setUser(mockUser);
      expect(storageService.isAuthenticated()).toBe(true);
    });
  });

  describe('OTP Resend Methods', () => {
    it('sets and gets OTP resend countdown', () => {
      const time = Date.now() + 60000;
      expect(storageService.setOtpResendCountdown(time)).toBe(true);
      expect(storageService.getOtpResendCountdown()).toBe(time);
    });

    it('checks if can resend OTP when no countdown', () => {
      expect(storageService.canResendOtp()).toBe(true);
    });

    it('checks if can resend OTP when countdown active', () => {
      storageService.setOtpResendCountdown(Date.now() + 60000);
      expect(storageService.canResendOtp()).toBe(false);
    });

    it('checks if can resend OTP when countdown expired', () => {
      storageService.setOtpResendCountdown(Date.now() - 1000);
      expect(storageService.canResendOtp()).toBe(true);
    });

    it('gets remaining seconds for OTP resend', () => {
      const future = Date.now() + 30000;
      storageService.setOtpResendCountdown(future);
      const remaining = storageService.getOtpResendRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(30);
    });

    it('returns 0 remaining seconds when no countdown', () => {
      expect(storageService.getOtpResendRemainingSeconds()).toBe(0);
    });

    it('removes OTP resend countdown', () => {
      storageService.setOtpResendCountdown(Date.now());
      expect(storageService.removeOtpResendCountdown()).toBe(true);
      expect(storageService.getOtpResendCountdown()).toBeNull();
    });
  });

  describe('Login Attempt Tracking Methods', () => {
    it('gets login failed attempts (default 0)', () => {
      expect(storageService.getLoginFailedAttempts()).toBe(0);
    });

    it('increments login failed attempts', () => {
      expect(storageService.incrementLoginFailedAttempts()).toBe(1);
      expect(storageService.incrementLoginFailedAttempts()).toBe(2);
      expect(storageService.getLoginFailedAttempts()).toBe(2);
    });

    it('resets login failed attempts', () => {
      storageService.incrementLoginFailedAttempts();
      expect(storageService.resetLoginFailedAttempts()).toBe(true);
      expect(storageService.getLoginFailedAttempts()).toBe(0);
    });
  });

  describe('Login Lockout Methods', () => {
    it('sets and gets login lockout', () => {
      const time = Date.now() + 300000;
      expect(storageService.setLoginLockout(time)).toBe(true);
      expect(storageService.getLoginLockoutUntil()).toBe(time);
    });

    it('checks if login is locked', () => {
      storageService.setLoginLockout(Date.now() + 60000);
      expect(storageService.isLoginLocked()).toBe(true);
    });

    it('auto-clears expired lockout', () => {
      storageService.setLoginLockout(Date.now() - 1000);
      storageService.incrementLoginFailedAttempts();
      expect(storageService.isLoginLocked()).toBe(false);
      expect(storageService.getLoginFailedAttempts()).toBe(0);
    });

    it('gets lockout remaining seconds', () => {
      const future = Date.now() + 120000;
      storageService.setLoginLockout(future);
      const remaining = storageService.getLockoutRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(120);
    });

    it('clears login lockout', () => {
      storageService.setLoginLockout(Date.now());
      expect(storageService.clearLoginLockout()).toBe(true);
      expect(storageService.getLoginLockoutUntil()).toBeNull();
    });
  });

  describe('Captcha Countdown Methods', () => {
    it('sets and gets captcha countdown', () => {
      const time = Date.now() + 30000;
      expect(storageService.setCaptchaCountdown(time)).toBe(true);
      expect(storageService.getCaptchaCountdownUntil()).toBe(time);
    });

    it('checks if captcha countdown is active', () => {
      storageService.setCaptchaCountdown(Date.now() + 30000);
      expect(storageService.isCaptchaCountdownActive()).toBe(true);
    });

    it('auto-clears expired captcha countdown', () => {
      storageService.setCaptchaCountdown(Date.now() - 1000);
      storageService.incrementLoginFailedAttempts();
      expect(storageService.isCaptchaCountdownActive()).toBe(false);
      expect(storageService.getLoginFailedAttempts()).toBe(0);
    });

    it('gets captcha remaining seconds', () => {
      const future = Date.now() + 45000;
      storageService.setCaptchaCountdown(future);
      const remaining = storageService.getCaptchaRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(45);
    });

    it('clears captcha countdown', () => {
      storageService.setCaptchaCountdown(Date.now());
      expect(storageService.clearCaptchaCountdown()).toBe(true);
      expect(storageService.getCaptchaCountdownUntil()).toBeNull();
    });
  });

  describe('OTP Verify Lockout Methods', () => {
    it('gets OTP verify failed attempts (default 0)', () => {
      expect(storageService.getOtpVerifyFailedAttempts()).toBe(0);
    });

    it('increments OTP verify failed attempts', () => {
      expect(storageService.incrementOtpVerifyFailedAttempts()).toBe(1);
      expect(storageService.incrementOtpVerifyFailedAttempts()).toBe(2);
    });

    it('resets OTP verify failed attempts', () => {
      storageService.incrementOtpVerifyFailedAttempts();
      expect(storageService.resetOtpVerifyFailedAttempts()).toBe(true);
      expect(storageService.getOtpVerifyFailedAttempts()).toBe(0);
    });

    it('checks if OTP verify is locked', () => {
      storageService.setOtpVerifyLockout(Date.now() + 60000);
      expect(storageService.isOtpVerifyLocked()).toBe(true);
    });

    it('auto-clears expired OTP verify lockout', () => {
      storageService.setOtpVerifyLockout(Date.now() - 1000);
      storageService.incrementOtpVerifyFailedAttempts();
      expect(storageService.isOtpVerifyLocked()).toBe(false);
      expect(storageService.getOtpVerifyFailedAttempts()).toBe(0);
    });

    it('gets OTP verify lockout remaining seconds', () => {
      const future = Date.now() + 90000;
      storageService.setOtpVerifyLockout(future);
      const remaining = storageService.getOtpVerifyLockoutRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(90);
    });
  });

  describe('X Session ID Methods', () => {
    it('generates and persists x-session-id', () => {
      const sessionId1 = storageService.getXSessionId();
      expect(sessionId1).toBeTruthy();
      expect(typeof sessionId1).toBe('string');

      const sessionId2 = storageService.getXSessionId();
      expect(sessionId2).toBe(sessionId1); // Should return same ID
    });
  });

  describe('Shipping Address Methods', () => {
    const mockAddress = {
      fullName: 'John Doe',
      phone: '0123456789',
      email: 'john@example.com',
      notes: 'Leave at door',
      street: '123 Main St',
      city: 'city-1',
      cityName: 'Ho Chi Minh',
      district: 'dist-1',
      districtName: 'District 1',
      ward: 'ward-1',
      wardName: 'Ward 1',
      isDefault: false,
    };

    it('gets empty addresses by default', () => {
      expect(storageService.getShippingAddresses()).toEqual([]);
      expect(storageService.hasShippingAddresses()).toBe(false);
    });

    it('adds new shipping address', () => {
      const added = storageService.addShippingAddress(mockAddress);
      expect(added).toHaveProperty('id');
      expect(added.fullName).toBe(mockAddress.fullName);
      expect(storageService.hasShippingAddresses()).toBe(true);
    });

    it('sets new address as default and unsets others', () => {
      storageService.addShippingAddress({ ...mockAddress, isDefault: true });
      const added = storageService.addShippingAddress({ ...mockAddress, isDefault: true });

      const addresses = storageService.getShippingAddresses();
      const defaultAddresses = addresses.filter(a => a.isDefault);
      expect(defaultAddresses).toHaveLength(1);
      expect(defaultAddresses[0].id).toBe(added.id);
    });

    it('updates shipping address', () => {
      const added = storageService.addShippingAddress(mockAddress);
      const result = storageService.updateShippingAddress(added.id, { fullName: 'Jane Doe' });

      expect(result).toBe(true);
      const addresses = storageService.getShippingAddresses();
      expect(addresses[0].fullName).toBe('Jane Doe');
    });

    it('returns false when updating non-existent address', () => {
      expect(storageService.updateShippingAddress('invalid-id', { fullName: 'Test' })).toBe(false);
    });

    it('deletes shipping address', () => {
      const added = storageService.addShippingAddress(mockAddress);
      expect(storageService.deleteShippingAddress(added.id)).toBe(true);
      expect(storageService.getShippingAddresses()).toHaveLength(0);
    });

    it('returns false when deleting non-existent address', () => {
      expect(storageService.deleteShippingAddress('invalid-id')).toBe(false);
    });

    it('gets default shipping address', () => {
      storageService.addShippingAddress(mockAddress);
      storageService.addShippingAddress({ ...mockAddress, isDefault: true });

      const defaultAddr = storageService.getDefaultShippingAddress();
      expect(defaultAddr?.isDefault).toBe(true);
    });

    it('returns first address when no default is set', () => {
      storageService.addShippingAddress(mockAddress);
      const defaultAddr = storageService.getDefaultShippingAddress();
      expect(defaultAddr).toBeTruthy();
    });

    it('sets address as default', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01'));

      const addr1 = storageService.addShippingAddress({ ...mockAddress, isDefault: true, street: '123 First St' });

      // Advance time by 1ms to ensure unique ID
      vi.advanceTimersByTime(1);
      const addr2 = storageService.addShippingAddress({ ...mockAddress, street: '456 Second St' });

      expect(storageService.setDefaultShippingAddress(addr2.id)).toBe(true);
      const addresses = storageService.getShippingAddresses();
      expect(addresses.find(a => a.id === addr2.id)?.isDefault).toBe(true);
      expect(addresses.find(a => a.id === addr1.id)?.isDefault).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Member Promo Methods (Session Storage)', () => {
    it('checks if member promo is dismissed', () => {
      expect(storageService.isMemberPromoDismissed()).toBe(false);
    });

    it('sets member promo as dismissed', () => {
      expect(storageService.setMemberPromoDismissed()).toBe(true);
      expect(storageService.isMemberPromoDismissed()).toBe(true);
    });

    it('clears member promo dismissed', () => {
      storageService.setMemberPromoDismissed();
      expect(storageService.clearMemberPromoDismissed()).toBe(true);
      expect(storageService.isMemberPromoDismissed()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('clears all storage', () => {
      storageService.setToken('test');
      storageService.setUser({ id: '1' } as User);
      expect(storageService.clearAll()).toBe(true);
      expect(storageService.getToken()).toBeNull();
      expect(storageService.getUser()).toBeNull();
    });

    it('gets all storage keys', () => {
      storageService.setToken('test');
      storageService.setLanguage('vi');
      const keys = storageService.getAllKeys();
      expect(keys.length).toBeGreaterThan(0);
    });
  });
});
