import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';

describe('localStorage service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('localStorageKeys', () => {
    it('exports all required keys', () => {
      expect(localStorageKeys.ACCESS_TOKEN).toBe('access_token');
      expect(localStorageKeys.REFRESH_TOKEN).toBe('refresh_token');
      expect(localStorageKeys.TOKEN_EXPIRES).toBe('token_expires');
      expect(localStorageKeys.LAST_REFRESH_TIME).toBe('last_refresh_time');
      expect(localStorageKeys.USER).toBe('user');
      expect(localStorageKeys.LANGUAGE).toBe('language');
      expect(localStorageKeys.COLUMN_VISIBILITY).toBe('column_visibility');
    });
  });

  describe('getItem', () => {
    it('returns null for non-existent key', () => {
      expect(appLocalStorage.getItem('non_existent')).toBeNull();
    });

    it('returns parsed JSON object', () => {
      localStorage.setItem('test', JSON.stringify({ foo: 'bar' }));
      expect(appLocalStorage.getItem('test')).toEqual({ foo: 'bar' });
    });

    it('returns string value', () => {
      localStorage.setItem('test', 'plain_string');
      expect(appLocalStorage.getItem('test')).toBe('plain_string');
    });

    it('returns null when localStorage is unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.getItem('test')).toBeNull();
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('setItem', () => {
    it('sets string value', () => {
      expect(appLocalStorage.setItem('test', 'value')).toBe(true);
      expect(localStorage.getItem('test')).toBe('value');
    });

    it('sets object value as JSON', () => {
      expect(appLocalStorage.setItem('test', { foo: 'bar' })).toBe(true);
      expect(localStorage.getItem('test')).toBe('{"foo":"bar"}');
    });

    it('returns false when localStorage unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.setItem('test', 'value')).toBe(false);
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('removeItem', () => {
    it('removes item from localStorage', () => {
      localStorage.setItem('test', 'value');
      expect(appLocalStorage.removeItem('test')).toBe(true);
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('returns false when localStorage unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.removeItem('test')).toBe(false);
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('clear', () => {
    it('clears all items', () => {
      localStorage.setItem('test1', 'value1');
      localStorage.setItem('test2', 'value2');
      expect(appLocalStorage.clear()).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('returns false when localStorage unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.clear()).toBe(false);
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('hasItem', () => {
    it('returns true for existing key', () => {
      localStorage.setItem('test', 'value');
      expect(appLocalStorage.hasItem('test')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      expect(appLocalStorage.hasItem('non_existent')).toBe(false);
    });

    it('returns false when localStorage unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.hasItem('test')).toBe(false);
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('getAllKeys', () => {
    it('returns all keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      expect(appLocalStorage.getAllKeys()).toEqual(['key1', 'key2']);
    });

    it('returns empty array when no keys', () => {
      expect(appLocalStorage.getAllKeys()).toEqual([]);
    });

    it('returns empty array when localStorage unavailable', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
      expect(appLocalStorage.getAllKeys()).toEqual([]);
      Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, writable: true });
    });
  });

  describe('getItems', () => {
    it('returns multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', JSON.stringify({ foo: 'bar' }));
      const result = appLocalStorage.getItems(['key1', 'key2']);
      expect(result).toEqual({ key1: 'value1', key2: { foo: 'bar' } });
    });

    it('returns null for non-existent keys', () => {
      localStorage.setItem('key1', 'value1');
      const result = appLocalStorage.getItems(['key1', 'non_existent']);
      expect(result).toEqual({ key1: 'value1', non_existent: null });
    });
  });

  describe('setItems', () => {
    it('sets multiple items', () => {
      expect(appLocalStorage.setItems({ key1: 'value1', key2: { foo: 'bar' } })).toBe(true);
      expect(localStorage.getItem('key1')).toBe('value1');
      expect(localStorage.getItem('key2')).toBe('{"foo":"bar"}');
    });

    it('handles empty object', () => {
      expect(appLocalStorage.setItems({})).toBe(true);
    });
  });

  describe('removeItems', () => {
    it('removes multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      expect(appLocalStorage.removeItems(['key1', 'key2'])).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });

    it('handles empty array', () => {
      expect(appLocalStorage.removeItems([])).toBe(true);
    });
  });
});
