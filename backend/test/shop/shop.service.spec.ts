import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShopService } from '../../src/shop/shop.service';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { ProductCategoryRepository } from '../../src/product-categories/domain/product-category.repository';
import { TopicRepository } from '../../src/topics/domain/topic.repository';
import { BannerRepository } from '../../src/banners/domain/banner.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { PopupAdsRepository } from '../../src/popup-ads/domain/popup-ads.repository';
import { ProductStatus } from '../../src/products/domain/product-status.enum';
import { TopicStatus } from '../../src/topics/domain/topic-status.enum';
import { TopicType } from '../../src/topics/domain/topic-type.enum';

describe('ShopService', () => {
  let service: ShopService;
  let productRepository: jest.Mocked<ProductRepository>;
  let productCategoryRepository: jest.Mocked<ProductCategoryRepository>;
  let topicRepository: jest.Mocked<TopicRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18nService: jest.Mocked<I18nService>;

  // Use a valid MongoDB ObjectId format (24 hex characters)
  const mockProductId = '507f1f77bcf86cd799439011';
  const mockProduct = {
    id: mockProductId,
    businessId: '110668',
    source: 'nhanh' as const,
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg', others: [] },
    status: ProductStatus.ACTIVE,
    type: 'regular',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopic = {
    id: 'topic-123',
    businessId: '110668',
    name: 'Test Topic',
    slug: 'test-topic',
    type: TopicType.PRODUCT,
    status: TopicStatus.ACTIVE,
    order: 1,
    products: [
      { productId: mockProductId, order: 1 },
      { productId: 'product-456', order: 2 },
    ],
    categories: [],
    banners: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginateResult = {
    docs: [mockProduct],
    totalDocs: 1,
    limit: 20,
    page: 1,
    totalPages: 1,
    offset: 0,
    hasNextPage: false,
    hasPrevPage: false,
    pagingCounter: 1,
    prevPage: null,
    nextPage: null,
  };

  beforeEach(async () => {
    const mockProductRepository = {
      findManyWithPagination: jest.fn().mockResolvedValue(mockPaginateResult),
      findById: jest.fn().mockResolvedValue(mockProduct),
      findBySlug: jest.fn().mockResolvedValue(null),
      findVariantsByParentSnapshotId: jest.fn().mockResolvedValue([]),
    };

    const mockProductCategoryRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const mockTopicRepository = {
      findById: jest.fn(),
      findActiveByBusinessId: jest.fn().mockResolvedValue([]),
    };

    const mockBannerRepository = {
      findActiveByBusinessId: jest.fn().mockResolvedValue([]),
      findActiveByPosition: jest.fn().mockResolvedValue([]),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn().mockResolvedValue({ businessId: '110668' }),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: ProductCategoryRepository,
          useValue: mockProductCategoryRepository,
        },
        { provide: TopicRepository, useValue: mockTopicRepository },
        { provide: BannerRepository, useValue: mockBannerRepository },
        {
          provide: PopupAdsRepository,
          useValue: {
            findActive: jest.fn().mockResolvedValue([]),
          },
        },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
    productRepository = module.get(ProductRepository);
    productCategoryRepository = module.get(ProductCategoryRepository);
    topicRepository = module.get(TopicRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18nService = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    describe('topic filtering', () => {
      it('should filter products by topicId', async () => {
        topicRepository.findById.mockResolvedValue(mockTopic);

        await service.getProducts({
          filters: { topicId: 'topic-123' },
        });

        expect(topicRepository.findById).toHaveBeenCalledWith('topic-123');
        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              productIds: [mockProductId, 'product-456'],
            }),
          }),
        );
      });

      it('should return empty result when topic not found', async () => {
        topicRepository.findById.mockResolvedValue(null);

        const result = await service.getProducts({
          filters: { topicId: 'non-existent' },
        });

        expect(result.docs).toEqual([]);
        expect(result.totalDocs).toBe(0);
        expect(productRepository.findManyWithPagination).not.toHaveBeenCalled();
      });

      it('should return empty result when topic has no products', async () => {
        topicRepository.findById.mockResolvedValue({
          ...mockTopic,
          products: [],
        });

        const result = await service.getProducts({
          filters: { topicId: 'empty-topic' },
        });

        expect(result.docs).toEqual([]);
        expect(result.totalDocs).toBe(0);
        expect(productRepository.findManyWithPagination).not.toHaveBeenCalled();
      });
    });

    describe('price filtering', () => {
      it('should pass minPrice filter to repository', async () => {
        await service.getProducts({
          filters: { minPrice: 100000 },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              minPrice: 100000,
            }),
          }),
        );
      });

      it('should pass maxPrice filter to repository', async () => {
        await service.getProducts({
          filters: { maxPrice: 500000 },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              maxPrice: 500000,
            }),
          }),
        );
      });

      it('should pass both minPrice and maxPrice filters to repository', async () => {
        await service.getProducts({
          filters: { minPrice: 100000, maxPrice: 500000 },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              minPrice: 100000,
              maxPrice: 500000,
            }),
          }),
        );
      });

      it('should handle minPrice of 0 correctly', async () => {
        await service.getProducts({
          filters: { minPrice: 0 },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              minPrice: 0,
            }),
          }),
        );
      });
    });

    describe('combined filters', () => {
      it('should combine topic and price filters', async () => {
        topicRepository.findById.mockResolvedValue(mockTopic);

        await service.getProducts({
          filters: {
            topicId: 'topic-123',
            minPrice: 50000,
            maxPrice: 200000,
          },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              productIds: [mockProductId, 'product-456'],
              minPrice: 50000,
              maxPrice: 200000,
            }),
          }),
        );
      });

      it('should combine search, category, topic, and price filters', async () => {
        topicRepository.findById.mockResolvedValue(mockTopic);

        await service.getProducts({
          filters: {
            search: 'test',
            categoryIds: ['cat-1', 'cat-2'],
            topicId: 'topic-123',
            minPrice: 100000,
            maxPrice: 500000,
          },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              search: 'test',
              categoryIds: ['cat-1', 'cat-2'],
              productIds: [mockProductId, 'product-456'],
              minPrice: 100000,
              maxPrice: 500000,
            }),
          }),
        );
      });
    });

    describe('pagination and limit', () => {
      it('should use default limit of 20', async () => {
        await service.getProducts({});

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            paginationOptions: expect.objectContaining({
              limit: 20,
            }),
          }),
        );
      });

      it('should enforce maximum limit of 50', async () => {
        await service.getProducts({ limit: 100 });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            paginationOptions: expect.objectContaining({
              limit: 50,
            }),
          }),
        );
      });

      it('should use custom limit when below 50', async () => {
        await service.getProducts({ limit: 30 });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            paginationOptions: expect.objectContaining({
              limit: 30,
            }),
          }),
        );
      });

      it('should use default page 1', async () => {
        await service.getProducts({});

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            paginationOptions: expect.objectContaining({
              page: 1,
            }),
          }),
        );
      });

      it('should use custom page', async () => {
        await service.getProducts({ page: 3 });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            paginationOptions: expect.objectContaining({
              page: 3,
            }),
          }),
        );
      });
    });

    describe('sorting', () => {
      it('should sort by stock desc by default', async () => {
        await service.getProducts({});

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [{ orderBy: 'stock', order: 'desc' }],
          }),
        );
      });

      it('should sort by price (flashSale.effectivePrice)', async () => {
        await service.getProducts({
          sort: { orderBy: 'price', order: 'asc' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [
              { orderBy: 'flashSale.effectivePrice', order: 'asc' },
            ],
          }),
        );
      });

      it('should sort by discount with default desc order', async () => {
        await service.getProducts({
          sort: { orderBy: 'discount' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [
              { orderBy: 'flashSale.discountAmount', order: 'desc' },
            ],
          }),
        );
      });

      it('should sort by discountPercent with default desc order', async () => {
        await service.getProducts({
          sort: { orderBy: 'discountPercent' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [
              { orderBy: 'flashSale.discountPercent', order: 'desc' },
            ],
          }),
        );
      });

      it('should sort by name', async () => {
        await service.getProducts({
          sort: { orderBy: 'name', order: 'asc' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [{ orderBy: 'name', order: 'asc' }],
          }),
        );
      });

      it('should use default createdAt for invalid sort field', async () => {
        await service.getProducts({
          sort: { orderBy: 'invalid' as any, order: 'asc' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOptions: [{ orderBy: 'createdAt', order: 'asc' }],
          }),
        );
      });
    });

    describe('search and category filters', () => {
      it('should pass search filter', async () => {
        await service.getProducts({
          filters: { search: 'test product' },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              search: 'test product',
            }),
          }),
        );
      });

      it('should pass categoryIds filter', async () => {
        await service.getProducts({
          filters: { categoryIds: ['cat-1', 'cat-2'] },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              categoryIds: ['cat-1', 'cat-2'],
            }),
          }),
        );
      });

      it('should not pass empty categoryIds array', async () => {
        await service.getProducts({
          filters: { categoryIds: [] },
        });

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.not.objectContaining({
              categoryIds: expect.anything(),
            }),
          }),
        );
      });
    });

    describe('businessId filter', () => {
      it('should include businessId from auth token', async () => {
        await service.getProducts({});

        expect(nhanhAuthService.getAccessToken).toHaveBeenCalled();
        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              businessId: '110668',
            }),
          }),
        );
      });

      it('should handle missing businessId from auth token', async () => {
        nhanhAuthService.getAccessToken.mockResolvedValueOnce(null as any);

        await service.getProducts({});

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.not.objectContaining({
              businessId: expect.anything(),
            }),
          }),
        );
      });
    });

    describe('saleable products filter', () => {
      it('should always filter by active status', async () => {
        await service.getProducts({});

        expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
          expect.objectContaining({
            filterOptions: expect.objectContaining({
              status: ProductStatus.ACTIVE,
            }),
          }),
        );
      });
    });
  });

  describe('getLanding', () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Category 1',
        parentId: null,
      },
      {
        id: 'cat-2',
        name: 'Category 2',
        parentId: 'cat-1',
      },
    ];

    const mockTopics = [
      {
        id: 'topic-1',
        name: 'Topic 1',
        slug: 'topic-1',
        image: 'http://example.com/topic1.jpg',
        products: [{ productId: 'p1' }, { productId: 'p2' }],
        categories: [],
        banners: [],
      },
      {
        id: 'topic-2',
        name: 'Topic 2',
        slug: 'topic-2',
        image: 'http://example.com/topic2.jpg',
        products: [{ productId: 'p3' }],
        categories: [],
        banners: [],
      },
    ];

    it('should return landing page data with categories and topics', async () => {
      productCategoryRepository.findAll.mockResolvedValue(
        mockCategories as any,
      );
      topicRepository.findActiveByBusinessId.mockResolvedValue(
        mockTopics as any,
      );

      const result = await service.getLanding();

      expect(nhanhAuthService.getAccessToken).toHaveBeenCalled();
      expect(productCategoryRepository.findAll).toHaveBeenCalled();
      expect(topicRepository.findActiveByBusinessId).toHaveBeenCalledWith(
        '110668',
      );
      expect(result.categories).toEqual(mockCategories);
      expect(result.topics).toHaveLength(2);
      expect(result.topics[0]).toEqual({
        id: 'topic-1',
        name: 'Topic 1',
        slug: 'topic-1',
        image: 'http://example.com/topic1.jpg',
        productCount: 2,
        categoryCount: 0,
        bannerCount: 0,
        localization: null,
        type: undefined,
      });
    });

    it('should return empty topics when no businessId', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValueOnce(null as any);
      productCategoryRepository.findAll.mockResolvedValue(
        mockCategories as any,
      );

      const result = await service.getLanding();

      expect(topicRepository.findActiveByBusinessId).not.toHaveBeenCalled();
      expect(result.topics).toEqual([]);
    });

    it('should map topic product count correctly', async () => {
      productCategoryRepository.findAll.mockResolvedValue([]);
      topicRepository.findActiveByBusinessId.mockResolvedValue([
        {
          id: 'topic-1',
          name: 'Topic 1',
          slug: 'topic-1',
          products: [
            { productId: 'p1' },
            { productId: 'p2' },
            { productId: 'p3' },
          ],
          categories: [],
          banners: [],
        },
      ] as any);

      const result = await service.getLanding();

      expect(result.topics[0]!.productCount).toBe(3);
    });
  });

  describe('getProduct', () => {
    it('should return product by id', async () => {
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.getProduct(mockProductId);

      expect(productRepository.findById).toHaveBeenCalledWith(mockProductId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.getProduct('nonexistent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18nService.t).toHaveBeenCalledWith('product.notFound');
    });

    it('should throw error when product is DISCONTINUED', async () => {
      const discontinuedProduct = {
        ...mockProduct,
        status: ProductStatus.DISCONTINUED,
      };
      productRepository.findById.mockResolvedValue(discontinuedProduct as any);

      await expect(service.getProduct(mockProductId)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18nService.t).toHaveBeenCalledWith('product.notFound');
    });

    it('should throw error when product is INACTIVE', async () => {
      const inactiveProduct = {
        ...mockProduct,
        status: ProductStatus.INACTIVE,
      };
      productRepository.findById.mockResolvedValue(inactiveProduct as any);

      await expect(service.getProduct(mockProductId)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when product is OUT_OF_STOCK', async () => {
      const outOfStockProduct = {
        ...mockProduct,
        status: ProductStatus.OUT_OF_STOCK,
      };
      productRepository.findById.mockResolvedValue(outOfStockProduct as any);

      await expect(service.getProduct(mockProductId)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should allow ACTIVE products', async () => {
      const activeProduct = {
        ...mockProduct,
        status: ProductStatus.ACTIVE,
      };
      productRepository.findById.mockResolvedValue(activeProduct as any);

      const result = await service.getProduct(mockProductId);

      expect(result.status).toBe(ProductStatus.ACTIVE);
    });

    it('should allow NEW products', async () => {
      const newProduct = {
        ...mockProduct,
        status: ProductStatus.NEW,
      };
      productRepository.findById.mockResolvedValue(newProduct as any);

      const result = await service.getProduct(mockProductId);

      expect(result.status).toBe(ProductStatus.NEW);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', parentId: null },
        { id: 'cat-2', name: 'Category 2', parentId: 'cat-1' },
        { id: 'cat-3', name: 'Category 3', parentId: 'cat-1' },
      ];
      productCategoryRepository.findAll.mockResolvedValue(
        mockCategories as any,
      );

      const result = await service.getCategories();

      expect(productCategoryRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no categories', async () => {
      productCategoryRepository.findAll.mockResolvedValue([]);

      const result = await service.getCategories();

      expect(result).toEqual([]);
    });
  });
});
