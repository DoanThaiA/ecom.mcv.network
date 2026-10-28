import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShopTopicService } from '../../../src/shop/topic/shop-topic.service';
import { TopicRepository } from '../../../src/topics/domain/topic.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ProductCategoryRepository } from '../../../src/product-categories/domain/product-category.repository';
import { NhanhAuthService } from '../../../src/nhanh/services/nhanh-auth.service';
import { Topic } from '../../../src/topics/domain/topic';
import { Product } from '../../../src/products/domain/product';
import { TopicStatus } from '../../../src/topics/domain/topic-status.enum';
import { TopicType } from '../../../src/topics/domain/topic-type.enum';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';

describe('ShopTopicService', () => {
  let service: ShopTopicService;
  let topicRepository: jest.Mocked<TopicRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Product;

  const mockTopic: Topic = {
    id: 'topic-123',
    businessId: '110668',
    name: 'Test Topic',
    slug: 'test-topic',
    description: 'Test topic description',
    image: 'http://example.com/topic.jpg',
    order: 0,
    type: TopicType.PRODUCT,
    status: TopicStatus.ACTIVE,
    products: [
      { productId: 'product-123', order: 1 },
      { productId: 'product-456', order: 2 },
      { productId: 'product-789', order: 3 },
    ],
    categories: [],
    banners: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockTopicRepository = {
      findActiveByBusinessId: jest.fn(),
      findBySlug: jest.fn(),
    };

    const mockProductRepository = {
      findByIds: jest.fn(),
    };

    const mockProductCategoryRepository = {
      findByIds: jest.fn().mockResolvedValue([]),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopTopicService,
        { provide: TopicRepository, useValue: mockTopicRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: ProductCategoryRepository,
          useValue: mockProductCategoryRepository,
        },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ShopTopicService>(ShopTopicService);
    topicRepository = module.get(TopicRepository);
    productRepository = module.get(ProductRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);

    // Default mock for getAccessToken
    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopics', () => {
    it('should return list of active topics', async () => {
      topicRepository.findActiveByBusinessId.mockResolvedValue([mockTopic]);

      const result = await service.getTopics();

      expect(result.topics).toHaveLength(1);
      expect(result.topics[0]).toMatchObject({
        id: 'topic-123',
        name: 'Test Topic',
        slug: 'test-topic',
        image: 'http://example.com/topic.jpg',
        productCount: 3,
      });
      expect(topicRepository.findActiveByBusinessId).toHaveBeenCalledWith(
        '110668',
      );
    });

    it('should return empty list when no topics', async () => {
      topicRepository.findActiveByBusinessId.mockResolvedValue([]);

      const result = await service.getTopics();

      expect(result.topics).toHaveLength(0);
    });

    it('should throw error when business not configured', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue(null);

      await expect(service.getTopics()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should throw error when businessId is null', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue({
        businessId: null,
        accessToken: 'token',
      } as any);

      await expect(service.getTopics()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should include product count for each topic', async () => {
      const topics = [
        { ...mockTopic, products: [{ productId: 'p1', order: 1 }] },
        {
          ...mockTopic,
          id: 'topic-456',
          products: [
            { productId: 'p1', order: 1 },
            { productId: 'p2', order: 2 },
          ],
        },
      ];
      topicRepository.findActiveByBusinessId.mockResolvedValue(topics as any);

      const result = await service.getTopics();

      expect(result.topics[0].productCount).toBe(1);
      expect(result.topics[1].productCount).toBe(2);
    });
  });

  describe('getTopicBySlug', () => {
    it('should return topic with products', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const result = await service.getTopicBySlug('test-topic', {});

      expect(result).toMatchObject({
        id: 'topic-123',
        name: 'Test Topic',
        slug: 'test-topic',
        description: 'Test topic description',
        image: 'http://example.com/topic.jpg',
        totalProducts: 3,
      });
      expect(result.products).toHaveLength(1);
      expect(topicRepository.findBySlug).toHaveBeenCalledWith(
        '110668',
        'test-topic',
      );
    });

    it('should throw error when topic not found', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);

      await expect(
        service.getTopicBySlug('non-existent', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('topic.notFound');
    });

    it('should throw error when topic is not active', async () => {
      const inactiveTopic = {
        ...mockTopic,
        status: TopicStatus.INACTIVE,
      };
      topicRepository.findBySlug.mockResolvedValue(inactiveTopic);

      await expect(
        service.getTopicBySlug('test-topic', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('topic.notFound');
    });

    it('should paginate products with default page and limit', async () => {
      const topicWithManyProducts = {
        ...mockTopic,
        products: Array.from({ length: 30 }, (_, i) => ({
          productId: `product-${i}`,
          order: i + 1,
        })),
      };
      topicRepository.findBySlug.mockResolvedValue(
        topicWithManyProducts as any,
      );
      productRepository.findByIds.mockResolvedValue([]);

      const result = await service.getTopicBySlug('test-topic', {});

      // Default limit is 20, so should request first 20 products
      expect(productRepository.findByIds).toHaveBeenCalledWith(
        Array.from({ length: 20 }, (_, i) => `product-${i}`),
      );
      expect(result.totalProducts).toBe(30);
    });

    it('should paginate products with custom page and limit', async () => {
      const topicWithManyProducts = {
        ...mockTopic,
        products: Array.from({ length: 30 }, (_, i) => ({
          productId: `product-${i}`,
          order: i + 1,
        })),
      };
      topicRepository.findBySlug.mockResolvedValue(
        topicWithManyProducts as any,
      );
      productRepository.findByIds.mockResolvedValue([]);

      await service.getTopicBySlug('test-topic', { page: 2, limit: 10 });

      // Page 2 with limit 10 should request products 10-19
      expect(productRepository.findByIds).toHaveBeenCalledWith(
        Array.from({ length: 10 }, (_, i) => `product-${i + 10}`),
      );
    });

    it('should sort products by order', async () => {
      const unorderedTopic = {
        ...mockTopic,
        products: [
          { productId: 'product-c', order: 3 },
          { productId: 'product-a', order: 1 },
          { productId: 'product-b', order: 2 },
        ],
      };
      topicRepository.findBySlug.mockResolvedValue(unorderedTopic as any);
      productRepository.findByIds.mockResolvedValue([]);

      await service.getTopicBySlug('test-topic', {});

      expect(productRepository.findByIds).toHaveBeenCalledWith([
        'product-a',
        'product-b',
        'product-c',
      ]);
    });

    it('should handle products with null images', async () => {
      const productNoImage = { ...mockProduct, images: null };
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      productRepository.findByIds.mockResolvedValue([productNoImage as any]);

      const result = await service.getTopicBySlug('test-topic', {});

      expect(result.products[0].image).toBeNull();
    });
  });

  describe('getTopicProducts', () => {
    it('should return paginated products', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const result = await service.getTopicProducts('test-topic', {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should throw error when topic not found', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);

      await expect(
        service.getTopicProducts('non-existent', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when topic is inactive', async () => {
      const inactiveTopic = {
        ...mockTopic,
        status: TopicStatus.INACTIVE,
      };
      topicRepository.findBySlug.mockResolvedValue(inactiveTopic);

      await expect(
        service.getTopicProducts('test-topic', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should calculate hasNextPage correctly', async () => {
      const topicWithManyProducts = {
        ...mockTopic,
        products: Array.from({ length: 50 }, (_, i) => ({
          productId: `product-${i}`,
          order: i + 1,
        })),
      };
      topicRepository.findBySlug.mockResolvedValue(
        topicWithManyProducts as any,
      );
      productRepository.findByIds.mockResolvedValue([]);

      // Page 1 of 3 (50 products, 20 per page)
      const result1 = await service.getTopicProducts('test-topic', {
        page: 1,
        limit: 20,
      });
      expect(result1.hasNextPage).toBe(true);
      expect(result1.totalPages).toBe(3);

      // Page 2 of 3
      const result2 = await service.getTopicProducts('test-topic', {
        page: 2,
        limit: 20,
      });
      expect(result2.hasNextPage).toBe(true);

      // Page 3 of 3 (last page)
      const result3 = await service.getTopicProducts('test-topic', {
        page: 3,
        limit: 20,
      });
      expect(result3.hasNextPage).toBe(false);
    });

    it('should maintain product order from topic', async () => {
      const unorderedTopic = {
        ...mockTopic,
        products: [
          { productId: 'product-c', order: 3 },
          { productId: 'product-a', order: 1 },
          { productId: 'product-b', order: 2 },
        ],
      };
      const products = [
        { ...mockProduct, id: 'product-c' },
        { ...mockProduct, id: 'product-a' },
        { ...mockProduct, id: 'product-b' },
      ];
      topicRepository.findBySlug.mockResolvedValue(unorderedTopic as any);
      productRepository.findByIds.mockResolvedValue(products as any);

      const result = await service.getTopicProducts('test-topic', {});

      // Should be sorted by order (a, b, c)
      expect(result.data[0].id).toBe('product-a');
      expect(result.data[1].id).toBe('product-b');
      expect(result.data[2].id).toBe('product-c');
    });

    it('should filter out undefined products', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      // Only return 2 out of 3 products
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-123' },
        { ...mockProduct, id: 'product-456' },
      ] as any);

      const result = await service.getTopicProducts('test-topic', {});

      expect(result.data).toHaveLength(2);
    });

    it('should use custom page and limit', async () => {
      const topicWithManyProducts = {
        ...mockTopic,
        products: Array.from({ length: 100 }, (_, i) => ({
          productId: `product-${i}`,
          order: i + 1,
        })),
      };
      topicRepository.findBySlug.mockResolvedValue(
        topicWithManyProducts as any,
      );
      productRepository.findByIds.mockResolvedValue([]);

      await service.getTopicProducts('test-topic', { page: 3, limit: 15 });

      // Page 3 with limit 15: skip 30, take 15 (products 30-44)
      expect(productRepository.findByIds).toHaveBeenCalledWith(
        Array.from({ length: 15 }, (_, i) => `product-${i + 30}`),
      );
    });

    it('should handle empty topic products', async () => {
      const emptyTopic = {
        ...mockTopic,
        products: [],
      };
      topicRepository.findBySlug.mockResolvedValue(emptyTopic as any);
      productRepository.findByIds.mockResolvedValue([]);

      const result = await service.getTopicProducts('test-topic', {});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });

    it('should exclude parent products with zero ACTIVE variants', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      const parentWithNoActive = {
        ...mockProduct,
        id: 'product-123',
        snapshot: { parentId: -2 },
        variants: [
          { status: ProductStatus.INACTIVE, attributes: [] },
          { status: ProductStatus.DISCONTINUED, attributes: [] },
        ],
      };
      const parentWithActive = {
        ...mockProduct,
        id: 'product-456',
        snapshot: { parentId: -2 },
        variants: [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ],
      };
      productRepository.findByIds.mockResolvedValue([
        parentWithNoActive,
        parentWithActive,
      ] as any);

      const result = await service.getTopicProducts('test-topic', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('product-456');
    });

    it('should strip non-ACTIVE variants from returned products', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      const parent = {
        ...mockProduct,
        id: 'product-123',
        snapshot: { parentId: -2 },
        variants: [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
          {
            status: ProductStatus.INACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Xám' }],
          },
        ],
        variantOptions: [{ id: '1', name: 'Màu', values: ['Đỏ', 'Xám'] }],
      };
      productRepository.findByIds.mockResolvedValue([parent] as any);

      const result = await service.getTopicProducts('test-topic', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].variants).toHaveLength(1);
      expect(result.data[0].variantOptions).toEqual([
        { id: '1', name: 'Màu', values: ['Đỏ'] },
      ]);
    });
  });
});
