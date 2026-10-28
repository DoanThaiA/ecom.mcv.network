/* eslint-disable no-console */
import axiosInstance from '@/lib/axios';
import { storageService } from "@/lib/services/storage.service";
import type {
  AddComboToCartPayload,
  AddToCartPayload,
  AddToCartRequest,
  MergeGuestCartRequest,
  RemoveFromCartPayload,
  UpdateCartItemPayload,
  UpdateCartItemRequest,
} from '@/types/cart';
import type { Cart } from '@/types/gen/shop/shared/carts/cart';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import type {
  PlaceOrderRequest,
  PlaceOrderResponse,
  UpsertCheckoutSessionRequest,
} from '@/types/gen/shop/shop/shop/shop';
import type {
  ShippingCalculateRequest,
  ShippingCalculateResponse,
} from '@/types/shipping';

/**
 * Cart Repository
 * Handles all cart-related API calls
 * All users (guest and authenticated) call API with x-session-id header
 * API errors propagate to saga for proper error handling
 */

class CartRepository {
  // In-flight request tracking for syncCart (prevents duplicate API calls)
  private syncCartRequest: Promise<Cart> | null = null;

  /**
   * Sync cart with backend (uses x-session-id for all users)
   * Request deduplication: If a request is already in-flight, return the same promise
   */
  syncCart = async (): Promise<Cart> => {
    // Return in-flight request if one exists (prevents duplicate calls)
    if (this.syncCartRequest) {
      console.log('Waiting for in-flight cart sync request');
      return this.syncCartRequest;
    }

    // Create new request and track it
    this.syncCartRequest = (async () => {
      try {
        console.log('Fetching cart from API');
        const response = await axiosInstance.get<Cart>('/shop/cart');
        return response.data;
      } finally {
        // Clear in-flight request
        this.syncCartRequest = null;
      }
    })();

    return this.syncCartRequest;
  };

  /**
   * Add item to cart (uses x-session-id for all users)
   */
  addToCart = async (data: AddToCartPayload): Promise<Cart> => {
    const request: AddToCartRequest = {
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity,
    };
    const response = await axiosInstance.post<Cart>('shop/cart/items', request);
    return response.data;
  };

  /**
   * Add combo to cart (uses x-session-id for all users)
   */
  addComboToCart = async (data: AddComboToCartPayload): Promise<Cart> => {
    // Send payload directly with optional variantId
    const response = await axiosInstance.post<Cart>('shop/cart/combo', data);
    return response.data;
  };

  /**
   * Update cart item quantity (uses x-session-id for all users)
   */
  updateCartItem = async (data: UpdateCartItemPayload): Promise<Cart> => {
    const request: UpdateCartItemRequest = {
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity,
    };
    const response = await axiosInstance.patch<Cart>(
      `/shop/cart/items/${request.productId}`,
      request
    );
    return response.data;
  };

  /**
   * Remove item from cart (uses x-session-id for all users)
   * variantId is sent as query parameter, comboInstanceId is sent in request body
   */
  removeFromCart = async (data: RemoveFromCartPayload): Promise<Cart> => {
    const response = await axiosInstance.delete<Cart>(
      `/shop/cart/items/${data.productId}`,
      {
        params: {
          variantId: data.variantId,
        },
        data: {
          comboInstanceId: data.comboInstanceId,
        },
      }
    );
    return response.data;
  };

  /**
   * Clear entire cart (uses x-session-id for all users)
   */
  clearCart = async (): Promise<Cart> => {
    const response = await axiosInstance.delete<Cart>('/shop/cart');
    return response.data;
  };

  /**
   * Merge guest cart to authenticated user cart (call after login)
   */
  mergeCart = async (): Promise<Cart> => {
    const guestSessionId = storageService.getXSessionId();
    const request: MergeGuestCartRequest = { guestSessionId };
    const response = await axiosInstance.post<Cart>(
      '/shop/cart/merge',
      request
    );
    return response.data;
  };

  /**
   * Calculate shipping fee for cart items and destination address
   */
  calculateShipping = async (
    data: ShippingCalculateRequest
  ): Promise<ShippingCalculateResponse> => {
    const response = await axiosInstance.post<ShippingCalculateResponse>(
      '/shop/shipping/calculate',
      data
    );
    return response.data;
  };

  // In-flight request tracking for checkout session (prevents duplicate API calls)
  private upsertCheckoutSessionRequest: Promise<CheckoutSession> | null = null;

  /**
   * Create or update checkout session for cart calculation
   * Calculates shipping fee, subtotal, discount, total
   * Request deduplication: If a request is already in-flight, return the same promise
   * Uses localStorage to cache session ID and reuse existing sessions
   */
  upsertCheckoutSession = async (
    data: UpsertCheckoutSessionRequest
  ): Promise<CheckoutSession> => {
    // Return in-flight request if one exists (prevents duplicate calls)
    if (this.upsertCheckoutSessionRequest) {
      return this.upsertCheckoutSessionRequest;
    }

    // Create new request and track it
    this.upsertCheckoutSessionRequest = (async () => {
      try {
        // If no ID provided, check localStorage for cached session
        if (!data.id) {
          const cachedSessionId = storageService.getCheckoutSessionId();
          if (cachedSessionId) {
            // Use cached session ID instead of creating new
            data.id = cachedSessionId;
          }
        }

        // Attach affiliate code from localStorage so backend can track it
        // regardless of cookie cross-origin restrictions
        const affiliateCode = storageService.getAffiliateCode();
        const payload = affiliateCode
          ? { ...data, affiliateCode }
          : data;

        const response = await axiosInstance.post<CheckoutSession>(
          '/shop/checkout/sessions',
          payload
        );

        const session = response.data;

        // Cache session ID and expiration time
        if (session.id && session.expiresAt) {
          storageService.setCheckoutSession(session.id, session.expiresAt);
        }

        return session;
      } finally {
        // Clear in-flight request
        this.upsertCheckoutSessionRequest = null;
      }
    })();

    return this.upsertCheckoutSessionRequest;
  };

  /**
   * Get checkout session by ID
   * Updates localStorage cache with latest expiration time
   */
  getCheckoutSession = async (sessionId: string): Promise<CheckoutSession> => {
    const response = await axiosInstance.get<CheckoutSession>(
      `/shop/checkout/sessions/${sessionId}`
    );

    const session = response.data;

    // Update cache with latest expiration time
    if (session.expiresAt) {
      storageService.setCheckoutSession(session.id, session.expiresAt);
    }

    return session;
  };

  /**
   * Place order from checkout session
   * Uses session ID to create order with selected payment method
   */
  placeOrder = async (
    sessionId: string,
    data: Omit<PlaceOrderRequest, 'sessionId'>
  ): Promise<PlaceOrderResponse> => {
    const request: PlaceOrderRequest = {
      sessionId,
      ...data,
    };
    const response = await axiosInstance.post<PlaceOrderResponse>(
      `/shop/checkout/sessions/${sessionId}/place-order`,
      request
    );
    return response.data;
  };
}

// Export singleton instance
export const cartRepository = new CartRepository();
