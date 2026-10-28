import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionStorage, sessionStorageKeys } from '@/lib/services/sessionStorage';

describe('sessionStorageKeys', () => {
  it('exports required keys', () => {
    expect(sessionStorageKeys.MEMBER_PROMO_DISMISSED).toBe('member_promo_dismissed');
  });
});

describe('SessionStorageHelper', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('getItem', () => {
    it('retrieves string value', () => {
      window.sessionStorage.setItem('test-key', 'test-value');
      expect(sessionStorage.getItem('test-key')).toBe('test-value');
    });

    it('retrieves and parses JSON object', () => {
      const obj = { name: 'John', age: 30 };
      window.sessionStorage.setItem('test-obj', JSON.stringify(obj));
      expect(sessionStorage.getItem('test-obj')).toEqual(obj);
    });

    it('returns null for non-existent key', () => {
      expect(sessionStorage.getItem('non-existent')).toBeNull();
    });

    it('retrieves number as number', () => {
      window.sessionStorage.setItem('test-num', '123');
      expect(sessionStorage.getItem<number>('test-num')).toBe(123);
    });

    it('retrieves boolean as boolean', () => {
      window.sessionStorage.setItem('test-bool', 'true');
      expect(sessionStorage.getItem<boolean>('test-bool')).toBe(true);
    });

    it('returns string if JSON parse fails', () => {
      window.sessionStorage.setItem('test-invalid-json', 'not-json{');
      expect(sessionStorage.getItem('test-invalid-json')).toBe('not-json{');
    });
  });

  describe('setItem', () => {
    it('sets string value', () => {
      expect(sessionStorage.setItem('test-key', 'test-value')).toBe(true);
      expect(window.sessionStorage.getItem('test-key')).toBe('test-value');
    });

    it('sets and serializes object', () => {
      const obj = { name: 'John', age: 30 };
      expect(sessionStorage.setItem('test-obj', obj)).toBe(true);
      expect(JSON.parse(window.sessionStorage.getItem('test-obj')!)).toEqual(obj);
    });

    it('sets number', () => {
      expect(sessionStorage.setItem('test-num', 123)).toBe(true);
      expect(window.sessionStorage.getItem('test-num')).toBe('123');
    });

    it('sets boolean', () => {
      expect(sessionStorage.setItem('test-bool', true)).toBe(true);
      expect(window.sessionStorage.getItem('test-bool')).toBe('true');
    });

    it('sets array', () => {
      const arr = [1, 2, 3];
      expect(sessionStorage.setItem('test-arr', arr)).toBe(true);
      expect(JSON.parse(window.sessionStorage.getItem('test-arr')!)).toEqual(arr);
    });

    it('overwrites existing value', () => {
      sessionStorage.setItem('test-key', 'old-value');
      sessionStorage.setItem('test-key', 'new-value');
      expect(sessionStorage.getItem('test-key')).toBe('new-value');
    });
  });

  describe('removeItem', () => {
    it('removes existing item', () => {
      sessionStorage.setItem('test-key', 'test-value');
      expect(sessionStorage.removeItem('test-key')).toBe(true);
      expect(sessionStorage.getItem('test-key')).toBeNull();
    });

    it('returns true even if item does not exist', () => {
      expect(sessionStorage.removeItem('non-existent')).toBe(true);
    });
  });

  describe('hasItem', () => {
    it('returns true for existing item', () => {
      sessionStorage.setItem('test-key', 'test-value');
      expect(sessionStorage.hasItem('test-key')).toBe(true);
    });

    it('returns false for non-existent item', () => {
      expect(sessionStorage.hasItem('non-existent')).toBe(false);
    });

    it('returns true even if value is empty string', () => {
      window.sessionStorage.setItem('empty-key', '');
      expect(sessionStorage.hasItem('empty-key')).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all items', () => {
      sessionStorage.setItem('key1', 'value1');
      sessionStorage.setItem('key2', 'value2');
      expect(sessionStorage.clear()).toBe(true);
      expect(sessionStorage.getItem('key1')).toBeNull();
      expect(sessionStorage.getItem('key2')).toBeNull();
    });

    it('returns true even if storage is empty', () => {
      expect(sessionStorage.clear()).toBe(true);
    });
  });
});
