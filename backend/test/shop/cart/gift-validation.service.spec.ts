import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { PromotionsService } from '../../../src/promotions/promotions.service';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import { SocketService } from '../../../src/socket/socket.service';
import { Cart, CartItem } from '../../../src/shop/cart/domain/cart';
import { PromotionStatus } from '../../../src/promotions/domain/promotion-status.enum';
import { BundleDealSubType } from '../../../src/promotions/domain/bundle-deal-sub-type.enum';

describe('GiftValidationService', () => {
  let service: GiftValidationService;
  let promotionsService: jest.Mocked<PromotionsService>;
  let cartRepository: jest.Mocked<CartRepository>;
  let socketService: jest.Mocked<SocketService>;
  let i18n: jest.Mocked<I18nService>;

  const mockPromotion = {
    id: 'promo-123',
    status: PromotionStatus.ACTIVE,
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_TO_GET_GIFT,
      tiers: [
        {
          minOrderValue: 100000,
          gifts: [
            {
              productId: 'gift-product-1',
              variantId: null,
              quantity: 1,
            },
          ],
        },
        {
          minOrderValue: 200000,
          gifts: [
            {
              productId: 'gift-product-2',
              variantId: null,
              quantity: 1,
            },
          ],
        },
      ],
    },
  };

  const createCartItem = (overrides?: Partial<CartItem>): CartItem => ({
    productId: 'product-1',
    code: 'PROD-001',
    name: 'Test Product',
    variantId: null,
    quantity: 1,
    price: 50000,
    isGift: false,
    promotionId: undefined,
    promotionTierId: undefined,
    ...overrides,
  });

  const mockCart: Cart = {
    id: 'cart-123',
    sessionId: 'session-123',
    userId: 'user-123',
    items: [
      createCartItem({ productId: 'product-1', quantity: 3, price: 50000 }), // 150k
      createCartItem({
        productId: 'gift-product-1',
        isGift: true,
        promotionId: 'promo-123',
        promotionTierId: '100000',
        price: 0,
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Cart;

  beforeEach(async () => {
    const mockPromotionsService = {
      findById: jest.fn(),
    };

    const mockCartRepository = {
      findByUserId: jest.fn(),
      findBySessionId: jest.fn(),
      update: jest.fn(),
    };

    const mockSocketService = {
      notifyCartRefetch: jest.fn(),
    };

    const mockI18nService = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftValidationService,
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: SocketService, useValue: mockSocketService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<GiftValidationService>(GiftValidationService);
    promotionsService = module.get(PromotionsService);
    cartRepository = module.get(CartRepository);
    socketService = module.get(SocketService);
    i18n = module.get(I18nService);

    // Suppress logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAndRemoveIneligibleGifts', () => {
    it('should return false when cart not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(false);
      expect(cartRepository.findBySessionId).toHaveBeenCalledWith(
        'session-123',
      );
    });

    it('should return false when cart has no gift items', async () => {
      const cartWithoutGifts: Cart = {
        ...mockCart,
        items: [createCartItem({ productId: 'product-1', quantity: 2 })],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithoutGifts);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(false);
      expect(promotionsService.findById).not.toHaveBeenCalled();
    });

    it('should keep gift when cart total meets tier requirement', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(false);
      expect(cartRepository.update).not.toHaveBeenCalled();
      expect(socketService.notifyCartRefetch).not.toHaveBeenCalled();
    });

    it('should remove gift when cart total drops below tier threshold', async () => {
      const cartBelowThreshold: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 1, price: 50000 }), // 50k < 100k
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartBelowThreshold);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(true);
      expect(cartRepository.update).toHaveBeenCalledWith('cart-123', {
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'product-1' }),
        ]),
      });
      expect(socketService.notifyCartRefetch).toHaveBeenCalledWith(
        'cart-123',
        undefined,
        'session-123',
      );
    });

    it('should remove gift when promotion is inactive', async () => {
      const inactivePromotion = {
        ...mockPromotion,
        status: PromotionStatus.PAUSED,
      };
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(inactivePromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(true);
      expect(cartRepository.update).toHaveBeenCalled();
      expect(socketService.notifyCartRefetch).toHaveBeenCalled();
    });

    it('should remove gift when promotion not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(null);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(true);
      expect(cartRepository.update).toHaveBeenCalled();
    });

    it('should remove gift when tier not found', async () => {
      const promotionWithoutTier = {
        ...mockPromotion,
        bundleDealConfig: {
          ...mockPromotion.bundleDealConfig,
          tiers: [
            {
              minOrderValue: 200000, // Only tier at 200k, not 100k
              gifts: [],
            },
          ],
        },
      };
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(promotionWithoutTier as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(true);
      expect(cartRepository.update).toHaveBeenCalled();
    });

    it('should handle multiple gifts and remove only ineligible ones', async () => {
      const cartWithMultipleGifts: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 5, price: 50000 }), // 250k
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
          createCartItem({
            productId: 'gift-product-2',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '200000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithMultipleGifts);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      // Both gifts should remain (cart total 250k >= both tiers)
      expect(result).toBe(false);
      expect(cartRepository.update).not.toHaveBeenCalled();
    });

    it('should use userId to find cart when provided', async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      await service.validateAndRemoveIneligibleGifts('session-123', 'user-123');

      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(cartRepository.findBySessionId).not.toHaveBeenCalled();
    });

    it('should notify socket with userId when provided', async () => {
      const cartBelowThreshold: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 1, price: 50000 }),
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findByUserId.mockResolvedValue(cartBelowThreshold);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      await service.validateAndRemoveIneligibleGifts('session-123', 'user-123');

      expect(socketService.notifyCartRefetch).toHaveBeenCalledWith(
        'cart-123',
        'user-123',
        'session-123',
      );
    });

    it('should only count selected products when selectedProductIds provided', async () => {
      const cartWithMixedItems: Cart = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'selected-1',
            quantity: 3,
            price: 50000,
          }), // 150k - selected
          createCartItem({
            productId: 'not-selected-1',
            quantity: 10,
            price: 100000,
          }), // 1M - not selected
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithMixedItems);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      // Only count selected-1 (150k) - should keep gift
      const result = await service.validateAndRemoveIneligibleGifts(
        'session-123',
        undefined,
        ['selected-1'],
      );

      expect(result).toBe(false);
      expect(cartRepository.update).not.toHaveBeenCalled();
    });

    it('should remove gift when only selected products total is below threshold', async () => {
      const cartWithMixedItems: Cart = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'selected-1',
            quantity: 1,
            price: 50000,
          }), // 50k - selected
          createCartItem({
            productId: 'not-selected-1',
            quantity: 10,
            price: 100000,
          }), // 1M - not selected
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithMixedItems);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      // Only count selected-1 (50k) < 100k - should remove gift
      const result = await service.validateAndRemoveIneligibleGifts(
        'session-123',
        undefined,
        ['selected-1'],
      );

      expect(result).toBe(true);
      expect(cartRepository.update).toHaveBeenCalled();
    });

    it('should cache promotion lookups for same promotionId', async () => {
      const cartWithSamePromoGifts: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 5, price: 50000 }), // 250k
          createCartItem({
            productId: 'gift-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
          createCartItem({
            productId: 'gift-2',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '200000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithSamePromoGifts);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      await service.validateAndRemoveIneligibleGifts('session-123');

      // Should only fetch promotion once
      expect(promotionsService.findById).toHaveBeenCalledTimes(1);
      expect(promotionsService.findById).toHaveBeenCalledWith('promo-123');
    });

    it('should handle gift without promotionId', async () => {
      const cartWithGiftNoPromo: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 2 }),
          createCartItem({
            productId: 'gift-1',
            isGift: true,
            promotionId: undefined,
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithGiftNoPromo);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(false);
      expect(promotionsService.findById).not.toHaveBeenCalled();
    });

    it('should handle gift with variant correctly', async () => {
      const cartWithVariantGift: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 3, price: 50000 }),
          createCartItem({
            productId: 'gift-product-1',
            variantId: 'variant-123',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithVariantGift);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      expect(result).toBe(false);
    });

    it('should calculate cart total excluding all gifts', async () => {
      const cartWithMultipleGifts: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 2, price: 50000 }), // 100k
          createCartItem({
            productId: 'gift-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 100000, // Should not count towards total
          }),
          createCartItem({
            productId: 'gift-2',
            isGift: true,
            promotionId: 'promo-456',
            promotionTierId: '100000',
            price: 200000, // Should not count towards total
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithMultipleGifts);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);

      const result =
        await service.validateAndRemoveIneligibleGifts('session-123');

      // Cart total is 100k (gifts excluded), should keep gift at 100k tier
      expect(result).toBe(false);
    });

    it('should log when removing gift due to inactive promotion', async () => {
      const inactivePromotion = {
        ...mockPromotion,
        status: PromotionStatus.PAUSED,
      };
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(inactivePromotion as any);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await service.validateAndRemoveIneligibleGifts('session-123');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('promotion inactive'),
      );
    });

    it('should log when removing gift due to tier not found', async () => {
      const promotionWithoutTier = {
        ...mockPromotion,
        bundleDealConfig: {
          ...mockPromotion.bundleDealConfig,
          tiers: [],
        },
      };
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      promotionsService.findById.mockResolvedValue(promotionWithoutTier as any);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await service.validateAndRemoveIneligibleGifts('session-123');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('tier not found'),
      );
    });

    it('should log when removing gift due to cart total below threshold', async () => {
      const cartBelowThreshold: Cart = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'product-1', quantity: 1, price: 50000 }),
          createCartItem({
            productId: 'gift-product-1',
            isGift: true,
            promotionId: 'promo-123',
            promotionTierId: '100000',
            price: 0,
          }),
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartBelowThreshold);
      promotionsService.findById.mockResolvedValue(mockPromotion as any);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await service.validateAndRemoveIneligibleGifts('session-123');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('cart total'),
      );
    });
  });
});
