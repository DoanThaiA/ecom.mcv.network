import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShopFlashSaleService } from '../../../src/shop/flash-sale/shop-flash-sale.service';
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { TopicRepository } from '../../../src/topics/domain/topic.repository';
import { FlashSale } from '../../../src/flash-sales/domain/flash-sale';
import { FlashSaleProduct } from '../../../src/flash-sale-products/domain/flash-sale-product';
import { Product } from '../../../src/products/domain/product';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

describe('ShopFlashSaleService', () => {
  let service: ShopFlashSaleService;
  let flashSaleRepository: jest.Mocked<FlashSaleRepository>;
  let flashSaleProductRepository: jest.Mocked<FlashSaleProductRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let topicRepository: jest.Mocked<TopicRepository>;
  let i18n: jest.Mocked<I18nService>;

  // Use dates relative to actual current time
  const yesterday = new Date(Date.now() - 86400000);
  const tomorrow = new Date(Date.now() + 86400000);
  const farFuture = new Date(Date.now() + 5 * 86400000);

  const mockFlashSaleProduct: FlashSaleProduct = {
    id: 'fsp-1',
    flashSaleId: 'flash-sale-123',
    flashSaleName: 'Test Flash Sale',
    productId: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    images: { avatar: 'http://example.com/image.jpg' },
    category: { id: 'cat-1', name: 'Category 1' },
    status: ProductStatus.ACTIVE,
    stock: 50,
    hide: false,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20,
    originalPrice: 100000,
    flashSalePrice: 80000,
    discountAmount: 20000,
    discountPercent: 20,
    promotionalQuantity: 100,
    soldCount: 10,
    remainingStock: 90,
    effectivePrice: 80000,
    endTime: tomorrow,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as FlashSaleProduct;

  const mockProduct: Product = {
    id: 'product-123',
    businessId: '110668',
    source: 'nhanh',
    code: 'PROD-001',
    name: 'Test Product',
    hide: false,
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: ProductStatus.ACTIVE,
    type: ProductType.REGULAR,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Product;

  const mockPaginateResult = {
    docs: [mockFlashSaleProduct],
    totalDocs: 1,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    pagingCounter: 1,
    offset: 0,
  };

  const mockEmptyPaginateResult = {
    docs: [],
    totalDocs: 0,
    limit: 20,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    pagingCounter: 1,
    offset: 0,
  };

  const mockFlashSale: FlashSale = {
    id: 'flash-sale-123',
    name: 'Test Flash Sale',
    startTime: yesterday,
    endTime: tomorrow,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as FlashSale;

  beforeEach(async () => {
    const mockFlashSaleRepository = {
      findCurrentlyActive: jest.fn(),
      findById: jest.fn(),
    };

    const mockFlashSaleProductRepository = {
      findManyWithPagination: jest.fn(),
      countByFlashSaleId: jest.fn(),
    };

    const mockProductRepository = {
      findByIds: jest.fn(),
    };

    const mockTopicRepository = {
      findById: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopFlashSaleService,
        { provide: FlashSaleRepository, useValue: mockFlashSaleRepository },
        {
          provide: FlashSaleProductRepository,
          useValue: mockFlashSaleProductRepository,
        },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: TopicRepository, useValue: mockTopicRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ShopFlashSaleService>(ShopFlashSaleService);
    flashSaleRepository = module.get(FlashSaleRepository);
    flashSaleProductRepository = module.get(FlashSaleProductRepository);
    productRepository = module.get(ProductRepository);
    topicRepository = module.get(TopicRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveFlashSale', () => {
    it('should return active flash sale with paginated products', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const result = await service.getActiveFlashSale();

      expect(result).toBeDefined();
      expect(result?.id).toBe('flash-sale-123');
      expect(result?.name).toBe('Test Flash Sale');
      expect(result?.data).toHaveLength(1);
      expect(result?.data[0].flashSale?.flashSaleId).toBe('flash-sale-123');
      expect(result?.total).toBe(1);
      expect(result?.page).toBe(1);
      expect(result?.limit).toBe(50);
      expect(result?.hasNextPage).toBe(false);
      expect(flashSaleRepository.findCurrentlyActive).toHaveBeenCalled();
      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith({
        flashSaleId: 'flash-sale-123',
        paginationOptions: { page: 1, limit: 50 },
      });
      expect(productRepository.findByIds).toHaveBeenCalledWith(['product-123']);
    });

    it('should return null when no active flash sale', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);

      const result = await service.getActiveFlashSale();

      expect(result).toBeNull();
      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getFlashSaleProducts', () => {
    it('should return paginated products from active flash sale', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const result = await service.getFlashSaleProducts({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should return empty when no active flash sale', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);

      const result = await service.getFlashSaleProducts({});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass pagination params to repository', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleProducts({ page: 2, limit: 15 });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          paginationOptions: { page: 2, limit: 15 },
        }),
      );
    });

    it('should cap limit at 50', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleProducts({ limit: 100 });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          paginationOptions: { page: 1, limit: 50 },
        }),
      );
    });

    it('should resolve topicId and pass topicProductIds to repository', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const mockTopic = {
        id: 'topic-1',
        products: [{ productId: 'product-123' }, { productId: 'product-789' }],
      };
      topicRepository.findById.mockResolvedValue(mockTopic as any);

      await service.getFlashSaleProducts({
        filters: { topicId: 'topic-1' },
      });

      expect(topicRepository.findById).toHaveBeenCalledWith('topic-1');
      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            topicProductIds: ['product-123', 'product-789'],
          }),
        }),
      );
    });

    it('should return empty when topic not found', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      topicRepository.findById.mockResolvedValue(null);

      const result = await service.getFlashSaleProducts({
        filters: { topicId: 'non-existent' },
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).not.toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleProducts({
        filters: {
          search: 'test',
          categoryIds: ['cat-1'],
          minPrice: 50000,
          maxPrice: 150000,
        },
      });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: {
            search: 'test',
            categoryIds: ['cat-1'],
            topicProductIds: undefined,
            minPrice: 50000,
            maxPrice: 150000,
          },
        }),
      );
    });

    it('should pass sort options to repository', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleProducts({
        sort: { orderBy: 'price', order: 'asc' },
      });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sortOptions: [{ orderBy: 'effectivePrice', order: 'asc' }],
        }),
      );
    });

    it('should default discount sort to descending', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleProducts({
        sort: { orderBy: 'discountPercent' },
      });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sortOptions: [{ orderBy: 'discountPercent', order: 'desc' }],
        }),
      );
    });
  });

  describe('getFlashSaleById', () => {
    it('should return active flash sale by ID with paginated products', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      const result = await service.getFlashSaleById('flash-sale-123');

      expect(result.id).toBe('flash-sale-123');
      expect(result.status).toBe('active');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith({
        flashSaleId: 'flash-sale-123',
        paginationOptions: { page: 1, limit: 20 },
      });
    });

    it('should accept pagination params', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );
      productRepository.findByIds.mockResolvedValue([mockProduct]);

      await service.getFlashSaleById('flash-sale-123', {
        page: 3,
        limit: 10,
      });

      expect(
        flashSaleProductRepository.findManyWithPagination,
      ).toHaveBeenCalledWith({
        flashSaleId: 'flash-sale-123',
        paginationOptions: { page: 3, limit: 10 },
      });
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(
        service.getFlashSaleById('non-existent'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('flash-sale.notFound');
    });

    it('should throw error when flash sale is disabled', async () => {
      const disabledFlashSale = { ...mockFlashSale, isEnabled: false };
      flashSaleRepository.findById.mockResolvedValue(disabledFlashSale);

      await expect(
        service.getFlashSaleById('flash-sale-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when flash sale has ended', async () => {
      const endedFlashSale = {
        ...mockFlashSale,
        startTime: new Date('2024-06-01T00:00:00Z'),
        endTime: new Date('2024-06-10T00:00:00Z'),
      };
      flashSaleRepository.findById.mockResolvedValue(endedFlashSale);

      await expect(
        service.getFlashSaleById('flash-sale-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('variant ACTIVE filter', () => {
    it('should exclude parent products with zero ACTIVE variants', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue({
        ...mockPaginateResult,
        docs: [
          { ...mockFlashSaleProduct, productId: 'p-dead' },
          { ...mockFlashSaleProduct, productId: 'p-live' },
        ],
        totalDocs: 2,
      } as any);

      const parentDead = {
        ...mockProduct,
        id: 'p-dead',
        variants: [{ status: ProductStatus.INACTIVE, attributes: [] }],
      } as unknown as Product;
      const parentLive = {
        ...mockProduct,
        id: 'p-live',
        variants: [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ],
      } as unknown as Product;
      productRepository.findByIds.mockResolvedValue([parentDead, parentLive]);

      const result = await service.getActiveFlashSale();

      expect(result?.data).toHaveLength(1);
      expect(result?.data[0].id).toBe('p-live');
    });

    it('should strip non-ACTIVE variants from returned products', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );

      const parent = {
        ...mockProduct,
        id: 'product-123',
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
      } as unknown as Product;
      productRepository.findByIds.mockResolvedValue([parent]);

      const result = await service.getActiveFlashSale();

      expect(result?.data).toHaveLength(1);
      expect(result?.data[0].variants).toHaveLength(1);
      expect(result?.data[0].variantOptions).toEqual([
        { id: '1', name: 'Màu', values: ['Đỏ'] },
      ]);
    });

    it('should preserve flashSale metadata after filtering', async () => {
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );

      const parent = {
        ...mockProduct,
        id: 'product-123',
        variants: [
          {
            status: ProductStatus.ACTIVE,
            attributes: [{ id: 1, name: 'Màu', value: 'Đỏ' }],
          },
        ],
      } as unknown as Product;
      productRepository.findByIds.mockResolvedValue([parent]);

      const result = await service.getActiveFlashSale();

      expect(result?.data[0].flashSale).toMatchObject({
        flashSaleId: 'flash-sale-123',
        flashSalePrice: 80000,
        effectivePrice: 80000,
      });
    });
  });
});
