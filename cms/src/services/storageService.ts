/**
 * Storage Service
 * Type-safe wrapper around localStorage with pre-defined methods
 */

import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';
import type { CmsUser } from 'src/types/gen/cms/cms/cms-users/cms-user';

// Type alias for backward compatibility
type User = CmsUser;

class StorageService {
  // ==================== TOKEN METHODS ====================

  /**
   * Get access token
   */
  getToken(): string | null {
    return appLocalStorage.getItem<string>(localStorageKeys.ACCESS_TOKEN);
  }

  /**
   * Set access token
   */
  setToken(token: string): boolean {
    return appLocalStorage.setItem(localStorageKeys.ACCESS_TOKEN, token);
  }

  /**
   * Remove access token
   */
  removeToken(): boolean {
    return appLocalStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
  }

  /**
   * Check if access token exists
   */
  hasToken(): boolean {
    return appLocalStorage.hasItem(localStorageKeys.ACCESS_TOKEN);
  }

  // ==================== REFRESH TOKEN METHODS ====================

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return appLocalStorage.getItem<string>(localStorageKeys.REFRESH_TOKEN);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): boolean {
    return appLocalStorage.setItem(localStorageKeys.REFRESH_TOKEN, token);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): boolean {
    return appLocalStorage.removeItem(localStorageKeys.REFRESH_TOKEN);
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return appLocalStorage.hasItem(localStorageKeys.REFRESH_TOKEN);
  }

  // ==================== TOKEN EXPIRES METHODS ====================

  /**
   * Get token expiration timestamp
   */
  getTokenExpires(): number | null {
    return appLocalStorage.getItem<number>(localStorageKeys.TOKEN_EXPIRES);
  }

  /**
   * Set token expiration timestamp
   */
  setTokenExpires(expires: number): boolean {
    return appLocalStorage.setItem(localStorageKeys.TOKEN_EXPIRES, expires);
  }

  /**
   * Remove token expiration
   */
  removeTokenExpires(): boolean {
    return appLocalStorage.removeItem(localStorageKeys.TOKEN_EXPIRES);
  }

  // ==================== LAST REFRESH TIME METHODS ====================

  /**
   * Get last refresh timestamp
   */
  getLastRefreshTime(): number | null {
    return appLocalStorage.getItem<number>(localStorageKeys.LAST_REFRESH_TIME);
  }

  /**
   * Set last refresh timestamp
   */
  setLastRefreshTime(timestamp: number = Date.now()): boolean {
    return appLocalStorage.setItem(localStorageKeys.LAST_REFRESH_TIME, timestamp);
  }

  /**
   * Remove last refresh timestamp
   */
  removeLastRefreshTime(): boolean {
    return appLocalStorage.removeItem(localStorageKeys.LAST_REFRESH_TIME);
  }

  /**
   * Check if proactive refresh is needed (> 12 hours since last refresh)
   */
  needsProactiveRefresh(): boolean {
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

    if (!this.hasRefreshToken()) return false;

    const lastRefreshTime = this.getLastRefreshTime();
    if (!lastRefreshTime) return true; // Chưa từng refresh

    return Date.now() - lastRefreshTime >= TWELVE_HOURS_MS;
  }

  // ==================== USER METHODS ====================

  /**
   * Get user data
   */
  getUser(): User | null {
    return appLocalStorage.getItem<User>(localStorageKeys.USER);
  }

  /**
   * Set user data
   */
  setUser(user: User): boolean {
    return appLocalStorage.setItem(localStorageKeys.USER, user);
  }

  /**
   * Update user data (partial update)
   */
  updateUser(updates: Partial<User>): boolean {
    const currentUser = this.getUser();
    if (!currentUser) return false;

    const updatedUser = { ...currentUser, ...updates };
    return this.setUser(updatedUser);
  }

  /**
   * Remove user data
   */
  removeUser(): boolean {
    return appLocalStorage.removeItem(localStorageKeys.USER);
  }

  /**
   * Check if user exists
   */
  hasUser(): boolean {
    return appLocalStorage.hasItem(localStorageKeys.USER);
  }

  // ==================== AUTH METHODS (Combined) ====================

  /**
   * Set auth tokens (access + refresh)
   */
  setAuthTokens(accessToken: string, refreshToken: string): boolean {
    const success1 = this.setToken(accessToken);
    const success2 = this.setRefreshToken(refreshToken);
    return success1 && success2;
  }

  /**
   * Set full auth data (tokens + user + expires)
   */
  setAuthData(data: {
    accessToken: string;
    refreshToken: string;
    tokenExpires: number;
    user?: User | undefined | null;
  }): boolean {
    const user = data.user;
    const success1 = this.setToken(data.accessToken);
    const success2 = this.setRefreshToken(data.refreshToken);
    const success3 = this.setTokenExpires(data.tokenExpires);
    if (user) {
      this.setUser(user);
    }
    return success1 && success2 && success3;
  }

  /**
   * Clear all auth data (tokens + user + expires + lastRefreshTime)
   */
  clearAuth(): boolean {
    const success1 = this.removeToken();
    const success2 = this.removeRefreshToken();
    const success3 = this.removeTokenExpires();
    const success4 = this.removeUser();
    const success5 = this.removeLastRefreshTime();
    return success1 && success2 && success3 && success4 && success5;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all storage keys
   */
  getAllKeys(): string[] {
    return localStorage.getAllKeys();
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export default
export default storageService;
