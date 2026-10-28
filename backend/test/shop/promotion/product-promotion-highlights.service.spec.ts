import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { BundleDealSubType } from '../../../src/promotions/domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../../../src/promotions/domain/order-discount-sub-type.enum';
import { PromotionRepository } from '../../../src/promotions/domain/promotion.repository';
import { ShippingPromotionRepository } from '../../../src/shipping-promotions/domain/shipping-promotion.repository';
import {
  ProductPromotionDiscountType,
  ProductPromotionShippingType,
} from '../../../src/shop/promotion/dto/product-promotion-highlights-response.dto';
import { ProductPromotionHighlightsService } from '../../../src/shop/promotion/product-promotion-highlights.service';
import {
  createBuyToGetGift,
  createBuyXGetY,
  createFreeship,
  createOrderDiscount,
  createProduct,
  createShippingDiscount,
  deletedGiftProductId,
  giftProductId,
  hiddenGiftProductId,
  inactiveGiftProductId,
  productId,
  zeroPriceGiftProductId,
} from './product-promotion-highlights.fixtures';

describe('ProductPromotionHighlightsService', () => {
  let productRepository: jest.Mocked<ProductRepository>;
  let promotionRepository: jest.Mocked<PromotionRepository>;
  let shippingPromotionRepository: jest.Mocked<ShippingPromotionRepository>;
  let cacheManager: jest.Mocked<Cache>;
  let service: ProductPromotionHighlightsService;

  beforeEach(() => {
    productRepository = {
      findPromotionDisplayByIds: jest.fn(),
      findPromotionVariantAvailabilityByParentIds: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;
    promotionRepository = {
      findActiveForProductHighlights: jest.fn(),
    } as unknown as jest.Mocked<PromotionRepository>;
    shippingPromotionRepository = {
      findActiveForDisplay: jest.fn(),
    } as unknown as jest.Mocked<ShippingPromotionRepository>;
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    service = new ProductPromotionHighlightsService(
      productRepository,
      promotionRepository,
      shippingPromotionRepository,
      { t: jest.fn((key: string) => key) } as unknown as I18nService,
      cacheManager,
    );
    cacheManager.get.mockResolvedValue(undefined);
    cacheManager.set.mockResolvedValue(undefined);
    productRepository.findPromotionVariantAvailabilityByParentIds.mockResolvedValue(
      [],
    );
  });

  it('should return a compact proto-compatible response and filter exhausted offers', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const giftProduct = createProduct(giftProductId, 'Gift product');
    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([giftProduct]);
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createOrderDiscount('order-code', {
        subType: OrderDiscountSubType.PROMO_CODE,
        promoCode: 'SAVE15',
        discountType: DiscountType.PERCENTAGE,
      }),
      createOrderDiscount('order-auto', {
        subType: OrderDiscountSubType.AUTO_APPLY,
        promoCode: undefined,
        discountType: DiscountType.FIXED,
      }),
      createOrderDiscount('order-exhausted', {
        currentUsageCount: 10,
        totalUsageLimit: 10,
      }),
      createBuyToGetGift(),
      createBuyXGetY(),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([
      createFreeship(),
      createShippingDiscount(),
    ]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result.productId).toBe(productId);
    expect(
      result.shippingPromotions.map((promotion) => promotion.type),
    ).toEqual([
      ProductPromotionShippingType.FREESHIP,
      ProductPromotionShippingType.SHIPPING_DISCOUNT,
    ]);
    expect(result.shippingPromotions[1].tiers[0].discountType).toBe(
      ProductPromotionDiscountType.FIXED,
    );
    expect(result.orderDiscounts).toHaveLength(2);
    expect(
      result.orderDiscounts.find(
        (promotion) => promotion.promotionId === 'order-code',
      ),
    ).toMatchObject({
      promotionId: 'order-code',
      promoCode: 'SAVE15',
      discountType: ProductPromotionDiscountType.PERCENTAGE,
    });
    expect(
      result.orderDiscounts.find(
        (promotion) => promotion.promotionId === 'order-auto',
      ),
    ).toMatchObject({
      promotionId: 'order-auto',
      promoCode: undefined,
      discountType: ProductPromotionDiscountType.FIXED,
    });
    expect(result.giftPromotions).toHaveLength(2);
    expect(
      result.giftPromotions.find(
        (promotion) => promotion.promotionId === 'buy-x-get-y',
      ),
    ).toMatchObject({
      promotionId: 'buy-x-get-y',
      giftProducts: [
        expect.objectContaining({
          productId: giftProductId,
          isAvailable: true,
        }),
      ],
    });
    expect(
      promotionRepository.findActiveForProductHighlights,
    ).toHaveBeenCalledWith(productId);
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenNthCalledWith(
      1,
      [productId],
    );
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenNthCalledWith(
      2,
      [giftProductId],
    );
    expect(cacheManager.set).toHaveBeenCalledWith(
      expect.stringContaining(productId),
      result,
      expect.any(Number),
    );
    const ttl = cacheManager.set.mock.calls[0][2] as number;
    expect(ttl).toBeGreaterThanOrEqual(1_000);
    expect(ttl).toBeLessThanOrEqual(30_000);
  });

  it('should return the shared cached response without querying repositories', async () => {
    const cached = {
      productId,
      shippingPromotions: [],
      orderDiscounts: [],
      giftPromotions: [],
    };
    cacheManager.get.mockResolvedValue(cached);

    await expect(
      service.getProductPromotionHighlights(productId),
    ).resolves.toBe(cached);
    expect(productRepository.findPromotionDisplayByIds).not.toHaveBeenCalled();
    expect(
      promotionRepository.findActiveForProductHighlights,
    ).not.toHaveBeenCalled();
  });

  it('should reject malformed product IDs without touching storage', async () => {
    await expect(
      service.getProductPromotionHighlights('not-an-object-id'),
    ).rejects.toMatchObject({ status: 404 });
    expect(cacheManager.get).not.toHaveBeenCalled();
    expect(productRepository.findPromotionDisplayByIds).not.toHaveBeenCalled();
  });

  it('should keep configured gifts for display and expose their availability', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const unavailableGift = createProduct(giftProductId, 'Unavailable gift');
    unavailableGift.inventory = { remain: 0, available: 0 };
    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([unavailableGift]);
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createBuyToGetGift(),
      createBuyXGetY(),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result.giftPromotions).toHaveLength(2);
    expect(
      result.giftPromotions.flatMap((promotion) => [
        ...promotion.giftProducts,
        ...promotion.tiers.flatMap((tier) => tier.giftProducts),
      ]),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: giftProductId,
          isAvailable: false,
        }),
      ]),
    );
  });

  it('should omit non-public gifts and only mark active out-of-stock gifts unavailable', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const outOfStockGift = createProduct(giftProductId, 'Out-of-stock gift');
    outOfStockGift.inventory = { remain: 0, available: 0 };

    const hiddenGift = createProduct(hiddenGiftProductId, 'Hidden gift');
    hiddenGift.hide = true;

    const inactiveGift = createProduct(inactiveGiftProductId, 'Inactive gift');
    inactiveGift.status = ProductStatus.INACTIVE;

    const deletedGift = createProduct(deletedGiftProductId, 'Deleted gift');
    deletedGift.deletedAt = new Date();

    const zeroPriceGift = createProduct(
      zeroPriceGiftProductId,
      'Zero-price active gift',
    );
    zeroPriceGift.prices = { retail: 0 };

    const configuredGiftIds = [
      giftProductId,
      hiddenGiftProductId,
      inactiveGiftProductId,
      deletedGiftProductId,
      zeroPriceGiftProductId,
    ];
    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([
        outOfStockGift,
        hiddenGift,
        inactiveGift,
        deletedGift,
        zeroPriceGift,
      ]);
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createBuyToGetGift(configuredGiftIds),
      createBuyXGetY({
        giftProducts: configuredGiftIds.map((configuredProductId) => ({
          productId: configuredProductId,
          name: '',
          image: '',
        })),
      }),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);

    const result = await service.getProductPromotionHighlights(productId);
    const mappedGifts = result.giftPromotions.flatMap((promotion) => [
      ...promotion.giftProducts,
      ...promotion.tiers.flatMap((tier) => tier.giftProducts),
    ]);

    expect(result.giftPromotions).toHaveLength(2);
    expect(mappedGifts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: giftProductId,
          isAvailable: false,
        }),
        expect.objectContaining({
          productId: zeroPriceGiftProductId,
          isAvailable: true,
        }),
      ]),
    );
    expect(mappedGifts.map((product) => product.productId)).not.toEqual(
      expect.arrayContaining([
        hiddenGiftProductId,
        inactiveGiftProductId,
        deletedGiftProductId,
      ]),
    );
  });

  it('should use live variants when embedded gift availability is stale', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const parentGift = createProduct(giftProductId, 'Parent gift');
    const staleEmbeddedVariant = createProduct(
      '507f1f77bcf86cd799439021',
      'Stale embedded in-stock variant',
    );
    parentGift.variants = [staleEmbeddedVariant];

    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([parentGift]);
    productRepository.findPromotionVariantAvailabilityByParentIds.mockResolvedValue(
      [
        {
          parentProductId: giftProductId,
          variantId: staleEmbeddedVariant.id,
          hide: true,
          status: ProductStatus.ACTIVE,
          available: 5,
        },
        {
          parentProductId: giftProductId,
          variantId: '507f1f77bcf86cd799439022',
          hide: false,
          status: ProductStatus.ACTIVE,
          available: 0,
        },
      ],
    );
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createBuyXGetY(),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result.giftPromotions[0].giftProducts).toEqual([
      expect.objectContaining({
        productId: giftProductId,
        isAvailable: false,
      }),
    ]);
    expect(
      productRepository.findPromotionVariantAvailabilityByParentIds,
    ).toHaveBeenCalledWith([giftProductId]);
  });

  it('should omit parent gifts when the live child query returns empty', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const parentGift = createProduct(giftProductId, 'Parent gift');
    const staleEmbeddedVariant = createProduct(
      '507f1f77bcf86cd799439023',
      'Deleted live variant still embedded',
    );
    parentGift.variants = [staleEmbeddedVariant];

    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([parentGift]);
    productRepository.findPromotionVariantAvailabilityByParentIds.mockResolvedValue(
      [],
    );
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createBuyXGetY(),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result.giftPromotions).toEqual([]);
    expect(
      productRepository.findPromotionVariantAvailabilityByParentIds,
    ).toHaveBeenCalledWith([giftProductId]);
  });

  it('should omit BUY_X_GET_Y promotions whose global gift quota is exhausted', async () => {
    const currentProduct = createProduct(productId, 'Trigger product');
    const giftProduct = createProduct(giftProductId, 'Gift product');
    productRepository.findPromotionDisplayByIds
      .mockResolvedValueOnce([currentProduct])
      .mockResolvedValueOnce([giftProduct]);
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([
      createBuyXGetY({ maxGiftQuantity: 3, currentGiftCount: 3 }),
    ]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result.giftPromotions).toEqual([]);
  });
});
