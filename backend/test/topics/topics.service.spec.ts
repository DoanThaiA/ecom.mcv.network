import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TopicsService } from '../../src/topics/topics.service';
import { TopicRepository } from '../../src/topics/domain/topic.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { ProductCategoryRepository } from '../../src/product-categories/domain/product-category.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { Topic } from '../../src/topics/domain/topic';
import { TopicStatus } from '../../src/topics/domain/topic-status.enum';
import { TopicType } from '../../src/topics/domain/topic-type.enum';
import { CreateTopicDto } from '../../src/topics/dto/create-topic.dto';
import { UpdateTopicDto } from '../../src/topics/dto/update-topic.dto';

describe('TopicsService', () => {
  let service: TopicsService;
  let topicRepository: jest.Mocked<TopicRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: 'active',
  };

  const mockTopic: Topic = {
    id: 'topic-123',
    businessId: '110668',
    name: 'Featured Products',
    slug: 'featured-products',
    description: 'Our best products',
    image: 'http://example.com/topic.jpg',
    order: 0,
    type: TopicType.PRODUCT,
    status: TopicStatus.ACTIVE,
    products: [
      { productId: 'product-123', order: 0 },
      { productId: 'product-456', order: 1 },
    ],
    categories: [],
    banners: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    const mockTopicRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findManyWithPagination: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addProducts: jest.fn(),
      removeProducts: jest.fn(),
      reorderProducts: jest.fn(),
      bulkUpdateOrder: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
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
        TopicsService,
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

    service = module.get<TopicsService>(TopicsService);
    topicRepository = module.get(TopicRepository);
    productRepository = module.get(ProductRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);

    // Default mock for auth service
    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateTopicDto = {
      name: 'New Topic',
      description: 'New topic description',
    };

    it('should create topic successfully', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', mockTopic.id);
      expect(result).toHaveProperty('name', mockTopic.name);
      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          businessId: '110668',
        }),
      );
    });

    it('should generate slug from name if not provided', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);

      await service.create({ name: 'Test Topic Name' });

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-topic-name',
        }),
      );
    });

    it('should use provided slug', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);

      await service.create({ name: 'Test Topic', slug: 'custom-slug' });

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'custom-slug',
        }),
      );
    });

    it('should throw error when slug already exists', async () => {
      topicRepository.findBySlug.mockResolvedValue(mockTopic);

      await expect(
        service.create({ name: 'New Topic', slug: 'featured-products' }),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('should throw error when businessId not available', async () => {
      nhanhAuthService.getAccessToken.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('should validate products exist when provided', async () => {
      const createWithProducts: CreateTopicDto = {
        name: 'Topic with products',
        products: [
          { productId: 'product-123', order: 0 },
          { productId: 'product-456', order: 1 },
        ],
      };

      topicRepository.findBySlug.mockResolvedValue(null);
      productRepository.findByIds.mockResolvedValue([mockProduct] as any); // Only one found

      await expect(service.create(createWithProducts)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should assign order values to products if not provided', async () => {
      const createWithProducts: CreateTopicDto = {
        name: 'Topic with products',
        products: [{ productId: 'product-123' }, { productId: 'product-456' }],
      };

      topicRepository.findBySlug.mockResolvedValue(null);
      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        { ...mockProduct, id: 'product-456' },
      ] as any);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.create(createWithProducts);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          products: [
            { productId: 'product-123', order: 0 },
            { productId: 'product-456', order: 1 },
          ],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return topic when found', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findOne('topic-123');

      expect(result).toHaveProperty('id', mockTopic.id);
      expect(topicRepository.findById).toHaveBeenCalledWith('topic-123');
    });

    it('should throw error when topic not found', async () => {
      topicRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should enrich products with details', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findOne('topic-123');

      expect(result.products[0]).toHaveProperty('productName');
      expect(result.products[0]).toHaveProperty('productPrice');
    });
  });

  describe('findAll', () => {
    it('should return paginated topics', async () => {
      const paginatedResult = {
        docs: [mockTopic],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      topicRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(topicRepository.findManyWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            businessId: '110668',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateTopicDto = {
      name: 'Updated Topic',
      description: 'Updated description',
    };

    it('should update topic successfully', async () => {
      const updatedTopic = { ...mockTopic, ...updateDto };
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.update.mockResolvedValue(updatedTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.update('topic-123', updateDto);

      expect(result).toHaveProperty('name', 'Updated Topic');
      expect(topicRepository.update).toHaveBeenCalled();
    });

    it('should throw error when topic not found', async () => {
      topicRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should validate slug uniqueness when changing slug', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.findBySlug.mockResolvedValue({
        ...mockTopic,
        id: 'other-topic',
      });

      await expect(
        service.update('topic-123', { slug: 'existing-slug' }),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('should allow keeping same slug', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.findBySlug.mockResolvedValue(mockTopic);
      topicRepository.update.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.update('topic-123', {
        slug: 'featured-products',
      });

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove topic successfully', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.remove.mockResolvedValue(undefined);

      await service.remove('topic-123');

      expect(topicRepository.remove).toHaveBeenCalledWith('topic-123');
    });

    it('should throw error when topic not found', async () => {
      topicRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('addProducts', () => {
    it('should add products to topic successfully', async () => {
      topicRepository.findById.mockResolvedValue({
        ...mockTopic,
        products: [],
      });
      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        { ...mockProduct, id: 'product-456' },
      ] as any);
      topicRepository.addProducts.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.addProducts('topic-123', {
        products: [{ productId: 'product-123' }, { productId: 'product-456' }],
      });

      expect(topicRepository.addProducts).toHaveBeenCalled();
    });

    it('should throw error for duplicate products', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      productRepository.findByIds.mockResolvedValue([mockProduct] as any);

      await expect(
        service.addProducts('topic-123', {
          products: [{ productId: 'product-123' }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should assign order based on existing products', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-789' },
      ] as any);
      topicRepository.addProducts.mockResolvedValue({
        ...mockTopic,
        products: [
          ...mockTopic.products,
          { productId: 'product-789', order: 2 },
        ],
      });
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.addProducts('topic-123', {
        products: [{ productId: 'product-789' }],
      });

      expect(topicRepository.addProducts).toHaveBeenCalledWith(
        'topic-123',
        expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-789',
            order: 2, // Max existing order is 1, so new is 2
          }),
        ]),
      );
    });
  });

  describe('removeProducts', () => {
    it('should remove products from topic successfully', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.removeProducts.mockResolvedValue({
        ...mockTopic,
        products: [mockTopic.products[1]],
      });
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.removeProducts('topic-123', {
        productIds: ['product-123'],
      });

      expect(topicRepository.removeProducts).toHaveBeenCalledWith('topic-123', [
        'product-123',
      ]);
    });

    it('should throw error when product not in topic', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);

      await expect(
        service.removeProducts('topic-123', {
          productIds: ['product-999'],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('reorderProducts', () => {
    it('should reorder products successfully', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.reorderProducts.mockResolvedValue({
        ...mockTopic,
        products: [
          { productId: 'product-456', order: 0 },
          { productId: 'product-123', order: 1 },
        ],
      });
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.reorderProducts('topic-123', {
        products: [
          { productId: 'product-456', order: 0 },
          { productId: 'product-123', order: 1 },
        ],
      });

      expect(topicRepository.reorderProducts).toHaveBeenCalled();
    });

    it('should throw error for products not in topic', async () => {
      topicRepository.findById.mockResolvedValue(mockTopic);

      await expect(
        service.reorderProducts('topic-123', {
          products: [{ productId: 'product-999', order: 0 }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('reorderTopics', () => {
    it('should reorder topics successfully', async () => {
      topicRepository.bulkUpdateOrder.mockResolvedValue(undefined);

      await service.reorderTopics({
        topics: [
          { id: 'topic-456', order: 0 },
          { id: 'topic-123', order: 1 },
        ],
      });

      expect(topicRepository.bulkUpdateOrder).toHaveBeenCalledWith([
        { id: 'topic-456', order: 0 },
        { id: 'topic-123', order: 1 },
      ]);
    });
  });

  describe('slug generation', () => {
    it('should generate slug from Vietnamese text', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);

      await service.create({ name: 'Sản phẩm nổi bật' });

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'san-pham-noi-bat',
        }),
      );
    });

    it('should handle special characters in name', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);

      await service.create({ name: 'Test & Special!@#$% Characters' });

      // slugify converts & to 'and' and handles $, % differently
      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-and-specialdollarpercent-characters',
        }),
      );
    });

    it('should handle multiple spaces and hyphens', async () => {
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);

      await service.create({ name: 'Test   Multiple   Spaces' });

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-multiple-spaces',
        }),
      );
    });
  });

  describe('localization', () => {
    it('should create topic with Vietnamese and English names', async () => {
      const createDto: CreateTopicDto = {
        name: 'Featured Products',
        localization: {
          vi: 'Sản phẩm nổi bật',
          en: 'Featured Products',
        },
      };
      const topicWithLocalization = {
        ...mockTopic,
        localization: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
      };
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(topicWithLocalization);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.create(createDto);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
        }),
      );
      expect(result.localization).toEqual({
        vi: 'Sản phẩm nổi bật',
        en: 'Featured Products',
      });
    });

    it('should create topic with only Vietnamese localization', async () => {
      const createDto: CreateTopicDto = {
        name: 'Default Name',
        localization: {
          vi: 'Chủ đề tiếng Việt',
        },
      };
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.create(createDto);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: 'Chủ đề tiếng Việt', en: undefined },
        }),
      );
    });

    it('should create topic with only English localization', async () => {
      const createDto: CreateTopicDto = {
        name: 'Default Name',
        localization: {
          en: 'English Topic',
        },
      };
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.create(createDto);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: undefined, en: 'English Topic' },
        }),
      );
    });

    it('should create topic without localization when not provided', async () => {
      const createDto: CreateTopicDto = {
        name: 'Simple Topic',
      };
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.create(createDto);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: null,
        }),
      );
    });

    it('should include localization in response DTO', async () => {
      const topicWithLocalization = {
        ...mockTopic,
        localization: { vi: 'Chủ đề', en: 'Topic' },
      };
      topicRepository.findById.mockResolvedValue(topicWithLocalization);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findOne('topic-123');

      expect(result).toHaveProperty('localization');
      expect(result.localization).toEqual({ vi: 'Chủ đề', en: 'Topic' });
    });

    it('should update topic with new localization', async () => {
      const updateDto: UpdateTopicDto = {
        localization: {
          vi: 'Tên mới',
          en: 'New Name',
        },
      };
      const updatedTopic = {
        ...mockTopic,
        localization: { vi: 'Tên mới', en: 'New Name' },
      };
      topicRepository.findById.mockResolvedValue(mockTopic);
      topicRepository.update.mockResolvedValue(updatedTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.update('topic-123', updateDto);

      expect(result.localization).toEqual({ vi: 'Tên mới', en: 'New Name' });
    });

    it('should handle localization fallback correctly', async () => {
      // Test that when localization is provided but empty, it creates with undefined values
      const createDto: CreateTopicDto = {
        name: 'Test Topic',
        localization: {},
      };
      topicRepository.findBySlug.mockResolvedValue(null);
      topicRepository.create.mockResolvedValue(mockTopic);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await service.create(createDto);

      expect(topicRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: undefined, en: undefined },
        }),
      );
    });
  });
});
