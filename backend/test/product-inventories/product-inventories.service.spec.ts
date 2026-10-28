import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ProductInventoriesService } from '../../src/product-inventories/product-inventories.service';
import { ProductInventoryRepository } from '../../src/product-inventories/domain/product-inventory.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { ProductInventory } from '../../src/product-inventories/domain/product-inventory';

describe('ProductInventoriesService', () => {
  let service: ProductInventoriesService;
  let productInventoryRepository: jest.Mocked<ProductInventoryRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockInventory: ProductInventory = {
    id: 'inventory-123',
    businessId: '110668',
    productId: 'product-123',
    source: 'nhanh',
    totalRemain: 100,
    totalAvailable: 80,
    depots: [
      {
        depotId: 'depot-1',
        remain: 100,
        available: 80,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    const mockProductInventoryRepository = {
      findById: jest.fn(),
      findByProductId: jest.fn(),
      findManyWithPagination: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductInventoriesService,
        {
          provide: ProductInventoryRepository,
          useValue: mockProductInventoryRepository,
        },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ProductInventoriesService>(ProductInventoriesService);
    productInventoryRepository = module.get(ProductInventoryRepository);
    productRepository = module.get(ProductRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);

    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated inventory records', async () => {
      const paginatedResult = {
        docs: [mockInventory],
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
      productInventoryRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(
        productInventoryRepository.findManyWithPagination,
      ).toHaveBeenCalledWith({
        filterOptions: expect.objectContaining({
          businessId: '110668',
        }),
        sortOptions: undefined,
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should apply provided filters', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      productInventoryRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findAll({
        filters: { productId: 'product-123' },
      });

      expect(
        productInventoryRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            productId: 'product-123',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return inventory when found', async () => {
      productInventoryRepository.findById.mockResolvedValue(mockInventory);

      const result = await service.findOne('inventory-123');

      expect(result).toEqual(mockInventory);
      expect(productInventoryRepository.findById).toHaveBeenCalledWith(
        'inventory-123',
      );
    });

    it('should throw error when inventory not found', async () => {
      productInventoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should attach variant inventories for products with variants', async () => {
      const mockProductWithVariants = {
        id: 'product-123',
        name: 'Parent Product',
        variants: [
          {
            id: 'variant-1',
            name: 'Variant 1',
            barcode: undefined,
            images: { avatar: undefined, others: [] },
          },
          {
            id: 'variant-2',
            name: 'Variant 2',
            barcode: undefined,
            images: { avatar: undefined, others: [] },
          },
        ],
      };

      const mockVariantInventory1 = {
        id: 'inv-variant-1',
        productId: 'variant-1',
        available: 10,
        totalQuantity: 15,
      };

      const mockVariantInventory2 = {
        id: 'inv-variant-2',
        productId: 'variant-2',
        available: 5,
        totalQuantity: 10,
      };

      // Expected enriched variant inventories
      const expectedVariantInventory1 = {
        ...mockVariantInventory1,
        productName: 'Variant 1',
        barcode: undefined,
        image: { avatar: undefined, others: [] },
      };

      const expectedVariantInventory2 = {
        ...mockVariantInventory2,
        productName: 'Variant 2',
        barcode: undefined,
        image: { avatar: undefined, others: [] },
      };

      productInventoryRepository.findById.mockResolvedValue(mockInventory);
      productRepository.findById.mockResolvedValue(
        mockProductWithVariants as any,
      );
      (productInventoryRepository as any).findByProductIds = jest
        .fn()
        .mockResolvedValue([mockVariantInventory1, mockVariantInventory2]);

      const result = await service.findOne('inventory-123');

      expect(productRepository.findById).toHaveBeenCalledWith('product-123');
      expect(
        (productInventoryRepository as any).findByProductIds,
      ).toHaveBeenCalledWith(['variant-1', 'variant-2']);
      expect(result).toEqual({
        ...mockInventory,
        variantInventories: [
          expectedVariantInventory1,
          expectedVariantInventory2,
        ],
      });
    });
  });

  describe('findByProductId', () => {
    it('should return inventory for product', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(
        mockInventory,
      );

      const result = await service.findByProductId('product-123');

      expect(result).toEqual(mockInventory);
      expect(productInventoryRepository.findByProductId).toHaveBeenCalledWith(
        'product-123',
      );
    });

    it('should throw error when product inventory not found', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(null);

      await expect(
        service.findByProductId('non-existent'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should attach variant inventories when product has variants', async () => {
      const mockProductWithVariants = {
        id: 'product-123',
        name: 'Parent Product',
        variants: [
          {
            id: 'variant-1',
            name: 'Size S',
            barcode: undefined,
            images: { avatar: undefined, others: [] },
          },
          {
            id: 'variant-2',
            name: 'Size M',
            barcode: undefined,
            images: { avatar: undefined, others: [] },
          },
          {
            id: 'variant-3',
            name: 'Size L',
            barcode: undefined,
            images: { avatar: undefined, others: [] },
          },
        ],
      };

      const mockVariantInventories = [
        {
          id: 'inv-1',
          productId: 'variant-1',
          available: 20,
          totalQuantity: 25,
        },
        {
          id: 'inv-2',
          productId: 'variant-2',
          available: 15,
          totalQuantity: 20,
        },
        {
          id: 'inv-3',
          productId: 'variant-3',
          available: 10,
          totalQuantity: 15,
        },
      ];

      // Expected enriched variant inventories
      const expectedVariantInventories = [
        {
          ...mockVariantInventories[0],
          productName: 'Size S',
          barcode: undefined,
          image: { avatar: undefined, others: [] },
        },
        {
          ...mockVariantInventories[1],
          productName: 'Size M',
          barcode: undefined,
          image: { avatar: undefined, others: [] },
        },
        {
          ...mockVariantInventories[2],
          productName: 'Size L',
          barcode: undefined,
          image: { avatar: undefined, others: [] },
        },
      ];

      productInventoryRepository.findByProductId.mockResolvedValue(
        mockInventory,
      );
      productRepository.findById.mockResolvedValue(
        mockProductWithVariants as any,
      );
      (productInventoryRepository as any).findByProductIds = jest
        .fn()
        .mockResolvedValue(mockVariantInventories);

      const result = await service.findByProductId('product-123');

      expect(productRepository.findById).toHaveBeenCalledWith('product-123');
      expect(
        (productInventoryRepository as any).findByProductIds,
      ).toHaveBeenCalledWith(['variant-1', 'variant-2', 'variant-3']);
      expect(result).toEqual({
        ...mockInventory,
        variantInventories: expectedVariantInventories,
      });
    });
  });

  describe('checkAvailability', () => {
    it('should return true when product has available stock', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(
        mockInventory,
      );

      const result = await service.checkAvailability('product-123');

      expect(result).toBe(true);
    });

    it('should return false when product has no available stock', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue({
        ...mockInventory,
        totalAvailable: 0,
      });

      const result = await service.checkAvailability('product-123');

      expect(result).toBe(false);
    });

    it('should return false when inventory not found', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(null);

      const result = await service.checkAvailability('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getAvailableQuantity', () => {
    it('should return available quantity', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(
        mockInventory,
      );

      const result = await service.getAvailableQuantity('product-123');

      expect(result).toBe(80);
    });

    it('should return 0 when inventory not found', async () => {
      productInventoryRepository.findByProductId.mockResolvedValue(null);

      const result = await service.getAvailableQuantity('non-existent');

      expect(result).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics object', () => {
      const result = service.getStatistics();

      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('totalStock');
      expect(result).toHaveProperty('totalAvailable');
      expect(result).toHaveProperty('outOfStock');
    });
  });
});
