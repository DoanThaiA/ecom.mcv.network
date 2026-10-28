import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ProductsService } from '../../src/products/products.service';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { Product } from '../../src/products/domain/product';
import { ProductStatus } from '../../src/products/domain/product-status.enum';
import { ProductType } from '../../src/products/domain/product-type.enum';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct: Product = {
    id: 'product-123',
    businessId: '110668',
    source: 'nhanh',
    code: 'PROD-001',
    barcode: '1234567890',
    name: 'Test Product',
    description: 'Test description',
    images: {
      avatar: 'http://example.com/image.jpg',
      others: [],
    },
    prices: {
      retail: 100000,
      wholesale: 90000,
      import: 80000,
    },
    status: ProductStatus.ACTIVE,
    type: ProductType.REGULAR,
    category: {
      id: 'category-123',
      name: 'Test Category',
    },
    snapshot: {
      id: 123,
      parentId: -2, // Parent product
      attributes: [],
    },
    hide: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVariant: Product = {
    ...mockProduct,
    id: 'variant-123',
    code: 'PROD-001-RED',
    name: 'Test Product - Red',
    // Embedded variants don't have snapshot, attributes are at top level
    snapshot: undefined,
    attributes: [
      { id: 1, name: 'Color', value: 'Red' },
      { id: 2, name: 'Size', value: 'M' },
    ],
  };

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    const mockProductRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findManyWithPagination: jest.fn(),
      findVariantsByParentSnapshotId: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(ProductRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);

    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginatedResult = {
        docs: [mockProduct],
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
      productRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );
      productRepository.findVariantsByParentSnapshotId.mockResolvedValue([]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            businessId: '110668',
          }),
        }),
      );
    });

    it('should include variants by default', async () => {
      // Product with embedded variants (populated during sync)
      const productWithVariants = {
        ...mockProduct,
        variants: [mockVariant],
      };
      const paginatedResult = {
        docs: [productWithVariants],
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
      productRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findAll({ page: 1, limit: 10 });

      // Variants are now embedded, not fetched separately
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
      expect((result.docs[0] as any).variants).toBeDefined();
      expect((result.docs[0] as any).variants).toHaveLength(1);
    });

    it('should return products with embedded variants from sync', async () => {
      const productWithVariants = {
        ...mockProduct,
        variants: [mockVariant],
        variantOptions: [{ id: '1', name: 'Color', values: ['Red'] }],
      };
      const paginatedResult = {
        docs: [productWithVariants],
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
      productRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      // Variants are embedded from sync, no separate query needed
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
      expect((result.docs[0] as any).variants).toHaveLength(1);
      expect((result.docs[0] as any).variantOptions).toHaveLength(1);
    });

    it('should use provided businessId from filters', async () => {
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
      productRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findAll({
        filters: { businessId: '999999' },
      });

      expect(productRepository.findManyWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            businessId: '999999',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-123');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('product-123');
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findByCode', () => {
    it('should return product when found by code', async () => {
      productRepository.findByCode.mockResolvedValue(mockProduct);

      const result = await service.findByCode('PROD-001');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findByCode).toHaveBeenCalledWith('PROD-001');
    });

    it('should throw error when product not found by code', async () => {
      productRepository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('NON-EXISTENT')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findOneWithVariants', () => {
    it('should return product with variants', async () => {
      // Product with embedded variants and pre-computed variantOptions (populated during sync)
      // Embedded variants have attributes at top level, no snapshot
      const productWithVariants = {
        ...mockProduct,
        variants: [
          mockVariant,
          {
            ...mockVariant,
            id: 'variant-456',
            attributes: [
              { id: 1, name: 'Color', value: 'Blue' },
              { id: 2, name: 'Size', value: 'L' },
            ],
          },
        ],
        variantOptions: [
          { id: '1', name: 'Color', values: ['Blue', 'Red'] },
          { id: '2', name: 'Size', values: ['L', 'M'] },
        ],
      };
      productRepository.findById.mockResolvedValue(productWithVariants);

      const result = await service.findOneWithVariants('product-123');

      expect(result.variants).toHaveLength(2);
      expect(result.variantOptions).toBeDefined();
      // Variants are now embedded, not fetched separately
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
    });

    it('should use pre-computed variant options', async () => {
      // Product with embedded variants and pre-computed variantOptions (populated during sync)
      // variantOptions are computed during sync, not at runtime
      const productWithVariants = {
        ...mockProduct,
        variants: [
          mockVariant,
          {
            ...mockVariant,
            id: 'variant-456',
            attributes: [
              { id: 1, name: 'Color', value: 'Blue' },
              { id: 2, name: 'Size', value: 'L' },
            ],
          },
        ],
        variantOptions: [
          { id: '1', name: 'Color', values: ['Blue', 'Red'] },
          { id: '2', name: 'Size', values: ['L', 'M'] },
        ],
      };
      productRepository.findById.mockResolvedValue(productWithVariants);

      const result = await service.findOneWithVariants('product-123');

      // Should use pre-computed variantOptions from sync
      expect(result.variantOptions).toHaveLength(2);

      const colorOption = result.variantOptions?.find(
        (o) => o.name === 'Color',
      );
      expect(colorOption?.values).toContain('Red');
      expect(colorOption?.values).toContain('Blue');

      const sizeOption = result.variantOptions?.find((o) => o.name === 'Size');
      expect(sizeOption?.values).toContain('M');
      expect(sizeOption?.values).toContain('L');
    });

    it('should return product without variants when not a parent', async () => {
      const standaloneProduct = {
        ...mockProduct,
        snapshot: {
          id: 123,
          parentId: -1, // Standalone, not a parent
          attributes: [],
        },
      };
      productRepository.findById.mockResolvedValue(standaloneProduct);

      const result = await service.findOneWithVariants('product-123');

      expect(result.variants).toBeUndefined();
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
    });

    it('should handle product without snapshot', async () => {
      const productNoSnapshot = {
        ...mockProduct,
        snapshot: null,
      };
      productRepository.findById.mockResolvedValue(productNoSnapshot);

      const result = await service.findOneWithVariants('product-123');

      expect(result.variants).toBeUndefined();
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.findOneWithVariants('non-existent'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return statistics object', () => {
      const result = service.getStatistics();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('bySource');
    });
  });

  describe('updateDetails', () => {
    const mockUpdateDto = {
      description: 'Updated description',
      content: '<p>Updated HTML content</p>',
      details: {
        material: 'Cotton',
        style: 'Casual',
        highlights: 'Comfortable, breathable',
        suitableFor: 'Daily wear',
        careInstructions: 'Machine wash cold',
      },
    };

    beforeEach(() => {
      (productRepository as any).updateDetails = jest.fn();
    });

    it('should update all CMS-specific fields', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      const updatedProduct = {
        ...mockProduct,
        ...mockUpdateDto,
      };
      (productRepository as any).updateDetails.mockResolvedValue(
        updatedProduct,
      );

      const result = await service.updateDetails('product-123', mockUpdateDto);

      expect(productRepository.findById).toHaveBeenCalledWith('product-123');
      expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
        'product-123',
        mockUpdateDto,
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should update only description when provided', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      const updatedProduct = {
        ...mockProduct,
        description: 'New description',
      };
      (productRepository as any).updateDetails.mockResolvedValue(
        updatedProduct,
      );

      const result = await service.updateDetails('product-123', {
        description: 'New description',
      });

      expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
        'product-123',
        { description: 'New description' },
      );
      expect(result.description).toBe('New description');
    });

    it('should update only content when provided', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      const updatedProduct = {
        ...mockProduct,
        content: '<p>New content</p>',
      };
      (productRepository as any).updateDetails.mockResolvedValue(
        updatedProduct,
      );

      const result = await service.updateDetails('product-123', {
        content: '<p>New content</p>',
      });

      expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
        'product-123',
        { content: '<p>New content</p>' },
      );
      expect(result.content).toBe('<p>New content</p>');
    });

    it('should update only details when provided', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      const newDetails = {
        material: 'Polyester',
        highlights: 'Durable',
      };
      const updatedProduct = {
        ...mockProduct,
        details: newDetails,
      };
      (productRepository as any).updateDetails.mockResolvedValue(
        updatedProduct,
      );

      const result = await service.updateDetails('product-123', {
        details: newDetails,
      });

      expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
        'product-123',
        { details: newDetails },
      );
      expect(result.details).toEqual(newDetails);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateDetails('non-existent', mockUpdateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect((productRepository as any).updateDetails).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      (productRepository as any).updateDetails.mockResolvedValue(null);

      await expect(
        service.updateDetails('product-123', mockUpdateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should handle empty update data', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      (productRepository as any).updateDetails.mockResolvedValue(mockProduct);

      const result = await service.updateDetails('product-123', {});

      expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
        'product-123',
        {},
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('bulkUpdateHide', () => {
    beforeEach(() => {
      (productRepository as any).bulkUpdateHide = jest.fn();
    });

    it('should bulk update hide status for multiple products', async () => {
      const items = [
        { productId: 'product-1', hide: true },
        { productId: 'product-2', hide: false },
        { productId: 'product-3', hide: true },
      ];
      (productRepository as any).bulkUpdateHide.mockResolvedValue(3);

      const result = await service.bulkUpdateHide(items);

      expect((productRepository as any).bulkUpdateHide).toHaveBeenCalledWith(
        items,
      );
      expect(result).toBe(3);
    });

    it('should handle single product update', async () => {
      const items = [{ productId: 'product-1', hide: true }];
      (productRepository as any).bulkUpdateHide.mockResolvedValue(1);

      const result = await service.bulkUpdateHide(items);

      expect((productRepository as any).bulkUpdateHide).toHaveBeenCalledWith(
        items,
      );
      expect(result).toBe(1);
    });

    it('should handle empty array', async () => {
      (productRepository as any).bulkUpdateHide.mockResolvedValue(0);

      const result = await service.bulkUpdateHide([]);

      expect((productRepository as any).bulkUpdateHide).toHaveBeenCalledWith(
        [],
      );
      expect(result).toBe(0);
    });

    it('should handle all products being hidden', async () => {
      const items = [
        { productId: 'product-1', hide: true },
        { productId: 'product-2', hide: true },
      ];
      (productRepository as any).bulkUpdateHide.mockResolvedValue(2);

      const result = await service.bulkUpdateHide(items);

      expect((productRepository as any).bulkUpdateHide).toHaveBeenCalledWith(
        items,
      );
      expect(result).toBe(2);
      expect(items.every((item) => item.hide === true)).toBe(true);
    });

    it('should handle all products being unhidden', async () => {
      const items = [
        { productId: 'product-1', hide: false },
        { productId: 'product-2', hide: false },
      ];
      (productRepository as any).bulkUpdateHide.mockResolvedValue(2);

      const result = await service.bulkUpdateHide(items);

      expect((productRepository as any).bulkUpdateHide).toHaveBeenCalledWith(
        items,
      );
      expect(result).toBe(2);
      expect(items.every((item) => item.hide === false)).toBe(true);
    });
  });
});
