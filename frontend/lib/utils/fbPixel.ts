/**
 * Facebook Pixel utility functions for tracking events
 * @see https://developers.facebook.com/docs/meta-pixel/reference
 */

export const FB_PIXEL_ID = '855304492221650';

// Standard Facebook Pixel events
export type FBPixelStandardEvent =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'PageView'
  | 'Purchase'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent';

// Common event parameters
export interface FBPixelEventParams {
  content_category?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: 'product' | 'product_group';
  contents?: Array<{ id: string; quantity: number }>;
  currency?: string;
  num_items?: number;
  predicted_ltv?: number;
  search_string?: string;
  status?: boolean;
  value?: number;
  [key: string]: unknown;
}

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: FBPixelEventParams
    ) => void;
  }
}

/**
 * Track a standard Facebook Pixel event
 * @param eventName - Standard event name (e.g., 'AddToCart', 'Purchase')
 * @param params - Optional event parameters
 * @example
 * trackEvent('AddToCart', { value: 100000, currency: 'VND', content_ids: ['SKU123'] });
 * trackEvent('Purchase', { value: 500000, currency: 'VND' });
 */
export const trackEvent = (
  eventName: FBPixelStandardEvent,
  params?: FBPixelEventParams
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

/**
 * Track a custom Facebook Pixel event
 * @param eventName - Custom event name
 * @param params - Optional event parameters
 * @example
 * trackCustomEvent('PromoCodeApplied', { promo_code: 'SALE20' });
 */
export const trackCustomEvent = (
  eventName: string,
  params?: FBPixelEventParams
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};

// Convenience functions for common events

/**
 * Track when a product is added to cart
 */
export const trackAddToCart = (params: {
  productId: string;
  productName: string;
  value: number;
  currency?: string;
  quantity?: number;
}): void => {
  trackEvent('AddToCart', {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'VND',
    num_items: params.quantity || 1,
  });
};

/**
 * Track when checkout is initiated
 */
export const trackInitiateCheckout = (params: {
  productIds: string[];
  value: number;
  currency?: string;
  numItems: number;
}): void => {
  trackEvent('InitiateCheckout', {
    content_ids: params.productIds,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'VND',
    num_items: params.numItems,
  });
};

/**
 * Track a completed purchase
 */
export const trackPurchase = (params: {
  productIds: string[];
  value: number;
  currency?: string;
  numItems: number;
}): void => {
  trackEvent('Purchase', {
    content_ids: params.productIds,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'VND',
    num_items: params.numItems,
  });
};

/**
 * Track when a product page is viewed
 */
export const trackViewContent = (params: {
  productId: string;
  productName: string;
  value?: number;
  currency?: string;
  category?: string;
}): void => {
  trackEvent('ViewContent', {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'VND',
    content_category: params.category,
  });
};

/**
 * Track a search action
 */
export const trackSearch = (searchString: string): void => {
  trackEvent('Search', {
    search_string: searchString,
  });
};

/**
 * Track when a product is added to wishlist
 */
export const trackAddToWishlist = (params: {
  productId: string;
  productName: string;
  value?: number;
  currency?: string;
}): void => {
  trackEvent('AddToWishlist', {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: 'product',
    value: params.value,
    currency: params.currency || 'VND',
  });
};

/**
 * Track user registration
 */
export const trackCompleteRegistration = (params?: {
  status?: boolean;
  value?: number;
  currency?: string;
}): void => {
  trackEvent('CompleteRegistration', {
    status: params?.status ?? true,
    value: params?.value,
    currency: params?.currency || 'VND',
  });
};
