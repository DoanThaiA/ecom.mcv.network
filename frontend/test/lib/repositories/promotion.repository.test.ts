import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promotionRepository } from '@/lib/repositories/promotion.repository';
import axiosInstance from '@/lib/axios';
import type {
  BundleDealEligibilityResponse,
  AddGiftToCartRequest,
  RemoveGiftFromCartRequest,
  Cart,
  CheckoutSession,
} from '@/types/gen/shop/shop/shop/shop';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PromotionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkBundleDealEligibility', () => {
    it('checks bundle deal eligibility successfully', async () => {
      const mockResponse: BundleDealEligibilityResponse[] = [
        {
          tierId: '1',
          minAmount: 100000,
          eligible: true,
          gifts: [{ productId: 'gift1', name: 'Gift 1' }],
        },
        {
          tierId: '2',
          minAmount: 200000,
          eligible: false,
          gifts: [{ productId: 'gift2', name: 'Gift 2' }],
        },
      ];

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await promotionRepository.checkBundleDealEligibility(150000);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/bundle-deals/check-eligibility',
        { cartTotal: 150000, selectedItems: undefined }
      );

      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(2);
    });

    it('returns null when API call fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(new Error('Network error'));

      const result = await promotionRepository.checkBundleDealEligibility(100000);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[PromotionRepository] checkBundleDealEligibility error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('handles zero cart total', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: [],
      });

      const result = await promotionRepository.checkBundleDealEligibility(0);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/bundle-deals/check-eligibility',
        { cartTotal: 0, selectedItems: undefined }
      );

      expect(result).toEqual([]);
    });

    it('handles negative cart total', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: [],
      });

      await promotionRepository.checkBundleDealEligibility(-100);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        { cartTotal: -100, selectedItems: undefined }
      );
    });

    it('handles empty response', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: [],
      });

      const result = await promotionRepository.checkBundleDealEligibility(50000);

      expect(result).toEqual([]);
    });

    it('handles large cart total', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: [],
      });

      await promotionRepository.checkBundleDealEligibility(999999999);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        { cartTotal: 999999999, selectedItems: undefined }
      );
    });
  });

  describe('addGiftToCart', () => {
    it('adds gift to cart successfully', async () => {
      const mockRequest: AddGiftToCartRequest = {
        productId: 'gift-123',
        variantId: 'variant-456',
        tierId: 'tier-1',
      };

      const mockCart: Cart = {
        items: [
          { productId: 'gift-123', quantity: 1 },
        ],
        total: 100000,
      } as Cart;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await promotionRepository.addGiftToCart(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/gift/buy-to-get-gift',
        mockRequest
      );

      expect(result).toEqual(mockCart);
    });

    it('propagates API errors', async () => {
      const mockRequest: AddGiftToCartRequest = {
        productId: 'gift-123',
        variantId: 'variant-456',
        tierId: 'tier-1',
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(new Error('Gift not available'));

      await expect(
        promotionRepository.addGiftToCart(mockRequest)
      ).rejects.toThrow('Gift not available');
    });

    it('sends correct request payload', async () => {
      const mockRequest: AddGiftToCartRequest = {
        productId: 'prod-1',
        variantId: 'var-1',
        tierId: 'tier-2',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await promotionRepository.addGiftToCart(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/gift/buy-to-get-gift',
        {
          productId: 'prod-1',
          variantId: 'var-1',
          tierId: 'tier-2',
        }
      );
    });
  });

  describe('removeGiftFromCart', () => {
    it('removes gift from cart successfully', async () => {
      const mockRequest: RemoveGiftFromCartRequest = {
        productId: 'gift-123',
        variantId: 'variant-456',
      };

      const mockCart: Cart = {
        items: [],
        total: 0,
      } as Cart;

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: mockCart,
      });

      const result = await promotionRepository.removeGiftFromCart(mockRequest);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/shop/promotions/gift/gift-123',
        {
          params: {
            variantId: 'variant-456',
          },
        }
      );

      expect(result).toEqual(mockCart);
    });

    it('constructs correct URL with productId', async () => {
      const mockRequest: RemoveGiftFromCartRequest = {
        productId: 'product-999',
        variantId: 'variant-888',
      };

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await promotionRepository.removeGiftFromCart(mockRequest);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/shop/promotions/gift/product-999',
        expect.any(Object)
      );
    });

    it('includes variantId in params', async () => {
      const mockRequest: RemoveGiftFromCartRequest = {
        productId: 'prod-1',
        variantId: 'var-1',
      };

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: { items: [] } as Cart,
      });

      await promotionRepository.removeGiftFromCart(mockRequest);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: {
            variantId: 'var-1',
          },
        })
      );
    });

    it('propagates API errors', async () => {
      const mockRequest: RemoveGiftFromCartRequest = {
        productId: 'gift-123',
        variantId: 'variant-456',
      };

      vi.mocked(axiosInstance.delete).mockRejectedValueOnce(new Error('Gift not found'));

      await expect(
        promotionRepository.removeGiftFromCart(mockRequest)
      ).rejects.toThrow('Gift not found');
    });
  });

  describe('applyVoucher', () => {
    it('applies voucher successfully', async () => {
      const mockCheckoutSession: CheckoutSession = {
        id: 'session-123',
        voucher: {
          code: 'DISCOUNT10',
          discount: 10000,
        },
        total: 90000,
      } as CheckoutSession;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockCheckoutSession,
      });

      const result = await promotionRepository.applyVoucher('DISCOUNT10', 'session-123');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/voucher/apply',
        {
          code: 'DISCOUNT10',
          checkoutSessionId: 'session-123',
        }
      );

      expect(result).toEqual(mockCheckoutSession);
      expect(result.voucher?.code).toBe('DISCOUNT10');
    });

    it('sends correct request body', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {} as CheckoutSession,
      });

      await promotionRepository.applyVoucher('SUMMER2024', 'checkout-456');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/promotions/voucher/apply',
        {
          code: 'SUMMER2024',
          checkoutSessionId: 'checkout-456',
        }
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Invalid voucher code')
      );

      await expect(
        promotionRepository.applyVoucher('INVALID', 'session-123')
      ).rejects.toThrow('Invalid voucher code');
    });

    it('handles empty voucher code', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {} as CheckoutSession,
      });

      await promotionRepository.applyVoucher('', 'session-123');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          code: '',
        })
      );
    });

    it('handles special characters in voucher code', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {} as CheckoutSession,
      });

      await promotionRepository.applyVoucher('SALE-50%', 'session-123');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          code: 'SALE-50%',
        })
      );
    });
  });
});
