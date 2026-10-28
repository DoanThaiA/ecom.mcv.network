import { Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { Product } from '../../../src/products/domain/product';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { PromotionRepository } from '../../../src/promotions/domain/promotion.repository';
import { ShippingPromotionRepository } from '../../../src/shipping-promotions/domain/shipping-promotion.repository';
import { ProductPromotionHighlightsService } from '../../../src/shop/promotion/product-promotion-highlights.service';

describe('ProductPromotionHighlightsService resilience', () => {
  const productId = '507f1f77bcf86cd799439011';

  let productRepository: jest.Mocked<ProductRepository>;
  let promotionRepository: jest.Mocked<PromotionRepository>;
  let shippingPromotionRepository: jest.Mocked<ShippingPromotionRepository>;
  let cacheManager: jest.Mocked<Cache>;
  let service: ProductPromotionHighlightsService;
  let loggerWarnSpy: jest.SpyInstance;

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
    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

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
    promotionRepository.findActiveForProductHighlights.mockResolvedValue([]);
    shippingPromotionRepository.findActiveForDisplay.mockResolvedValue([]);
  });

  afterEach(() => {
    loggerWarnSpy.mockRestore();
  });

  it('should skip the referenced-product batch query when promotions have no product references', async () => {
    productRepository.findPromotionDisplayByIds.mockResolvedValue([
      createProduct(),
    ]);

    const result = await service.getProductPromotionHighlights(productId);

    expect(result).toEqual({
      productId,
      shippingPromotions: [],
      orderDiscounts: [],
      giftPromotions: [],
    });
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenCalledTimes(
      1,
    );
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenCalledWith([
      productId,
    ]);
    expect(
      productRepository.findPromotionVariantAvailabilityByParentIds,
    ).not.toHaveBeenCalled();
  });

  it.each([
    ['hidden', { hide: true }],
    ['inactive', { status: ProductStatus.INACTIVE }],
  ] as const)(
    'should return 404 for a %s product',
    async (_label, overrides) => {
      productRepository.findPromotionDisplayByIds.mockResolvedValue([
        createProduct(overrides),
      ]);

      await expect(
        service.getProductPromotionHighlights(productId),
      ).rejects.toMatchObject({ status: 404 });
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(productRepository.findPromotionDisplayByIds).toHaveBeenCalledTimes(
        1,
      );
    },
  );

  it('should remain available when shared cache reads and writes fail', async () => {
    cacheManager.get.mockRejectedValueOnce(new Error('cache read failed'));
    cacheManager.set.mockRejectedValueOnce(new Error('cache write failed'));
    productRepository.findPromotionDisplayByIds.mockResolvedValue([
      createProduct(),
    ]);

    await expect(
      service.getProductPromotionHighlights(productId),
    ).resolves.toMatchObject({ productId });
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenCalledTimes(
      1,
    );
    expect(loggerWarnSpy).toHaveBeenCalledTimes(2);
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('cache read failed'),
    );
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('cache write failed'),
    );
  });

  it('should coalesce concurrent cache misses into one repository load', async () => {
    let resolveCurrentProduct!: (products: Product[]) => void;
    const currentProductLookup = new Promise<Product[]>((resolve) => {
      resolveCurrentProduct = resolve;
    });
    productRepository.findPromotionDisplayByIds.mockReturnValue(
      currentProductLookup,
    );

    const firstRequest = service.getProductPromotionHighlights(productId);
    const secondRequest = service.getProductPromotionHighlights(productId);
    resolveCurrentProduct([createProduct()]);

    const [firstResult, secondResult] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(firstResult).toBe(secondResult);
    expect(cacheManager.get).toHaveBeenCalledTimes(2);
    expect(productRepository.findPromotionDisplayByIds).toHaveBeenCalledTimes(
      1,
    );
    expect(
      promotionRepository.findActiveForProductHighlights,
    ).toHaveBeenCalledTimes(1);
    expect(
      shippingPromotionRepository.findActiveForDisplay,
    ).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).toHaveBeenCalledTimes(1);
  });

  function createProduct(overrides: Partial<Product> = {}): Product {
    return {
      id: productId,
      businessId: '1',
      source: 'nhanh',
      code: 'PDP-001',
      name: 'PDP product',
      hide: false,
      prices: { retail: 100_000 },
      images: { avatar: 'product.jpg' },
      inventory: { remain: 5, available: 5 },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
});
