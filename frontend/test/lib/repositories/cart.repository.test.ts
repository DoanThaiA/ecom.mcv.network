import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cartRepository } from '@/lib/repositories/cart.repository';
import axiosInstance from '@/lib/axios';
import { storageService } from '@/lib/services/storage.service';
import type {
  AddComboToCartPayload,
  AddToCartPayload,
  RemoveFromCartPayload,
  UpdateCartItemPayload,
} from '@/types/cart';
import type {
  Cart,
  CheckoutSession,
  PlaceOrderResponse,
  UpsertCheckoutSessionRequest,
} from '@/types/gen/shop/shop/shop/shop';
import type {
  ShippingCalculateRequest,
  ShippingCalculateResponse,
} from '@/types/shipping';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock storageService
vi.mock('@/lib/services/storage.service', () => ({
  storageService: {
    getXSessionId: vi.fn(),
    getCheckoutSessionId: vi.fn(),
    setCheckoutSession: vi.fn(),
    getAffiliateCode: vi.fn(),
  },
}));

describe('CartRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('syncCart', () => {
    it('fetches cart from API successfully', async () => {
      const mockCart: Cart = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        total: 100000,
      } as Cart;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.syncCart();

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/cart');
      expect(result).toEqual(mockCart);
      expect(console.log).toHaveBeenCalledWith('Fetching cart from API');
    });

    it('deduplicates concurrent requests', async () => {
      const mockCart: Cart = {
        items: [],
        total: 0,
      } as Cart;

      vi.mocked(axiosInstance.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockCart }), 100);
          })
      );

      // Make two concurrent requests
      const promise1 = cartRepository.syncCart();
      const promise2 = cartRepository.syncCart();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should only call API once
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockCart);
      expect(result2).toEqual(mockCart);
      expect(console.log).toHaveBeenCalledWith(
        'Waiting for in-flight cart sync request'
      );
    });

    it('clears in-flight request after completion', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.syncCart();

      // Second call should make new request
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.syncCart();

      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('clears in-flight request on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(cartRepository.syncCart()).rejects.toThrow('Network error');

      // Second call should make new request
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.syncCart();

      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('addToCart', () => {
    it('adds item to cart successfully', async () => {
      const payload: AddToCartPayload = {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
      };

      const mockCart: Cart = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        total: 100000,
      } as Cart;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.addToCart(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('shop/cart/items', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
      });

      expect(result).toEqual(mockCart);
    });

    it('adds item without variantId', async () => {
      const payload: AddToCartPayload = {
        productId: 'prod-2',
        quantity: 1,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.addToCart(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('shop/cart/items', {
        productId: 'prod-2',
        variantId: undefined,
        quantity: 1,
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Product out of stock')
      );

      await expect(
        cartRepository.addToCart({
          productId: 'prod-1',
          quantity: 1,
        })
      ).rejects.toThrow('Product out of stock');
    });
  });

  describe('addComboToCart', () => {
    it('adds combo to cart successfully', async () => {
      const payload: AddComboToCartPayload = {
        comboId: 'combo-1',
        selections: { prod1: 'var1', prod2: 'var2' },
      };

      const mockCart: Cart = {
        items: [{ productId: 'combo-1', quantity: 1 }],
        total: 150000,
      } as Cart;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.addComboToCart(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        'shop/cart/combo',
        payload
      );
      expect(result).toEqual(mockCart);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Invalid combo')
      );

      await expect(
        cartRepository.addComboToCart({
          comboId: 'combo-1',
          selections: {},
        })
      ).rejects.toThrow('Invalid combo');
    });
  });

  describe('updateCartItem', () => {
    it('updates cart item quantity successfully', async () => {
      const payload: UpdateCartItemPayload = {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 5,
      };

      const mockCart: Cart = {
        items: [{ productId: 'prod-1', quantity: 5 }],
        total: 250000,
      } as Cart;

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.updateCartItem(payload);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/shop/cart/items/prod-1',
        {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 5,
        }
      );

      expect(result).toEqual(mockCart);
    });

    it('updates cart item without variantId', async () => {
      const payload: UpdateCartItemPayload = {
        productId: 'prod-2',
        quantity: 3,
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.updateCartItem(payload);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/shop/cart/items/prod-2',
        expect.objectContaining({
          productId: 'prod-2',
          quantity: 3,
        })
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.patch).mockRejectedValueOnce(
        new Error('Invalid quantity')
      );

      await expect(
        cartRepository.updateCartItem({
          productId: 'prod-1',
          quantity: 0,
        })
      ).rejects.toThrow('Invalid quantity');
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      const payload: RemoveFromCartPayload = {
        productId: 'prod-1',
        variantId: 'var-1',
      };

      const mockCart: Cart = {
        items: [],
        total: 0,
      } as Cart;

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.removeFromCart(payload);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/shop/cart/items/prod-1',
        {
          params: {
            variantId: 'var-1',
          },
          data: {
            comboInstanceId: undefined,
          },
        }
      );

      expect(result).toEqual(mockCart);
    });

    it('removes item with comboInstanceId', async () => {
      const payload: RemoveFromCartPayload = {
        productId: 'combo-1',
        comboInstanceId: 'instance-1',
      };

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.removeFromCart(payload);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/shop/cart/items/combo-1',
        {
          params: {
            variantId: undefined,
          },
          data: {
            comboInstanceId: 'instance-1',
          },
        }
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.delete).mockRejectedValueOnce(
        new Error('Item not found')
      );

      await expect(
        cartRepository.removeFromCart({
          productId: 'prod-1',
        })
      ).rejects.toThrow('Item not found');
    });
  });

  describe('clearCart', () => {
    it('clears cart successfully', async () => {
      const mockCart: Cart = {
        items: [],
        total: 0,
      } as Cart;

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.clearCart();

      expect(axiosInstance.delete).toHaveBeenCalledWith('/shop/cart');
      expect(result).toEqual(mockCart);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.delete).mockRejectedValueOnce(
        new Error('Clear cart failed')
      );

      await expect(cartRepository.clearCart()).rejects.toThrow(
        'Clear cart failed'
      );
    });
  });

  describe('mergeCart', () => {
    it('merges guest cart with user cart successfully', async () => {
      const guestSessionId = 'guest-session-123';
      const mockCart: Cart = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        total: 100000,
      } as Cart;

      vi.mocked(storageService.getXSessionId).mockReturnValueOnce(
        guestSessionId
      );
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await cartRepository.mergeCart();

      expect(storageService.getXSessionId).toHaveBeenCalled();
      expect(axiosInstance.post).toHaveBeenCalledWith('/shop/cart/merge', {
        guestSessionId: 'guest-session-123',
      });
      expect(result).toEqual(mockCart);
    });

    it('handles null guest session ID', async () => {
      vi.mocked(storageService.getXSessionId).mockReturnValueOnce(null);
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await cartRepository.mergeCart();

      expect(axiosInstance.post).toHaveBeenCalledWith('/shop/cart/merge', {
        guestSessionId: null,
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(storageService.getXSessionId).mockReturnValueOnce('session-1');
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Merge failed')
      );

      await expect(cartRepository.mergeCart()).rejects.toThrow('Merge failed');
    });
  });

  describe('calculateShipping', () => {
    it('calculates shipping fee successfully', async () => {
      const request: ShippingCalculateRequest = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        destination: {
          cityId: 1,
          districtId: 10,
          wardId: 100,
        },
      };

      const mockResponse: ShippingCalculateResponse = {
        shippingFee: 30000,
        estimatedDelivery: '2024-01-10',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await cartRepository.calculateShipping(request);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/shipping/calculate',
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Invalid address')
      );

      await expect(
        cartRepository.calculateShipping({
          items: [],
          destination: {} as any,
        })
      ).rejects.toThrow('Invalid address');
    });
  });

  describe('upsertCheckoutSession', () => {
    it('creates checkout session successfully', async () => {
      const request: UpsertCheckoutSessionRequest = {
        shippingAddress: {
          address: '123 Main St',
          cityId: 1,
          districtId: 10,
          wardId: 100,
        },
      };

      const mockSession: CheckoutSession = {
        id: 'session-123',
        total: 130000,
      } as CheckoutSession;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockSession,
      });

      const result = await cartRepository.upsertCheckoutSession(request);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/checkout/sessions',
        request
      );
      expect(result).toEqual(mockSession);
    });

    it('deduplicates concurrent requests', async () => {
      const request: UpsertCheckoutSessionRequest = {
        shippingAddress: {} as any,
      };

      const mockSession: CheckoutSession = {
        id: 'session-123',
        total: 100000,
      } as CheckoutSession;

      vi.mocked(axiosInstance.post).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockSession }), 100);
          })
      );

      // Make two concurrent requests
      const promise1 = cartRepository.upsertCheckoutSession(request);
      const promise2 = cartRepository.upsertCheckoutSession(request);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should only call API once
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockSession);
      expect(result2).toEqual(mockSession);
    });

    it('clears in-flight request after completion', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'session-1' } as CheckoutSession,
      });

      await cartRepository.upsertCheckoutSession({
        shippingAddress: {} as any,
      });

      // Second call should make new request
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'session-2' } as CheckoutSession,
      });

      await cartRepository.upsertCheckoutSession({
        shippingAddress: {} as any,
      });

      expect(axiosInstance.post).toHaveBeenCalledTimes(2);
    });

    it('clears in-flight request on error', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Session error')
      );

      await expect(
        cartRepository.upsertCheckoutSession({ shippingAddress: {} as any })
      ).rejects.toThrow('Session error');

      // Second call should make new request
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'session-1' } as CheckoutSession,
      });

      await cartRepository.upsertCheckoutSession({
        shippingAddress: {} as any,
      });

      expect(axiosInstance.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCheckoutSession', () => {
    it('fetches checkout session successfully', async () => {
      const mockSession: CheckoutSession = {
        id: 'session-123',
        total: 130000,
      } as CheckoutSession;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockSession,
      });

      const result = await cartRepository.getCheckoutSession('session-123');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/checkout/sessions/session-123'
      );
      expect(result).toEqual(mockSession);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Session not found')
      );

      await expect(
        cartRepository.getCheckoutSession('invalid-id')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('placeOrder', () => {
    it('places order successfully', async () => {
      const mockResponse: PlaceOrderResponse = {
        order: { id: 'order-123', orderNumber: 'ORD-001' },
        paymentUrl: 'https://payment.example.com/pay',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await cartRepository.placeOrder('session-123', {
        paymentMethod: 'VNPAY',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/checkout/sessions/session-123/place-order',
        {
          sessionId: 'session-123',
          paymentMethod: 'VNPAY',
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('places order with COD payment', async () => {
      const mockResponse: PlaceOrderResponse = {
        order: { id: 'order-456', orderNumber: 'ORD-002' },
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await cartRepository.placeOrder('session-456', {
        paymentMethod: 'COD',
      });

      expect(result.paymentUrl).toBeUndefined();
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Payment failed')
      );

      await expect(
        cartRepository.placeOrder('session-123', {
          paymentMethod: 'VNPAY',
        })
      ).rejects.toThrow('Payment failed');
    });
  });
});
