import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from '../../src/recommendations/recommendations.service';
import { ProductViewsService } from '../../src/product-views/product-views.service';
import { ProductViewRepository } from '../../src/product-views/domain/product-view.repository';
import { ProductRecommendationRepository } from '../../src/recommendations/domain/product-recommendation.repository';
import { OrderRepository } from '../../src/shop/order/domain/order.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { Product } from '../../src/products/domain/product';
import { ProductStatus } from '../../src/products/domain/product-status.enum';

describe('RecommendationsService variant filtering', () => {
  let service: RecommendationsService;
  let productRepository: jest.Mocked<ProductRepository>;
  let productRecommendationRepository: jest.Mocked<ProductRecommendationRepository>;
  let productViewRepository: jest.Mocked<ProductViewRepository>;
  let productViewsService: jest.Mocked<ProductViewsService>;
  let orderRepository: jest.Mocked<OrderRepository>;

  const makeParent = (id: string, variants: any[]): Product =>
    ({
      id,
      status: ProductStatus.ACTIVE,
      variants,
      variantOptions: variants
        .flatMap((v) => v.attributes ?? [])
        .reduce<Array<{ id: string; name: string; values: string[] }>>(
          (acc, attr) => {
            const found = acc.find((o) => o.name === attr.name);
            if (found) {
              if (!found.values.includes(attr.value)) {
                found.values.push(attr.value);
              }
            } else {
              acc.push({
                id: String(attr.id),
                name: attr.name,
                values: [attr.value],
              });
            }
            return acc;
          },
          [],
        ),
    }) as unknown as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: ProductViewsService,
          useValue: {
            getUserViewedCategoryIds: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ProductViewRepository,
          useValue: { getTopViewedProductIds: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: ProductRecommendationRepository,
          useValue: {
            findPersonalized: jest.fn(),
            findCrossSell: jest.fn(),
            findTrending: jest.fn(),
            upsertPersonalized: jest.fn(),
            upsertCrossSell: jest.fn(),
            upsertTrending: jest.fn(),
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            getUserPurchaseHistory: jest
              .fn()
              .mockResolvedValue({ productIds: [], categoryIds: [] }),
            findCoPurchasedProductIds: jest.fn().mockResolvedValue([]),
            getDistinctUserIds: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            findActiveByIds: jest.fn(),
            findPopularByCategories: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    productRepository = module.get(ProductRepository);
    productRecommendationRepository = module.get(
      ProductRecommendationRepository,
    );
    productViewRepository = module.get(ProductViewRepository);
    productViewsService = module.get(ProductViewsService);
    orderRepository = module.get(OrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalizedRecommendations', () => {
    it('should exclude parent products with zero ACTIVE variants from cached result', async () => {
      productRecommendationRepository.findPersonalized.mockResolvedValue({
        userId: 'u1',
        recommendedProductIds: ['p-dead', 'p-live'],
        computedAt: new Date(),
      } as any);

      productRepository.findActiveByIds.mockResolvedValue([
        makeParent('p-dead', [
          { status: ProductStatus.INACTIVE, attributes: [] },
        ]),
        makeParent('p-live', [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ]),
      ]);

      const result = await service.getPersonalizedRecommendations('u1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p-live');
    });

    it('should strip non-ACTIVE variant colors from cached result', async () => {
      productRecommendationRepository.findPersonalized.mockResolvedValue({
        userId: 'u1',
        recommendedProductIds: ['p-1'],
        computedAt: new Date(),
      } as any);

      productRepository.findActiveByIds.mockResolvedValue([
        makeParent('p-1', [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
          {
            status: ProductStatus.INACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Xám' }],
          },
        ]),
      ]);

      const result = await service.getPersonalizedRecommendations('u1');

      expect(result).toHaveLength(1);
      expect(result[0].variantOptions).toEqual([
        { id: '1', name: 'Màu', values: ['Đỏ'] },
      ]);
    });

    it('should filter the fresh (uncached) result path as well', async () => {
      productRecommendationRepository.findPersonalized.mockResolvedValue(null);
      productViewRepository.getTopViewedProductIds.mockResolvedValue([
        'p-dead',
        'p-live',
      ]);

      productRepository.findActiveByIds.mockResolvedValue([
        makeParent('p-dead', [
          { status: ProductStatus.DISCONTINUED, attributes: [] },
        ]),
        makeParent('p-live', [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ]),
      ]);

      const result = await service.getPersonalizedRecommendations(
        undefined,
        'sess-1',
      );

      expect(result.map((p) => p.id)).toEqual(['p-live']);
    });
  });

  describe('getCrossSellRecommendations', () => {
    it('should exclude zero-active parents from cached cross-sell', async () => {
      productRecommendationRepository.findCrossSell.mockResolvedValue({
        productIdsHash: 'h',
        recommendedProductIds: ['p-dead', 'p-live'],
        computedAt: new Date(),
      } as any);

      productRepository.findActiveByIds.mockResolvedValue([
        makeParent('p-dead', [
          { status: ProductStatus.INACTIVE, attributes: [] },
        ]),
        makeParent('p-live', [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ]),
      ]);

      const result = await service.getCrossSellRecommendations(['input-1']);

      expect(result.map((p) => p.id)).toEqual(['p-live']);
    });
  });
});
