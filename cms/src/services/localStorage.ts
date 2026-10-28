/* eslint-disable no-console */
/**
 * LocalStorage Helper Utility
 * Provides type-safe methods for localStorage operations
 */

export const localStorageKeys = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES: 'token_expires',
  LAST_REFRESH_TIME: 'last_refresh_time',
  USER: 'user',
  LANGUAGE: 'language',
  COLUMN_VISIBILITY: 'column_visibility',
} as const;

class LocalStorageHelper {
  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Get item from localStorage
   */
  getItem<T = string>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item to localStorage
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   */
  hasItem(key: string): boolean {
    if (!this.isAvailable()) return false;
    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  getAllKeys(): string[] {
    if (!this.isAvailable()) return [];

    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * Get multiple items at once
   */
  getItems<T = string>(keys: string[]): Record<string, T | null> {
    const items: Record<string, T | null> = {};
    keys.forEach((key) => {
      items[key] = this.getItem<T>(key);
    });
    return items;
  }

  /**
   * Set multiple items at once
   */
  setItems(items: Record<string, unknown>): boolean {
    try {
      Object.entries(items).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error setting multiple items to localStorage', error);
      return false;
    }
  }

  /**
   * Remove multiple items at once
   */
  removeItems(keys: string[]): boolean {
    try {
      keys.forEach((key) => {
        this.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error removing multiple items from localStorage', error);
      return false;
    }
  }
}

// Export singleton instance
export const appLocalStorage = new LocalStorageHelper();

// Export default instance
export default appLocalStorage;
