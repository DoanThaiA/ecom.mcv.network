/* eslint-disable no-console */
/**
 * SessionStorage Helper Utility
 * Provides type-safe methods for sessionStorage operations
 */

export const sessionStorageKeys = {
  MEMBER_PROMO_DISMISSED: 'member_promo_dismissed',
} as const;

class SessionStorageHelper {
  /**
   * Check if sessionStorage is available
   */
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }

  /**
   * Get item from sessionStorage
   */
  getItem<T = string>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const item = window.sessionStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error getting item from sessionStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item to sessionStorage
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;

    try {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      window.sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting item to sessionStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from sessionStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Check if key exists in sessionStorage
   */
  hasItem(key: string): boolean {
    if (!this.isAvailable()) return false;
    return window.sessionStorage.getItem(key) !== null;
  }

  /**
   * Clear all items from sessionStorage
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionStorage = new SessionStorageHelper();

// Export default instance
export default sessionStorage;
