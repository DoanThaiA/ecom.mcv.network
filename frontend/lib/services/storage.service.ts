/**
 * Storage Service
 * Type-safe wrapper around localStorage with pre-defined methods
 */

import { v4 as uuidv4 } from 'uuid';

import { localStorage, localStorageKeys } from '@/lib/services/localStorage';
import { sessionStorage, sessionStorageKeys } from '@/lib/services/sessionStorage';
import type { User } from '@/types/gen/shared/shared/users/user';

import type { Product } from '@/types/gen/shared/shared/products/product';

export interface RecentlyViewedProduct {
  product: Product;
  viewedAt: number;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  street: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  ward: string;
  wardName: string;
  isDefault: boolean;
}

class StorageService {
  // ==================== TOKEN METHODS ====================

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem<string>(localStorageKeys.ACCESS_TOKEN);
  }

  /**
   * Set access token
   */
  setToken(token: string): boolean {
    return localStorage.setItem(localStorageKeys.ACCESS_TOKEN, token);
  }

  /**
   * Remove access token
   */
  removeToken(): boolean {
    return localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
  }

  /**
   * Check if access token exists
   */
  hasToken(): boolean {
    return localStorage.hasItem(localStorageKeys.ACCESS_TOKEN);
  }

  // ==================== REFRESH TOKEN METHODS ====================

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem<string>(localStorageKeys.REFRESH_TOKEN);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): boolean {
    return localStorage.setItem(localStorageKeys.REFRESH_TOKEN, token);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): boolean {
    return localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return localStorage.hasItem(localStorageKeys.REFRESH_TOKEN);
  }

  // ==================== USER METHODS ====================

  /**
   * Get user data
   */
  getUser(): User | null {
    return localStorage.getItem<User>(localStorageKeys.USER);
  }

  /**
   * Set user data
   */
  setUser(user: User): boolean {
    return localStorage.setItem(localStorageKeys.USER, user);
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
    return localStorage.removeItem(localStorageKeys.USER);
  }

  /**
   * Check if user exists
   */
  hasUser(): boolean {
    return localStorage.hasItem(localStorageKeys.USER);
  }

  // ==================== TOKEN EXPIRES METHODS ====================

  /**
   * Get token expires
   */
  getTokenExpires(): number | null {
    return localStorage.getItem<number>(localStorageKeys.TOKEN_EXPIRES);
  }

  /**
   * Set token expires
   */
  setTokenExpires(tokenExpires: number): boolean {
    return localStorage.setItem(localStorageKeys.TOKEN_EXPIRES, tokenExpires);
  }

  /**
   * Remove token expires
   */
  removeTokenExpires(): boolean {
    return localStorage.removeItem(localStorageKeys.TOKEN_EXPIRES);
  }

  // ==================== LANGUAGE METHODS ====================

  /**
   * Get language preference
   */
  getLanguage(): string | null {
    return localStorage.getItem<string>(localStorageKeys.LANGUAGE);
  }

  /**
   * Set language preference
   */
  setLanguage(language: string): boolean {
    return localStorage.setItem(localStorageKeys.LANGUAGE, language);
  }

  /**
   * Remove language preference
   */
  removeLanguage(): boolean {
    return localStorage.removeItem(localStorageKeys.LANGUAGE);
  }

  // ==================== AUTH METHODS (Combined) ====================

  /**
   * Set auth tokens (access + refresh + expires)
   */
  setAuthTokens(
    accessToken: string,
    refreshToken: string,
    tokenExpires?: number,
    user?: User | undefined,
  ): boolean {
    const success1 = this.setToken(accessToken);
    const success2 = this.setRefreshToken(refreshToken);
    const success3 = tokenExpires
      ? this.setTokenExpires(tokenExpires)
      : true;
    if(user)
      this.setUser(user);
    return success1 && success2 && success3;
  }

  /**
   * Clear all auth data (tokens + user + expires + checkout session)
   */
  clearAuth(): boolean {
    const success1 = this.removeToken();
    const success2 = this.removeRefreshToken();
    const success3 = this.removeUser();
    const success4 = this.removeTokenExpires();
    this.clearCheckoutSession();
    return success1 && success2 && success3 && success4;
  }

  /**
   * Check if user is authenticated (has token and user data)
   */
  isAuthenticated(): boolean {
    return this.hasToken() && this.hasUser();
  }

  // ==================== OTP RESEND COUNTDOWN METHODS ====================

  /**
   * Get OTP resend countdown timestamp
   */
  getOtpResendCountdown(): number | null {
    return localStorage.getItem<number>(localStorageKeys.OTP_RESEND_COUNTDOWN);
  }

  /**
   * Set OTP resend countdown timestamp
   */
  setOtpResendCountdown(timestamp: number): boolean {
    return localStorage.setItem(localStorageKeys.OTP_RESEND_COUNTDOWN, timestamp);
  }

  /**
   * Remove OTP resend countdown
   */
  removeOtpResendCountdown(): boolean {
    return localStorage.removeItem(localStorageKeys.OTP_RESEND_COUNTDOWN);
  }

  /**
   * Check if OTP resend is allowed (countdown expired)
   */
  canResendOtp(): boolean {
    const countdown = this.getOtpResendCountdown();
    if (!countdown) return true;

    const now = Date.now();
    return now >= countdown;
  }

  /**
   * Get remaining seconds for OTP resend countdown
   */
  getOtpResendRemainingSeconds(): number {
    const countdown = this.getOtpResendCountdown();
    if (!countdown) return 0;

    const now = Date.now();
    const remaining = Math.ceil((countdown - now) / 1000);
    return Math.max(0, remaining);
  }

  // ==================== LOGIN ATTEMPT TRACKING METHODS ====================

  /**
   * Get login failed attempts count
   */
  getLoginFailedAttempts(): number {
    return localStorage.getItem<number>(localStorageKeys.LOGIN_FAILED_ATTEMPTS) || 0;
  }

  /**
   * Increment login failed attempts
   * @returns The new attempt count
   */
  incrementLoginFailedAttempts(): number {
    const currentAttempts = this.getLoginFailedAttempts();
    const newAttempts = currentAttempts + 1;
    localStorage.setItem(localStorageKeys.LOGIN_FAILED_ATTEMPTS, newAttempts);
    return newAttempts;
  }

  /**
   * Reset login failed attempts
   */
  resetLoginFailedAttempts(): boolean {
    return localStorage.removeItem(localStorageKeys.LOGIN_FAILED_ATTEMPTS);
  }

  // ==================== LOGIN LOCKOUT METHODS ====================

  /**
   * Get login lockout until timestamp
   */
  getLoginLockoutUntil(): number | null {
    return localStorage.getItem<number>(localStorageKeys.LOGIN_LOCKOUT_UNTIL);
  }

  /**
   * Set login lockout until timestamp
   */
  setLoginLockout(timestamp: number): boolean {
    return localStorage.setItem(localStorageKeys.LOGIN_LOCKOUT_UNTIL, timestamp);
  }

  /**
   * Clear login lockout
   */
  clearLoginLockout(): boolean {
    return localStorage.removeItem(localStorageKeys.LOGIN_LOCKOUT_UNTIL);
  }

  /**
   * Check if login is currently locked
   */
  isLoginLocked(): boolean {
    const lockoutUntil = this.getLoginLockoutUntil();
    if (!lockoutUntil) return false;

    const now = Date.now();
    if (now >= lockoutUntil) {
      // Lockout expired, clear it
      this.clearLoginLockout();
      this.resetLoginFailedAttempts();
      return false;
    }
    return true;
  }

  /**
   * Get remaining seconds for login lockout
   */
  getLockoutRemainingSeconds(): number {
    const lockoutUntil = this.getLoginLockoutUntil();
    if (!lockoutUntil) return 0;

    const now = Date.now();
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    return Math.max(0, remaining);
  }

  // ==================== CAPTCHA COUNTDOWN METHODS ====================

  /**
   * Get captcha countdown until timestamp
   */
  getCaptchaCountdownUntil(): number | null {
    return localStorage.getItem<number>(localStorageKeys.LOGIN_CAPTCHA_UNTIL);
  }

  /**
   * Set captcha countdown until timestamp
   */
  setCaptchaCountdown(timestamp: number): boolean {
    return localStorage.setItem(localStorageKeys.LOGIN_CAPTCHA_UNTIL, timestamp);
  }

  /**
   * Clear captcha countdown
   */
  clearCaptchaCountdown(): boolean {
    return localStorage.removeItem(localStorageKeys.LOGIN_CAPTCHA_UNTIL);
  }

  /**
   * Check if captcha countdown is active (not expired)
   */
  isCaptchaCountdownActive(): boolean {
    const countdownUntil = this.getCaptchaCountdownUntil();
    if (!countdownUntil) return false;

    const now = Date.now();
    if (now >= countdownUntil) {
      // Countdown expired, clear it and reset attempts
      this.clearCaptchaCountdown();
      this.resetLoginFailedAttempts();
      return false;
    }
    return true;
  }

  /**
   * Get remaining seconds for captcha countdown
   */
  getCaptchaRemainingSeconds(): number {
    const countdownUntil = this.getCaptchaCountdownUntil();
    if (!countdownUntil) return 0;

    const now = Date.now();
    const remaining = Math.ceil((countdownUntil - now) / 1000);
    return Math.max(0, remaining);
  }

  // ==================== OTP VERIFY LOCKOUT METHODS ====================

  /**
   * Get OTP verify failed attempts count
   */
  getOtpVerifyFailedAttempts(): number {
    return localStorage.getItem<number>(localStorageKeys.OTP_VERIFY_FAILED_ATTEMPTS) || 0;
  }

  /**
   * Increment OTP verify failed attempts
   * @returns The new attempt count
   */
  incrementOtpVerifyFailedAttempts(): number {
    const currentAttempts = this.getOtpVerifyFailedAttempts();
    const newAttempts = currentAttempts + 1;
    localStorage.setItem(localStorageKeys.OTP_VERIFY_FAILED_ATTEMPTS, newAttempts);
    return newAttempts;
  }

  /**
   * Reset OTP verify failed attempts
   */
  resetOtpVerifyFailedAttempts(): boolean {
    return localStorage.removeItem(localStorageKeys.OTP_VERIFY_FAILED_ATTEMPTS);
  }

  /**
   * Get OTP verify lockout until timestamp
   */
  getOtpVerifyLockoutUntil(): number | null {
    return localStorage.getItem<number>(localStorageKeys.OTP_VERIFY_LOCKOUT_UNTIL);
  }

  /**
   * Set OTP verify lockout until timestamp
   */
  setOtpVerifyLockout(timestamp: number): boolean {
    return localStorage.setItem(localStorageKeys.OTP_VERIFY_LOCKOUT_UNTIL, timestamp);
  }

  /**
   * Clear OTP verify lockout
   */
  clearOtpVerifyLockout(): boolean {
    return localStorage.removeItem(localStorageKeys.OTP_VERIFY_LOCKOUT_UNTIL);
  }

  /**
   * Check if OTP verify is currently locked
   */
  isOtpVerifyLocked(): boolean {
    const lockoutUntil = this.getOtpVerifyLockoutUntil();
    if (!lockoutUntil) return false;

    const now = Date.now();
    if (now >= lockoutUntil) {
      // Lockout expired, clear it
      this.clearOtpVerifyLockout();
      this.resetOtpVerifyFailedAttempts();
      return false;
    }
    return true;
  }

  /**
   * Get remaining seconds for OTP verify lockout
   */
  getOtpVerifyLockoutRemainingSeconds(): number {
    const lockoutUntil = this.getOtpVerifyLockoutUntil();
    if (!lockoutUntil) return 0;

    const now = Date.now();
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    return Math.max(0, remaining);
  }

  // ==================== X SESSION ID METHODS ====================

  /**
   * Get or create x-session-id for guest tracking
   * Persists in localStorage for consistent guest identification
   */
  getXSessionId(): string {
    let sessionId = localStorage.getItem<string>(localStorageKeys.X_SESSION_ID);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(localStorageKeys.X_SESSION_ID, sessionId);
    }
    return sessionId;
  }

  // ==================== AFFILIATE CODE METHODS ====================

  /**
   * Get stored affiliate code
   */
  getAffiliateCode(): string | null {
    return localStorage.getItem<string>(localStorageKeys.AFFILIATE_CODE);
  }

  /**
   * Save affiliate code to localStorage
   */
  setAffiliateCode(code: string): boolean {
    return localStorage.setItem(localStorageKeys.AFFILIATE_CODE, code);
  }

  /**
   * Clear affiliate code from localStorage
   */
  clearAffiliateCode(): boolean {
    return localStorage.removeItem(localStorageKeys.AFFILIATE_CODE);
  }

  // ==================== SHIPPING ADDRESSES METHODS ====================

  /**
   * Get all shipping addresses
   */
  getShippingAddresses(): ShippingAddress[] {
    return localStorage.getItem<ShippingAddress[]>(localStorageKeys.SHIPPING_ADDRESSES) || [];
  }

  /**
   * Set all shipping addresses
   */
  setShippingAddresses(addresses: ShippingAddress[]): boolean {
    return localStorage.setItem(localStorageKeys.SHIPPING_ADDRESSES, addresses);
  }

  /**
   * Add a new shipping address
   */
  addShippingAddress(address: Omit<ShippingAddress, 'id'>): ShippingAddress {
    const addresses = this.getShippingAddresses();
    const newAddress: ShippingAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    // If this is set as default, unset other defaults
    if (newAddress.isDefault) {
      addresses.forEach((addr) => (addr.isDefault = false));
    }

    addresses.push(newAddress);
    this.setShippingAddresses(addresses);
    return newAddress;
  }

  /**
   * Update an existing shipping address
   */
  updateShippingAddress(id: string, updates: Partial<Omit<ShippingAddress, 'id'>>): boolean {
    const addresses = this.getShippingAddresses();
    const index = addresses.findIndex((addr) => addr.id === id);

    if (index === -1) return false;

    // If setting this as default, unset other defaults
    if (updates.isDefault) {
      addresses.forEach((addr) => (addr.isDefault = false));
    }

    addresses[index] = { ...addresses[index], ...updates };
    return this.setShippingAddresses(addresses);
  }

  /**
   * Delete a shipping address
   */
  deleteShippingAddress(id: string): boolean {
    const addresses = this.getShippingAddresses();
    const filteredAddresses = addresses.filter((addr) => addr.id !== id);

    if (filteredAddresses.length === addresses.length) return false;

    return this.setShippingAddresses(filteredAddresses);
  }

  /**
   * Get default shipping address
   */
  getDefaultShippingAddress(): ShippingAddress | null {
    const addresses = this.getShippingAddresses();
    return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
  }

  /**
   * Set an address as default
   */
  setDefaultShippingAddress(id: string): boolean {
    return this.updateShippingAddress(id, { isDefault: true });
  }

  /**
   * Check if any shipping addresses exist
   */
  hasShippingAddresses(): boolean {
    return this.getShippingAddresses().length > 0;
  }

  // ==================== MEMBER PROMO METHODS (Session Storage) ====================

  /**
   * Check if member promo popup has been dismissed in this session
   */
  isMemberPromoDismissed(): boolean {
    return sessionStorage.hasItem(sessionStorageKeys.MEMBER_PROMO_DISMISSED);
  }

  /**
   * Set member promo popup as dismissed for this session
   */
  setMemberPromoDismissed(): boolean {
    return sessionStorage.setItem(sessionStorageKeys.MEMBER_PROMO_DISMISSED, true);
  }

  /**
   * Clear member promo dismissed state (for testing purposes)
   */
  clearMemberPromoDismissed(): boolean {
    return sessionStorage.removeItem(sessionStorageKeys.MEMBER_PROMO_DISMISSED);
  }

  // ==================== POPUP ADS TRACKING (localStorage - persists across sessions) ====================

  /**
   * Get the list of popup ad IDs that have been shown to the user
   */
  getPopupAdsShownIds(): string[] {
    return localStorage.getItem<string[]>(localStorageKeys.POPUP_ADS_SHOWN_IDS) ?? [];
  }

  /**
   * Save the list of popup ad IDs that have been shown to the user
   */
  setPopupAdsShownIds(ids: string[]): boolean {
    return localStorage.setItem(localStorageKeys.POPUP_ADS_SHOWN_IDS, ids);
  }

  /**
   * Clear the popup ads shown tracking (reset the display cycle)
   */
  clearPopupAdsShownIds(): boolean {
    return localStorage.removeItem(localStorageKeys.POPUP_ADS_SHOWN_IDS);
  }

  // ==================== CHECKOUT SESSION METHODS ====================

  /**
   * Get cached checkout session ID (returns null if expired or not found)
   * Automatically validates expiration and clears cache if expired
   */
  getCheckoutSessionId(): string | null {
    const sessionId = localStorage.getItem<string>(localStorageKeys.CHECKOUT_SESSION_ID);
    const expiresAt = localStorage.getItem<string>(localStorageKeys.CHECKOUT_SESSION_EXPIRES_AT);

    if (!sessionId || !expiresAt) {
      return null;
    }

    // Check if session is expired
    const expirationDate = new Date(expiresAt);
    const now = new Date();

    if (now >= expirationDate) {
      // Session expired, clear cache
      this.clearCheckoutSession();
      return null;
    }

    return sessionId;
  }

  /**
   * Get checkout session expiration date from cache
   */
  getCheckoutSessionExpiresAt(): Date | null {
    const expiresAt = localStorage.getItem<string>(localStorageKeys.CHECKOUT_SESSION_EXPIRES_AT);
    return expiresAt ? new Date(expiresAt) : null;
  }

  /**
   * Set checkout session ID and expiration time
   * @param sessionId - Checkout session ID
   * @param expiresAt - Expiration date (Date object or ISO string)
   */
  setCheckoutSession(sessionId: string, expiresAt: Date | string): void {
    localStorage.setItem(localStorageKeys.CHECKOUT_SESSION_ID, sessionId);
    localStorage.setItem(
      localStorageKeys.CHECKOUT_SESSION_EXPIRES_AT,
      typeof expiresAt === 'string' ? expiresAt : expiresAt.toISOString()
    );
  }

  /**
   * Clear checkout session cache and order customer data
   */
  clearCheckoutSession(): void {
    localStorage.removeItem(localStorageKeys.CHECKOUT_SESSION_ID);
    localStorage.removeItem(localStorageKeys.CHECKOUT_SESSION_EXPIRES_AT);
    this.clearOrderCustomerData();
  }

  /**
   * Check if cached checkout session is still valid
   */
  isCheckoutSessionValid(): boolean {
    const sessionId = localStorage.getItem<string>(localStorageKeys.CHECKOUT_SESSION_ID);
    const expiresAt = localStorage.getItem<string>(localStorageKeys.CHECKOUT_SESSION_EXPIRES_AT);

    if (!sessionId || !expiresAt) {
      return false;
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();

    return now < expirationDate;
  }

  // ==================== ORDER CUSTOMER DATA METHODS ====================

  /**
   * Get order customer data for signup pre-fill
   */
  getOrderCustomerData(): { name: string; phone: string; email: string; orderNumber?: string; productIds?: string[] } | null {
    return localStorage.getItem<{ name: string; phone: string; email: string; orderNumber?: string; productIds?: string[] }>(
      localStorageKeys.ORDER_CUSTOMER_DATA
    );
  }

  /**
   * Set order customer data before clearing checkout session
   */
  setOrderCustomerData(data: { name: string; phone: string; email: string; orderNumber?: string; productIds?: string[] }): void {
    localStorage.setItem(localStorageKeys.ORDER_CUSTOMER_DATA, data);
  }

  /**
   * Clear order customer data (called on unmount of order success page)
   */
  clearOrderCustomerData(): void {
    localStorage.removeItem(localStorageKeys.ORDER_CUSTOMER_DATA);
  }

  // ==================== RECENTLY VIEWED PRODUCTS METHODS ====================

  private readonly RECENTLY_VIEWED_MAX_ITEMS = 4;
  private readonly RECENTLY_VIEWED_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  /**
   * Get recently viewed products (max 4, most recent first, excludes expired)
   * Returns full Product objects
   */
  getRecentlyViewedProducts(): Product[] {
    const stored = localStorage.getItem<RecentlyViewedProduct[]>(localStorageKeys.RECENTLY_VIEWED_PRODUCTS) ?? [];
    const now = Date.now();

    // Filter out expired products (older than 3 days)
    const valid = stored.filter((item) => now - item.viewedAt < this.RECENTLY_VIEWED_EXPIRY_MS);

    // Update storage if any expired items were removed
    if (valid.length !== stored.length) {
      localStorage.setItem(localStorageKeys.RECENTLY_VIEWED_PRODUCTS, valid);
    }

    return valid.map((item) => item.product);
  }

  /**
   * Add a product to recently viewed list
   * Keeps max 4 products, avoids duplicates, most recent first
   * Products expire after 3 days
   */
  addRecentlyViewedProduct(product: Product): void {
    const stored = localStorage.getItem<RecentlyViewedProduct[]>(localStorageKeys.RECENTLY_VIEWED_PRODUCTS) ?? [];
    const now = Date.now();

    // Filter out expired and remove duplicate
    let valid = stored.filter(
      (item) => item.product.id !== product.id && now - item.viewedAt < this.RECENTLY_VIEWED_EXPIRY_MS,
    );

    // Add new product at the beginning
    valid.unshift({
      product,
      viewedAt: now,
    });

    // Keep only max items
    valid = valid.slice(0, this.RECENTLY_VIEWED_MAX_ITEMS);

    localStorage.setItem(localStorageKeys.RECENTLY_VIEWED_PRODUCTS, valid);
  }

  /**
   * Clear recently viewed products
   */
  clearRecentlyViewedProducts(): boolean {
    return localStorage.removeItem(localStorageKeys.RECENTLY_VIEWED_PRODUCTS);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all storage
   */
  clearAll(): boolean {
    return localStorage.clear();
  }

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
