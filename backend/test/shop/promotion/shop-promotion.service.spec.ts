import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShopPromotionService } from '../../../src/shop/promotion/shop-promotion.service';
import { PromotionsService } from '../../../src/promotions/promotions.service';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import { CartService } from '../../../src/shop/cart/cart.service';
import { CdpService } from '../../../src/cdp/cdp.service';
import { CheckoutService } from '../../../src/shop/checkout/checkout.service';
import { UserRepository } from '../../../src/users/domain/user.repository';
import { Cart } from '../../../src/shop/cart/domain/cart';
import { Product } from '../../../src/products/domain/product';
import { Promotion } from '../../../src/promotions/domain/promotion';
import { BundleDealSubType } from '../../../src/promotions/domain/bundle-deal-sub-type.enum';
import { PromotionStatus } from '../../../src/promotions/domain/promotion-status.enum';
import { PromotionType } from '../../../src/promotions/domain/promotion-type.enum';
import { OrderDiscountSubType } from '../../../src/promotions/domain/order-discount-sub-type.enum';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { PromotionProductRepository } from '../../../src/promotion-products/domain/promotion-product.repository';
import { PromotionUsageRecordRepository } from '../../../src/promotion-usage-records/domain/promotion-usage-record.repository';

describe('ShopPromotionService', () => {
  let service: ShopPromotionService;
  let promotionsService: jest.Mocked<PromotionsService>;
  let productRepository: jest.Mocked<ProductRepository>;
  let cartRepository: jest.Mocked<CartRepository>;
  let cartService: jest.Mocked<CartService>;
  let cdpService: jest.Mocked<CdpService>;
  let checkoutService: jest.Mocked<CheckoutService>;
  let promotionUsageRecordRepository: jest.Mocked<PromotionUsageRecordRepository>;
  let i18n: jest.Mocked<I18nService>;

  // Helper to create CartItem
  const createCartItem = (overrides: any = {}) => ({
    productId: 'product-1',
    code: 'PROD-001',
    name: 'Product Name',
    price: 100000,
    quantity: 1,
    isGift: false,
    image: null,
    variantId: null,
    comboInstanceId: null,
    attributes: null,
    originalPrice: null,
    promotionId: null,
    promotionTierId: null,
    ...overrides,
  });

  const mockCart: Cart = {
    id: 'cart-123',
    sessionId: 'session-123',
    userId: null,
    items: [],
    comboInstances: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct: Product = {
    id: 'product-123',
    businessId: '110668',
    source: 'nhanh',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: ProductStatus.ACTIVE,
    inventory: { available: 10, remain: 10 },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Product;

  const mockBundleDealPromotion = {
    id: 'promo-123',
    businessId: '110668',
    source: 'nhanh',
    name: 'Bundle Deal',
    type: PromotionType.BUNDLE_DEAL,
    status: PromotionStatus.ACTIVE,
    isEnabled: true,
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() + 86400000),
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_TO_GET_GIFT,
      tiers: [
        {
          minOrderValue: 100000,
          giftProducts: [
            {
              productId: 'gift-123',
              name: 'Gift gift-123',
              image: 'https://example.com/gift-123.jpg',
            },
          ],
        },
        {
          minOrderValue: 200000,
          giftProducts: [
            {
              productId: 'gift-456',
              name: 'Gift gift-456',
              image: 'https://example.com/gift-456.jpg',
            },
          ],
        },
      ],
      notApplicableWithOtherPromotions: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBuyXGetYPromotion = {
    id: 'promo-bxy',
    businessId: '110668',
    source: 'nhanh',
    name: 'Buy X Get Y Deal',
    type: PromotionType.BUNDLE_DEAL,
    status: PromotionStatus.ACTIVE,
    isEnabled: true,
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() + 86400000),
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_X_GET_Y,
      requiredQuantity: 3,
      requiredProducts: [
        { productId: 'required-1', name: 'Required Product', image: '' },
      ],
      giftQuantity: 2,
      giftProducts: [
        { productId: 'gift-123', name: 'Gift Product', image: '' },
      ],
      minimumOrderValue: 100000,
      maxGiftQuantity: 10,
      currentGiftCount: 0,
      notApplicableWithOtherPromotions: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPromotionsService = {
      getActiveBundleDeals: jest.fn(),
      findById: jest.fn(),
      findProductDiscountByVoucherCode: jest.fn().mockResolvedValue(null),
      findOrderDiscountByPromoCode: jest.fn().mockResolvedValue(null),
    };

    const mockProductRepository = {
      findByIds: jest.fn(),
      findById: jest.fn(),
    };

    const mockCartRepository = {
      findBySessionId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    const mockCartService = {
      getCart: jest.fn(),
    };

    const mockCdpService = {
      checkVoucher: jest.fn(),
      useVoucher: jest.fn(),
    };

    const mockCheckoutService = {
      upsertSession: jest.fn(),
      applyVoucherToSession: jest.fn(),
      applyOrderDiscountToSession: jest.fn(),
      removeVoucherFromSession: jest.fn(),
      clearVouchersAndProductDiscounts: jest.fn().mockResolvedValue(undefined),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopPromotionService,
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: CartService, useValue: mockCartService },
        { provide: CdpService, useValue: mockCdpService },
        { provide: CheckoutService, useValue: mockCheckoutService },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        { provide: I18nService, useValue: mockI18n },
        {
          provide: PromotionProductRepository,
          useValue: {
            findByPromotionId: jest.fn(),
          },
        },
        {
          provide: PromotionUsageRecordRepository,
          useValue: {
            create: jest.fn(),
            findByPromotionAndUser: jest.fn(),
            existsByPromotionIdAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShopPromotionService>(ShopPromotionService);
    promotionsService = module.get(PromotionsService);
    productRepository = module.get(ProductRepository);
    cartRepository = module.get(CartRepository);
    cartService = module.get(CartService);
    cdpService = module.get(CdpService);
    checkoutService = module.get(CheckoutService);
    promotionUsageRecordRepository = module.get(PromotionUsageRecordRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBundleDealEligibility', () => {
    it('should return empty array when no bundle deals exist', async () => {
      promotionsService.getActiveBundleDeals.mockResolvedValue([]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toEqual([]);
    });

    it('should return empty array when no BUY_TO_GET_GIFT promotions', async () => {
      const nonGiftPromotion = {
        ...mockBundleDealPromotion,
        bundleDealConfig: {
          subType: BundleDealSubType.UNSPECIFIED,
          tiers: [],
        },
      };
      promotionsService.getActiveBundleDeals.mockResolvedValue([
        nonGiftPromotion as any,
      ]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toEqual([]);
    });

    it('should return eligible tiers based on cart total', async () => {
      const giftProduct = { ...mockProduct, id: 'gift-123' };
      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBundleDealPromotion,
      ]);
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      productRepository.findByIds.mockResolvedValue([giftProduct]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toHaveLength(1);
      expect(result[0].promotionId).toBe('promo-123');
      expect(result[0].eligibleTiers).toHaveLength(1);
      expect(result[0].eligibleTiers[0].tierId).toBe('100000');
    });

    it('should include multiple eligible tiers when cart total qualifies', async () => {
      const giftProduct1 = { ...mockProduct, id: 'gift-123' };
      const giftProduct2 = { ...mockProduct, id: 'gift-456' };
      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBundleDealPromotion,
      ]);
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      productRepository.findByIds.mockResolvedValue([
        giftProduct1,
        giftProduct2,
      ]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 250000 },
        'session-123',
      );

      expect(result[0].eligibleTiers).toHaveLength(2);
      expect(result[0].eligibleTiers[0].tierId).toBe('100000');
      expect(result[0].eligibleTiers[1].tierId).toBe('200000');
    });

    it('should handle cart not found gracefully', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
      };
      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBundleDealPromotion,
      ]);
      cartRepository.findBySessionId.mockResolvedValue(null);
      productRepository.findByIds.mockResolvedValue([giftProduct]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toHaveLength(1);
    });

    it('should use userId to find cart when provided', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
      };
      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBundleDealPromotion,
      ]);
      cartRepository.findByUserId.mockResolvedValue(mockCart);
      productRepository.findByIds.mockResolvedValue([giftProduct]);

      await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
        'user-123',
      );

      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(cartRepository.findBySessionId).not.toHaveBeenCalled();
    });
  });

  describe('applyVoucher', () => {
    it('should apply CDP voucher when found', async () => {
      const mockCdpResponse = {
        code: 0,
        is_valid: true,
        promotion_code: 'DISCOUNT10',
        voucher_detail: {
          voucher_id: 'cdp-123',
          voucher_event_name: '10% Discount',
          discount_value: 10000,
          discount_type: 1,
        },
      };
      const mockSession = { id: 'checkout-session-123' };

      cdpService.checkVoucher.mockResolvedValue(mockCdpResponse as any);
      checkoutService.upsertSession.mockResolvedValue(mockSession as any);
      checkoutService.applyVoucherToSession.mockResolvedValue({} as any);

      await service.applyVoucher(
        'session-123',
        { code: 'DISCOUNT10' },
        'user-123',
      );

      expect(cdpService.checkVoucher).toHaveBeenCalledWith({
        voucher_code: 'DISCOUNT10',
        merchant_code: 'CCHAT',
        customer_id: undefined,
      });
      expect(checkoutService.applyVoucherToSession).toHaveBeenCalled();
    });

    it('should throw error when voucher not found', async () => {
      cdpService.checkVoucher.mockRejectedValue(new Error('Voucher not found'));

      await expect(
        service.applyVoucher('session-123', { code: 'INVALID' }, 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidVoucher');
    });

    it('should throw error when CDP returns error code', async () => {
      const mockCdpResponse = {
        code: 1,
        is_valid: false,
        message: 'Voucher expired',
      };

      cdpService.checkVoucher.mockResolvedValue(mockCdpResponse as any);

      await expect(
        service.applyVoucher('session-123', { code: 'EXPIRED' }, 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should use provided checkoutSessionId if available', async () => {
      const mockCdpResponse = {
        code: 0,
        is_valid: true,
        promotion_code: 'DISCOUNT10',
        voucher_detail: {
          voucher_id: 'cdp-123',
          voucher_event_name: '10% Discount',
          discount_value: 10000,
          discount_type: 1,
        },
      };

      cdpService.checkVoucher.mockResolvedValue(mockCdpResponse as any);
      checkoutService.applyVoucherToSession.mockResolvedValue({} as any);

      await service.applyVoucher(
        'session-123',
        {
          code: 'DISCOUNT10',
          checkoutSessionId: 'existing-session-123',
        },
        'user-123',
      );

      expect(checkoutService.upsertSession).not.toHaveBeenCalled();
      expect(checkoutService.applyVoucherToSession).toHaveBeenCalledWith(
        'existing-session-123',
        'session-123',
        expect.any(Object),
        'user-123',
      );
    });

    it('should handle CDP service error gracefully', async () => {
      cdpService.checkVoucher.mockRejectedValue(new Error('Network error'));

      await expect(
        service.applyVoucher('session-123', { code: 'TEST' }, 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should require login when no userId for CDP voucher', async () => {
      await expect(
        service.applyVoucher('session-123', { code: 'CDP_VOUCHER' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should let a guest apply a single-use-per-customer promo code', async () => {
      promotionsService.findOrderDiscountByPromoCode.mockResolvedValue({
        id: 'order-promo-single-use',
        status: PromotionStatus.ACTIVE,
        orderDiscountConfig: {
          subType: OrderDiscountSubType.PROMO_CODE,
          singleUsePerCustomer: true,
          minimumOrderValue: 0,
          discountType: 1,
          discountValue: 10000,
        },
      } as any);
      checkoutService.applyOrderDiscountToSession.mockResolvedValue({} as any);

      await service.applyVoucher('session-123', {
        code: 'SAVE10',
        checkoutSessionId: 'checkout-1',
      });

      expect(checkoutService.applyOrderDiscountToSession).toHaveBeenCalledWith(
        'checkout-1',
        'session-123',
        expect.any(Object),
        undefined,
      );
      // No user identity to look up, so the per-customer check is skipped
      expect(
        promotionUsageRecordRepository.existsByPromotionIdAndUserId,
      ).not.toHaveBeenCalled();
    });

    it('should still block a logged-in customer who already used a single-use promo code', async () => {
      promotionsService.findOrderDiscountByPromoCode.mockResolvedValue({
        id: 'order-promo-single-use',
        status: PromotionStatus.ACTIVE,
        orderDiscountConfig: {
          subType: OrderDiscountSubType.PROMO_CODE,
          singleUsePerCustomer: true,
          minimumOrderValue: 0,
          discountType: 1,
          discountValue: 10000,
        },
      } as any);
      promotionUsageRecordRepository.existsByPromotionIdAndUserId.mockResolvedValue(
        true,
      );

      await expect(
        service.applyVoucher(
          'session-123',
          { code: 'SAVE10', checkoutSessionId: 'checkout-1' },
          'user-1',
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
      expect(i18n.t).toHaveBeenCalledWith(
        'shop.promotion.voucherMaxUsagePerCustomerExceeded',
      );
    });

    it('should still block a guest when the promo code ran out of total usage', async () => {
      promotionsService.findOrderDiscountByPromoCode.mockResolvedValue({
        id: 'order-promo-exhausted',
        status: PromotionStatus.ACTIVE,
        orderDiscountConfig: {
          subType: OrderDiscountSubType.PROMO_CODE,
          singleUsePerCustomer: false,
          totalUsageLimit: 100,
          currentUsageCount: 100,
          minimumOrderValue: 0,
          discountType: 1,
          discountValue: 10000,
        },
      } as any);

      await expect(
        service.applyVoucher('session-123', { code: 'SAVE10' }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
      expect(i18n.t).toHaveBeenCalledWith(
        'shop.promotion.voucherUsageLimitExceeded',
      );
      expect(
        checkoutService.applyOrderDiscountToSession,
      ).not.toHaveBeenCalled();
    });

    it('should let a guest apply a non-single-use promo code', async () => {
      promotionsService.findOrderDiscountByPromoCode.mockResolvedValue({
        id: 'order-promo-public',
        status: PromotionStatus.ACTIVE,
        orderDiscountConfig: {
          subType: OrderDiscountSubType.PROMO_CODE,
          singleUsePerCustomer: false,
          minimumOrderValue: 0,
          discountType: 1,
          discountValue: 10000,
        },
      } as any);
      checkoutService.applyOrderDiscountToSession.mockResolvedValue({} as any);

      await service.applyVoucher('session-123', {
        code: 'PUBLIC10',
        checkoutSessionId: 'checkout-1',
      });

      expect(checkoutService.applyOrderDiscountToSession).toHaveBeenCalledWith(
        'checkout-1',
        'session-123',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('applyProductDiscount', () => {
    it('should let a guest apply a single-use-per-customer order discount', async () => {
      promotionsService.findById.mockResolvedValue({
        id: 'order-promo-single-use',
        status: PromotionStatus.ACTIVE,
        orderDiscountConfig: {
          subType: OrderDiscountSubType.AUTO_APPLY,
          singleUsePerCustomer: true,
          minimumOrderValue: 0,
          discountType: 1,
          discountValue: 10000,
        },
      } as any);
      checkoutService.applyOrderDiscountToSession.mockResolvedValue({} as any);

      await service.applyProductDiscount(
        {
          promotionId: 'order-promo-single-use',
          checkoutSessionId: 'checkout-1',
        },
        'session-123',
      );

      expect(checkoutService.applyOrderDiscountToSession).toHaveBeenCalledWith(
        'checkout-1',
        'session-123',
        expect.any(Object),
        undefined,
      );
      expect(
        promotionUsageRecordRepository.existsByPromotionIdAndUserId,
      ).not.toHaveBeenCalled();
    });
  });

  describe('removeVoucher', () => {
    it('should remove voucher from checkout session', async () => {
      checkoutService.removeVoucherFromSession.mockResolvedValue({} as any);

      await service.removeVoucher(
        'checkout-session-123',
        'DISCOUNT10',
        'session-123',
      );

      expect(checkoutService.removeVoucherFromSession).toHaveBeenCalledWith(
        'checkout-session-123',
        'session-123',
        'DISCOUNT10',
        undefined,
      );
    });

    it('should pass userId when provided', async () => {
      checkoutService.removeVoucherFromSession.mockResolvedValue({} as any);

      await service.removeVoucher(
        'checkout-session-123',
        'DISCOUNT10',
        'session-123',
        'user-123',
      );

      expect(checkoutService.removeVoucherFromSession).toHaveBeenCalledWith(
        'checkout-session-123',
        'session-123',
        'DISCOUNT10',
        'user-123',
      );
    });
  });

  describe('addGiftToCart', () => {
    const addGiftDto = {
      promotionId: 'promo-123',
      tierId: '100000',
      productId: 'gift-123',
      variantId: undefined,
    };

    it('should add gift to cart successfully', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithItems = {
        ...mockCart,
        items: [createCartItem({ quantity: 2 })],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithItems);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addGiftDto);

      expect(promotionsService.findById).toHaveBeenCalledWith('promo-123');
      expect(productRepository.findById).toHaveBeenCalledWith('gift-123');
      expect(cartRepository.update).toHaveBeenCalled();
      expect(cartService.getCart).toHaveBeenCalledWith(
        'session-123',
        undefined,
      );
    });

    it('should throw error when promotion not found', async () => {
      promotionsService.findById.mockResolvedValue(null);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidPromotion');
    });

    it('should throw error when promotion is not active', async () => {
      const inactivePromotion = {
        ...mockBundleDealPromotion,
        status: PromotionStatus.PAUSED,
      };
      promotionsService.findById.mockResolvedValue(inactivePromotion);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('should throw error when tier not found', async () => {
      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);

      await expect(
        service.addGiftToCart('session-123', {
          ...addGiftDto,
          tierId: 'invalid-tier',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidTier');
    });

    it('should throw error when product is not in tier gift products', async () => {
      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);

      await expect(
        service.addGiftToCart('session-123', {
          ...addGiftDto,
          productId: 'invalid-product',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidGiftProduct');
    });

    it('should throw error when product not found', async () => {
      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('product.notFound');
    });

    it('should throw error when product is out of stock', async () => {
      const outOfStockProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 0, remain: 0 },
      };
      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(outOfStockProduct);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.giftOutOfStock');
    });

    it('should throw error when cart total is below tier minimum', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithLowTotal = {
        ...mockCart,
        items: [createCartItem({ price: 50000 })],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithLowTotal);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.notEligible');
    });

    it('should create cart if not exists', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithItems = {
        ...mockCart,
        items: [createCartItem({ quantity: 2 })],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(cartWithItems)
        .mockResolvedValueOnce(cartWithItems);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addGiftDto);

      expect(cartService.getCart).toHaveBeenCalledTimes(2);
    });

    it('should require variantId for products with variants', async () => {
      const productWithVariants = {
        ...mockProduct,
        id: 'gift-123',
        variants: [
          {
            ...mockProduct,
            id: 'variant-1',
            name: 'Size M',
            inventory: { available: 5, remain: 5 },
          },
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(productWithVariants);

      await expect(
        service.addGiftToCart('session-123', addGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.variantRequired');
    });

    it('should validate variant stock', async () => {
      const productWithVariants = {
        ...mockProduct,
        id: 'gift-123',
        variants: [
          {
            ...mockProduct,
            id: 'variant-1',
            name: 'Size M',
            inventory: { available: 0, remain: 0 },
          },
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(productWithVariants);

      await expect(
        service.addGiftToCart('session-123', {
          ...addGiftDto,
          variantId: 'variant-1',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.giftOutOfStock');
    });

    it('should remove existing gifts before adding new one', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithExistingGift = {
        ...mockCart,
        items: [
          createCartItem({ quantity: 2 }),
          createCartItem({ productId: 'old-gift', price: 0, isGift: true }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBundleDealPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithExistingGift);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addGiftDto);

      const updateCall = cartRepository.update.mock.calls[0];
      const updatedItems = updateCall?.[1]?.items;

      expect(updatedItems).toHaveLength(2);
      expect(updatedItems?.filter((item: any) => item.isGift)).toHaveLength(1);
    });
  });

  describe('addGiftToCart - BUY_X_GET_Y', () => {
    const addBxyGiftDto = {
      promotionId: 'promo-bxy',
      productId: 'gift-123',
      quantity: 1,
    };

    it('should add gift to cart successfully for BUY_X_GET_Y', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithRequiredItems = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithRequiredItems);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addBxyGiftDto);

      expect(cartRepository.update).toHaveBeenCalled();
      const updateCall = cartRepository.update.mock.calls[0];
      const updatedItems = updateCall?.[1]?.items;
      const giftItems = updatedItems?.filter((item: any) => item.isGift);
      expect(giftItems).toHaveLength(1);
      expect(giftItems![0].quantity).toBe(1);
      expect(giftItems![0].promotionTierId).toBe('buy_x_get_y');
    });

    it('should throw when required quantity not met', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithInsufficientItems = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 2,
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(
        cartWithInsufficientItems,
      );

      await expect(
        service.addGiftToCart('session-123', addBxyGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.notEligible');
    });

    it('should throw when cart total is below minimumOrderValue', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithLowTotal = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 10000,
            quantity: 3,
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithLowTotal);

      await expect(
        service.addGiftToCart('session-123', addBxyGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.notEligible');
    });

    it('should replace existing gifts when gift quantity would be exceeded', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithExistingGifts = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
          createCartItem({
            productId: 'gift-123',
            price: 0,
            quantity: 2,
            isGift: true,
            promotionId: 'promo-bxy',
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithExistingGifts);

      // Service now replaces existing gifts instead of throwing
      await service.addGiftToCart('session-123', addBxyGiftDto);

      expect(cartRepository.update).toHaveBeenCalled();
    });

    it('should throw when global gift limit reached', async () => {
      const promotionAtLimit = {
        ...mockBuyXGetYPromotion,
        bundleDealConfig: {
          ...mockBuyXGetYPromotion.bundleDealConfig,
          maxGiftQuantity: 5,
          currentGiftCount: 5,
        },
      };
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithRequiredItems = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(promotionAtLimit);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithRequiredItems);

      await expect(
        service.addGiftToCart('session-123', addBxyGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.giftLimitReached');
    });

    it('should throw when product is not in gift products list', async () => {
      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);

      await expect(
        service.addGiftToCart('session-123', {
          ...addBxyGiftDto,
          productId: 'not-a-gift-product',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidGiftProduct');
    });

    it('should increment quantity of existing gift item', async () => {
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithExistingGift = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
          createCartItem({
            productId: 'gift-123',
            price: 0,
            quantity: 1,
            isGift: true,
            promotionId: 'promo-bxy',
            promotionTierId: 'buy_x_get_y',
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(mockBuyXGetYPromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithExistingGift);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addBxyGiftDto);

      const updateCall = cartRepository.update.mock.calls[0];
      const updatedItems = updateCall?.[1]?.items;
      const giftItems = updatedItems?.filter((item: any) => item.isGift);
      expect(giftItems).toHaveLength(1);
      expect(giftItems![0].quantity).toBe(2);
    });

    it('should throw when promotion has incomplete BUY_X_GET_Y config', async () => {
      const incompletePromotion = {
        ...mockBuyXGetYPromotion,
        bundleDealConfig: {
          ...mockBuyXGetYPromotion.bundleDealConfig,
          requiredProducts: [],
        },
      };

      promotionsService.findById.mockResolvedValue(incompletePromotion);

      await expect(
        service.addGiftToCart('session-123', addBxyGiftDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.invalidPromotion');
    });

    it('should clear other promotion vouchers when exclusive', async () => {
      const exclusivePromotion = {
        ...mockBuyXGetYPromotion,
        bundleDealConfig: {
          ...mockBuyXGetYPromotion.bundleDealConfig,
          notApplicableWithOtherPromotions: true,
        },
      };
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithRequiredItems = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
        ],
      };

      promotionsService.findById.mockResolvedValue(exclusivePromotion);
      productRepository.findById.mockResolvedValue(giftProduct);
      cartRepository.findBySessionId.mockResolvedValue(cartWithRequiredItems);
      cartService.getCart.mockResolvedValue({} as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.addGiftToCart('session-123', addBxyGiftDto);

      expect(
        checkoutService.clearVouchersAndProductDiscounts,
      ).toHaveBeenCalledWith('session-123', undefined);
    });
  });

  describe('checkBundleDealEligibility - BUY_X_GET_Y', () => {
    it('should return eligibility info for BUY_X_GET_Y promotions', async () => {
      const requiredProduct = {
        ...mockProduct,
        id: 'required-1',
        inventory: { available: 10, remain: 10 },
      };
      const giftProduct = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 5, remain: 5 },
      };
      const cartWithRequired = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'required-1',
            price: 50000,
            quantity: 3,
          }),
        ],
      };

      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBuyXGetYPromotion,
      ]);
      cartRepository.findBySessionId.mockResolvedValue(cartWithRequired);
      productRepository.findByIds.mockResolvedValue([
        requiredProduct,
        giftProduct,
      ]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toHaveLength(1);
      expect(result[0].promotionId).toBe('promo-bxy');
      expect(result[0].subType).toBe(BundleDealSubType.BUY_X_GET_Y);
      expect(result[0].requiredQuantity).toBe(3);
      expect(result[0].currentRequiredQuantity).toBe(3);
      expect(result[0].giftQuantity).toBe(2);
      expect(result[0].remainingGiftQuantity).toBe(2);
      expect(result[0].eligibleTiers).toHaveLength(0);
    });

    it('should skip BUY_X_GET_Y promotions with no available gift stock', async () => {
      const requiredProduct = {
        ...mockProduct,
        id: 'required-1',
        inventory: { available: 10, remain: 10 },
      };
      const outOfStockGift = {
        ...mockProduct,
        id: 'gift-123',
        inventory: { available: 0, remain: 0 },
        variants: [],
      };

      promotionsService.getActiveBundleDeals.mockResolvedValue([
        mockBuyXGetYPromotion,
      ]);
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      productRepository.findByIds.mockResolvedValue([
        requiredProduct,
        outOfStockGift,
      ]);

      const result = await service.checkBundleDealEligibility(
        { cartTotal: 150000 },
        'session-123',
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('removeGiftFromCart - quantity decrement', () => {
    it('should decrement quantity when gift has quantity > 1', async () => {
      const cartWithMultiGift = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'gift-123',
            price: 0,
            quantity: 3,
            isGift: true,
            promotionId: 'promo-bxy',
          }),
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithMultiGift);
      cartRepository.update.mockResolvedValue({} as any);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart('session-123', 'gift-123');

      const updateCall = cartRepository.update.mock.calls[0];
      const updatedItems = updateCall?.[1]?.items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems![0].quantity).toBe(2);
    });

    it('should remove item entirely when quantity is 1', async () => {
      const cartWithSingleGift = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'gift-123',
            price: 0,
            quantity: 1,
            isGift: true,
            promotionId: 'promo-bxy',
          }),
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithSingleGift);
      cartRepository.update.mockResolvedValue({} as any);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart('session-123', 'gift-123');

      const updateCall = cartRepository.update.mock.calls[0];
      const updatedItems = updateCall?.[1]?.items;
      expect(updatedItems).toHaveLength(0);
    });
  });

  describe('removeGiftFromCart', () => {
    it('should remove gift from cart successfully', async () => {
      const cartWithGift = {
        ...mockCart,
        items: [
          createCartItem(),
          createCartItem({ productId: 'gift-123', price: 0, isGift: true }),
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithGift);
      cartRepository.update.mockResolvedValue({} as any);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart('session-123', 'gift-123');

      expect(cartRepository.update).toHaveBeenCalled();
      expect(cartService.getCart).toHaveBeenCalledWith(
        'session-123',
        undefined,
      );
    });

    it('should throw error when cart not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);

      await expect(
        service.removeGiftFromCart('session-123', 'gift-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.cart.notFound');
    });

    it('should throw error when gift not found in cart', async () => {
      const cartWithoutGift = {
        ...mockCart,
        items: [createCartItem()],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithoutGift);

      await expect(
        service.removeGiftFromCart('session-123', 'gift-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.promotion.giftNotFound');
    });

    it('should handle gift removed by concurrent request', async () => {
      const cartWithGift = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'gift-123', price: 0, isGift: true }),
        ],
      };
      const cartWithoutGift = {
        ...mockCart,
        items: [],
      };

      cartRepository.findBySessionId
        .mockResolvedValueOnce(cartWithGift)
        .mockResolvedValueOnce(cartWithoutGift);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart('session-123', 'gift-123');

      expect(cartRepository.update).not.toHaveBeenCalled();
      expect(cartService.getCart).toHaveBeenCalledWith(
        'session-123',
        undefined,
      );
    });

    it('should match gift with variantId', async () => {
      const cartWithVariantGift = {
        ...mockCart,
        items: [
          createCartItem({
            productId: 'gift-123',
            variantId: 'variant-1',
            price: 0,
            isGift: true,
          }),
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithVariantGift);
      cartRepository.update.mockResolvedValue({} as any);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart('session-123', 'gift-123', 'variant-1');

      expect(cartRepository.update).toHaveBeenCalled();
    });

    it('should use userId to find cart when provided', async () => {
      const cartWithGift = {
        ...mockCart,
        items: [
          createCartItem({ productId: 'gift-123', price: 0, isGift: true }),
        ],
      };

      cartRepository.findByUserId.mockResolvedValue(cartWithGift);
      cartRepository.update.mockResolvedValue({} as any);
      cartService.getCart.mockResolvedValue({} as any);

      await service.removeGiftFromCart(
        'session-123',
        'gift-123',
        undefined,
        'user-123',
      );

      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(cartService.getCart).toHaveBeenCalledWith(
        'session-123',
        'user-123',
      );
    });
  });
});
