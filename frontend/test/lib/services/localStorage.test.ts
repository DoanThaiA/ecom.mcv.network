import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localStorage, localStorageKeys } from '@/lib/services/localStorage';

describe('localStorageKeys', () => {
  it('exports all required keys', () => {
    expect(localStorageKeys.ACCESS_TOKEN).toBe('access_token');
    expect(localStorageKeys.REFRESH_TOKEN).toBe('refresh_token');
    expect(localStorageKeys.TOKEN_EXPIRES).toBe('token_expires');
    expect(localStorageKeys.USER).toBe('user');
    expect(localStorageKeys.LANGUAGE).toBe('language');
    expect(localStorageKeys.OTP_RESEND_COUNTDOWN).toBe('otp_resend_countdown');
    expect(localStorageKeys.LOGIN_FAILED_ATTEMPTS).toBe('login_failed_attempts');
    expect(localStorageKeys.LOGIN_LOCKOUT_UNTIL).toBe('login_lockout_until');
    expect(localStorageKeys.LOGIN_CAPTCHA_UNTIL).toBe('login_captcha_until');
    expect(localStorageKeys.OTP_VERIFY_FAILED_ATTEMPTS).toBe('otp_verify_failed_attempts');
    expect(localStorageKeys.OTP_VERIFY_LOCKOUT_UNTIL).toBe('otp_verify_lockout_until');
    expect(localStorageKeys.X_SESSION_ID).toBe('x_session_id');
    expect(localStorageKeys.SHIPPING_ADDRESSES).toBe('shipping_addresses');
  });
});

describe('LocalStorageHelper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getItem', () => {
    it('retrieves string value', () => {
      window.localStorage.setItem('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('retrieves and parses JSON object', () => {
      const obj = { name: 'John', age: 30 };
      window.localStorage.setItem('test-obj', JSON.stringify(obj));
      expect(localStorage.getItem('test-obj')).toEqual(obj);
    });

    it('returns null for non-existent key', () => {
      expect(localStorage.getItem('non-existent')).toBeNull();
    });

    it('retrieves number as number', () => {
      window.localStorage.setItem('test-num', '123');
      expect(localStorage.getItem<number>('test-num')).toBe(123);
    });

    it('retrieves boolean as boolean', () => {
      window.localStorage.setItem('test-bool', 'true');
      expect(localStorage.getItem<boolean>('test-bool')).toBe(true);
    });

    it('returns string if JSON parse fails', () => {
      window.localStorage.setItem('test-invalid-json', 'not-json{');
      expect(localStorage.getItem('test-invalid-json')).toBe('not-json{');
    });
  });

  describe('setItem', () => {
    it('sets string value', () => {
      expect(localStorage.setItem('test-key', 'test-value')).toBe(true);
      expect(window.localStorage.getItem('test-key')).toBe('test-value');
    });

    it('sets and serializes object', () => {
      const obj = { name: 'John', age: 30 };
      expect(localStorage.setItem('test-obj', obj)).toBe(true);
      expect(JSON.parse(window.localStorage.getItem('test-obj')!)).toEqual(obj);
    });

    it('sets number', () => {
      expect(localStorage.setItem('test-num', 123)).toBe(true);
      expect(window.localStorage.getItem('test-num')).toBe('123');
    });

    it('sets boolean', () => {
      expect(localStorage.setItem('test-bool', true)).toBe(true);
      expect(window.localStorage.getItem('test-bool')).toBe('true');
    });

    it('sets array', () => {
      const arr = [1, 2, 3];
      expect(localStorage.setItem('test-arr', arr)).toBe(true);
      expect(JSON.parse(window.localStorage.getItem('test-arr')!)).toEqual(arr);
    });

    it('overwrites existing value', () => {
      localStorage.setItem('test-key', 'old-value');
      localStorage.setItem('test-key', 'new-value');
      expect(localStorage.getItem('test-key')).toBe('new-value');
    });
  });

  describe('removeItem', () => {
    it('removes existing item', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(localStorage.removeItem('test-key')).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('returns true even if item does not exist', () => {
      expect(localStorage.removeItem('non-existent')).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      expect(localStorage.clear()).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });

    it('returns true even if storage is empty', () => {
      expect(localStorage.clear()).toBe(true);
    });
  });

  describe('hasItem', () => {
    it('returns true for existing item', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(localStorage.hasItem('test-key')).toBe(true);
    });

    it('returns false for non-existent item', () => {
      expect(localStorage.hasItem('non-existent')).toBe(false);
    });

    it('returns true even if value is empty string', () => {
      window.localStorage.setItem('empty-key', '');
      expect(localStorage.hasItem('empty-key')).toBe(true);
    });
  });

  describe('getAllKeys', () => {
    it('returns all keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
      const keys = localStorage.getAllKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('returns empty array when storage is empty', () => {
      expect(localStorage.getAllKeys()).toEqual([]);
    });
  });

  describe('getItems', () => {
    it('retrieves multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      const items = localStorage.getItems(['key1', 'key2']);
      expect(items).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('returns null for non-existent keys', () => {
      localStorage.setItem('key1', 'value1');
      const items = localStorage.getItems(['key1', 'key2']);
      expect(items).toEqual({
        key1: 'value1',
        key2: null,
      });
    });

    it('handles empty keys array', () => {
      const items = localStorage.getItems([]);
      expect(items).toEqual({});
    });
  });

  describe('setItems', () => {
    it('sets multiple items', () => {
      expect(localStorage.setItems({
        key1: 'value1',
        key2: 'value2',
        key3: 123,
      })).toBe(true);
      expect(localStorage.getItem('key1')).toBe('value1');
      expect(localStorage.getItem('key2')).toBe('value2');
      expect(localStorage.getItem<number>('key3')).toBe(123);
    });

    it('handles empty object', () => {
      expect(localStorage.setItems({})).toBe(true);
    });

    it('overwrites existing values', () => {
      localStorage.setItem('key1', 'old-value');
      localStorage.setItems({ key1: 'new-value' });
      expect(localStorage.getItem('key1')).toBe('new-value');
    });
  });

  describe('removeItems', () => {
    it('removes multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
      expect(localStorage.removeItems(['key1', 'key2'])).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBe('value3');
    });

    it('handles empty keys array', () => {
      expect(localStorage.removeItems([])).toBe(true);
    });

    it('returns true even if keys do not exist', () => {
      expect(localStorage.removeItems(['non-existent1', 'non-existent2'])).toBe(true);
    });
  });
});
