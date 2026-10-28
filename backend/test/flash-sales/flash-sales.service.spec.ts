import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { FlashSalesService } from '../../src/flash-sales/flash-sales.service';
import { FlashSaleRepository } from '../../src/flash-sales/domain/flash-sale.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { FlashSaleProductRepository } from '../../src/flash-sale-products/domain/flash-sale-product.repository';
import { FlashSale } from '../../src/flash-sales/domain/flash-sale';
import { FlashSaleProduct } from '../../src/flash-sale-products/domain/flash-sale-product';
import { FlashSaleStatus } from '../../src/flash-sales/domain/flash-sale-status.enum';
import { DiscountType } from '../../src/combos/domain/discount-type.enum';
import { CreateFlashSaleDto } from '../../src/flash-sales/dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from '../../src/flash-sales/dto/update-flash-sale.dto';
import { CreateFlashSaleProductDto } from '../../src/flash-sales/dto/create-flash-sale-product.dto';
import { BulkAddFlashSaleProductsDto } from '../../src/flash-sales/dto/bulk-add-flash-sale-products.dto';
import { BulkUpdateFlashSaleProductsDto } from '../../src/flash-sales/dto/bulk-update-flash-sale-products.dto';
import { BulkUpsertFlashSaleProductsDto } from '../../src/flash-sales/dto/bulk-upsert-flash-sale-products.dto';

describe('FlashSalesService', () => {
  let service: FlashSalesService;
  let flashSaleRepository: jest.Mocked<FlashSaleRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let flashSaleProductRepository: jest.Mocked<FlashSaleProductRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    inventory: { remain: 1000, available: 1000 },
    status: 'active',
  };

  const mockFsProduct: Partial<FlashSaleProduct> = {
    productId: 'product-123',
    flashSaleId: 'flash-sale-123',
    flashSaleName: 'Summer Sale',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20,
    promotionalQuantity: 100,
    soldCount: 0,
    isEnabled: true,
  };

  const mockFlashSale: FlashSale = {
    id: 'flash-sale-123',
    name: 'Summer Sale',
    startTime: new Date('2025-06-01T00:00:00Z'),
    endTime: new Date('2025-06-30T23:59:59Z'),
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockFlashSaleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyWithPagination: jest.fn(),
      findOverlapping: jest.fn(),
      findCurrentlyActive: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    const mockFlashSaleProductRepository = {
      createOne: jest.fn(),
      updateOne: jest.fn(),
      removeOne: jest.fn(),
      bulkUpdate: jest.fn(),
      upsertMany: jest.fn(),
      findByFlashSaleIdWithPagination: jest.fn(),
      findByFlashSaleIdAndProductIds: jest.fn(),
      findOneByProductId: jest.fn(),
      findByActiveFlashSaleAndProductId: jest.fn(),
      findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
      countByFlashSaleId: jest.fn(),
      removeByFlashSaleId: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashSalesService,
        { provide: FlashSaleRepository, useValue: mockFlashSaleRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: FlashSaleProductRepository,
          useValue: mockFlashSaleProductRepository,
        },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<FlashSalesService>(FlashSalesService);
    flashSaleRepository = module.get(FlashSaleRepository);
    productRepository = module.get(ProductRepository);
    flashSaleProductRepository = module.get(FlashSaleProductRepository);
    i18n = module.get(I18nService);

    // Default mock for findByIds - returns products matching the requested IDs
    productRepository.findByIds.mockImplementation((ids: string[]) => {
      return Promise.resolve(ids.map((id) => ({ ...mockProduct, id }) as any));
    });

    // Default mock for paginated flash sale products
    flashSaleProductRepository.findByFlashSaleIdWithPagination.mockResolvedValue(
      {
        docs: [mockFsProduct as FlashSaleProduct],
        totalDocs: 1,
        limit: 200,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      } as any,
    );

    // Default mock for countByFlashSaleId
    flashSaleProductRepository.countByFlashSaleId.mockResolvedValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateFlashSaleDto = {
      name: 'New Flash Sale',
      startTime: '2025-06-01T00:00:00Z',
      endTime: '2025-06-30T23:59:59Z',
    };

    it('should create flash sale successfully', async () => {
      flashSaleRepository.findOverlapping.mockResolvedValue(null);
      flashSaleRepository.create.mockResolvedValue(mockFlashSale);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', mockFlashSale.id);
      expect(result).toHaveProperty('name', mockFlashSale.name);
      expect(flashSaleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          isEnabled: true,
        }),
      );
    });

    it('should throw error when overlapping with existing flash sale', async () => {
      flashSaleRepository.findOverlapping.mockResolvedValue(mockFlashSale);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('should throw error when start time is after end time', async () => {
      const invalidDto: CreateFlashSaleDto = {
        name: 'Invalid Sale',
        startTime: '2025-06-30T00:00:00Z',
        endTime: '2025-06-01T00:00:00Z',
      };

      await expect(service.create(invalidDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when start time equals end time', async () => {
      const invalidDto: CreateFlashSaleDto = {
        name: 'Invalid Sale',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-01T00:00:00Z',
      };

      await expect(service.create(invalidDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findOne', () => {
    it('should return flash sale when found', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);

      const result = await service.findOne('flash-sale-123');

      expect(result).toHaveProperty('id', mockFlashSale.id);
      expect(flashSaleRepository.findById).toHaveBeenCalledWith(
        'flash-sale-123',
      );
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should compute status based on time and enabled flag', async () => {
      const upcomingFlashSale = {
        ...mockFlashSale,
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 172800000),
      };
      flashSaleRepository.findById.mockResolvedValue(upcomingFlashSale);

      const result = await service.findOne('flash-sale-123');

      expect(result.status).toBe(FlashSaleStatus.UPCOMING);
    });

    it('should return DISABLED status when not enabled', async () => {
      const disabledFlashSale = {
        ...mockFlashSale,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isEnabled: false,
      };
      flashSaleRepository.findById.mockResolvedValue(disabledFlashSale);

      const result = await service.findOne('flash-sale-123');

      expect(result.status).toBe(FlashSaleStatus.DISABLED);
    });

    it('should return ENDED status when past end time', async () => {
      const endedFlashSale = {
        ...mockFlashSale,
        startTime: new Date(Date.now() - 172800000),
        endTime: new Date(Date.now() - 86400000),
      };
      flashSaleRepository.findById.mockResolvedValue(endedFlashSale);

      const result = await service.findOne('flash-sale-123');

      expect(result.status).toBe(FlashSaleStatus.ENDED);
    });
  });

  describe('findAll', () => {
    it('should return paginated flash sales', async () => {
      const paginatedResult = {
        docs: [mockFlashSale],
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
      flashSaleRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(flashSaleRepository.findManyWithPagination).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateFlashSaleDto = {
      name: 'Updated Flash Sale',
    };

    it('should update flash sale successfully', async () => {
      const updatedFlashSale = { ...mockFlashSale, name: 'Updated Flash Sale' };
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleRepository.update.mockResolvedValue(updatedFlashSale);

      const result = await service.update('flash-sale-123', updateDto);

      expect(result).toHaveProperty('name', 'Updated Flash Sale');
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should validate time range when updating dates', async () => {
      const invalidUpdate: UpdateFlashSaleDto = {
        startTime: '2025-06-30T00:00:00Z',
        endTime: '2025-06-01T00:00:00Z',
      };

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);

      await expect(
        service.update('flash-sale-123', invalidUpdate),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should validate against existing dates when only updating one', async () => {
      const invalidUpdate: UpdateFlashSaleDto = {
        endTime: '2025-05-01T00:00:00Z',
      };

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);

      await expect(
        service.update('flash-sale-123', invalidUpdate),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('remove', () => {
    it('should remove flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleRepository.remove.mockResolvedValue(undefined);
      flashSaleProductRepository.removeByFlashSaleId.mockResolvedValue(0);

      await service.remove('flash-sale-123');

      expect(flashSaleRepository.remove).toHaveBeenCalledWith('flash-sale-123');
      expect(
        flashSaleProductRepository.removeByFlashSaleId,
      ).toHaveBeenCalledWith('flash-sale-123');
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle enabled status to false', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleRepository.update.mockResolvedValue({
        ...mockFlashSale,
        isEnabled: false,
      });

      await service.toggleEnabled('flash-sale-123');

      expect(flashSaleRepository.update).toHaveBeenCalledWith(
        'flash-sale-123',
        { isEnabled: false },
      );
    });

    it('should toggle enabled status to true', async () => {
      const disabledFlashSale = { ...mockFlashSale, isEnabled: false };
      flashSaleRepository.findById.mockResolvedValue(disabledFlashSale);
      flashSaleRepository.findOverlapping.mockResolvedValue(null);
      flashSaleRepository.update.mockResolvedValue({
        ...mockFlashSale,
        isEnabled: true,
      });

      await service.toggleEnabled('flash-sale-123');

      expect(flashSaleRepository.update).toHaveBeenCalledWith(
        'flash-sale-123',
        { isEnabled: true },
      );
    });

    it('should throw error when enabling would overlap with another flash sale', async () => {
      const disabledFlashSale = { ...mockFlashSale, isEnabled: false };
      flashSaleRepository.findById.mockResolvedValue(disabledFlashSale);
      flashSaleRepository.findOverlapping.mockResolvedValue({
        ...mockFlashSale,
        id: 'another-flash-sale',
        name: 'Another Sale',
      });

      await expect(
        service.toggleEnabled('flash-sale-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });
  });

  describe('addProduct', () => {
    const addProductDto: CreateFlashSaleProductDto = {
      productId: 'product-456',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 30,
      promotionalQuantity: 50,
    };

    it('should add product to flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-456',
      } as any);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      flashSaleProductRepository.createOne.mockResolvedValue({} as any);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.addProduct('flash-sale-123', addProductDto);

      expect(flashSaleProductRepository.createOne).toHaveBeenCalled();
    });

    it('should throw error when product not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.addProduct('flash-sale-123', addProductDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when product already in flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(
        mockFsProduct as FlashSaleProduct,
      );

      const duplicateDto = { ...addProductDto, productId: 'product-123' };

      await expect(
        service.addProduct('flash-sale-123', duplicateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when product in another active flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-456',
      } as any);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue({
        ...mockFlashSale,
        id: 'another-flash-sale',
      });
      flashSaleProductRepository.findByActiveFlashSaleAndProductId.mockResolvedValue(
        mockFsProduct as FlashSaleProduct,
      );

      await expect(
        service.addProduct('flash-sale-123', addProductDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when percentage discount exceeds 100', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-456',
      } as any);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);

      const invalidDto = {
        ...addProductDto,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 150,
      };

      await expect(
        service.addProduct('flash-sale-123', invalidDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when fixed discount exceeds product price', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-456',
      } as any);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);

      const invalidDto = {
        ...addProductDto,
        discountType: DiscountType.FIXED,
        discountValue: 500000,
      };

      await expect(
        service.addProduct('flash-sale-123', invalidDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product in flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(
        mockFsProduct as FlashSaleProduct,
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);
      flashSaleProductRepository.updateOne.mockResolvedValue({
        ...mockFsProduct,
        discountValue: 25,
      } as FlashSaleProduct);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.updateProduct('flash-sale-123', 'product-123', {
        discountValue: 25,
      });

      expect(flashSaleProductRepository.updateOne).toHaveBeenCalledWith(
        'flash-sale-123',
        'product-123',
        { discountValue: 25 },
      );
    });

    it('should throw error when product not in flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);

      await expect(
        service.updateProduct('flash-sale-123', 'product-999', {
          discountValue: 25,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('removeProduct', () => {
    it('should remove product from flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(
        mockFsProduct as FlashSaleProduct,
      );
      flashSaleProductRepository.removeOne.mockResolvedValue(true);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.removeProduct('flash-sale-123', 'product-123');

      expect(flashSaleProductRepository.removeOne).toHaveBeenCalledWith(
        'flash-sale-123',
        'product-123',
      );
    });

    it('should throw error when product not in flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(null);

      await expect(
        service.removeProduct('flash-sale-123', 'product-999'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('toggleProduct', () => {
    it('should toggle product enabled status', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findOneByProductId.mockResolvedValue(
        mockFsProduct as FlashSaleProduct,
      );
      flashSaleProductRepository.updateOne.mockResolvedValue({
        ...mockFsProduct,
        isEnabled: false,
      } as FlashSaleProduct);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.toggleProduct('flash-sale-123', 'product-123');

      expect(flashSaleProductRepository.updateOne).toHaveBeenCalledWith(
        'flash-sale-123',
        'product-123',
        { isEnabled: false },
      );
    });
  });

  describe('bulkAddProducts', () => {
    const bulkAddDto: BulkAddFlashSaleProductsDto = {
      products: [
        {
          productId: 'product-456',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 30,
          promotionalQuantity: 50,
        },
        {
          productId: 'product-789',
          discountType: DiscountType.FIXED,
          discountValue: 20000,
          promotionalQuantity: 100,
        },
      ],
    };

    it('should bulk add products to flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      productRepository.findById
        .mockResolvedValueOnce({ ...mockProduct, id: 'product-456' } as any)
        .mockResolvedValueOnce({ ...mockProduct, id: 'product-789' } as any);
      flashSaleProductRepository.upsertMany.mockResolvedValue(2);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.bulkAddProducts('flash-sale-123', bulkAddDto);

      expect(flashSaleProductRepository.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ productId: 'product-456' }),
          expect.objectContaining({ productId: 'product-789' }),
        ]),
      );
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(
        service.bulkAddProducts('non-existent', bulkAddDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when products already in flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [{ ...mockFsProduct, productId: 'product-123' } as FlashSaleProduct],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const duplicateDto: BulkAddFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 50,
          },
        ],
      };

      await expect(
        service.bulkAddProducts('flash-sale-123', duplicateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should return failed products when some products not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      // Only product-789 is found; product-456 is not found
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-789' } as any,
      ]);

      const result = await service.bulkAddProducts(
        'flash-sale-123',
        bulkAddDto,
      );

      expect(result.failedCount).toBeGreaterThan(0);
    });

    it('should return failed products when product is in another active flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue({
        ...mockFlashSale,
        id: 'another-flash-sale',
      });
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-456' } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map([['product-456', mockFsProduct as FlashSaleProduct]]),
      );

      const singleProductDto: BulkAddFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 30,
            promotionalQuantity: 50,
          },
        ],
      };

      // When ALL products fail, the service throws BAD_REQUEST
      await expect(
        service.bulkAddProducts('flash-sale-123', singleProductDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when percentage discount exceeds 100', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-456',
      } as any);

      const invalidDto: BulkAddFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 150,
            promotionalQuantity: 50,
          },
        ],
      };

      await expect(
        service.bulkAddProducts('flash-sale-123', invalidDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('bulkUpdateProducts', () => {
    const bulkUpdateDto: BulkUpdateFlashSaleProductsDto = {
      products: [
        {
          productId: 'product-123',
          discountValue: 25,
          isEnabled: false,
        },
      ],
    };

    it('should bulk update products in flash sale successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [mockFsProduct as FlashSaleProduct],
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);
      flashSaleProductRepository.bulkUpdate.mockResolvedValue(1);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      await service.bulkUpdateProducts('flash-sale-123', bulkUpdateDto);

      expect(flashSaleProductRepository.bulkUpdate).toHaveBeenCalledWith(
        'flash-sale-123',
        bulkUpdateDto.products,
      );
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      await expect(
        service.bulkUpdateProducts('non-existent', bulkUpdateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when products not in flash sale', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [mockFsProduct as FlashSaleProduct],
      );

      const invalidDto: BulkUpdateFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-999',
            discountValue: 25,
          },
        ],
      };

      await expect(
        service.bulkUpdateProducts('flash-sale-123', invalidDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should validate discount when updating discount type or value', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [mockFsProduct as FlashSaleProduct],
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const invalidDto: BulkUpdateFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 150,
          },
        ],
      };

      await expect(
        service.bulkUpdateProducts('flash-sale-123', invalidDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should update multiple products at once', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [
          { ...mockFsProduct, productId: 'product-123' } as FlashSaleProduct,
          { ...mockFsProduct, productId: 'product-456' } as FlashSaleProduct,
        ],
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);
      flashSaleProductRepository.bulkUpdate.mockResolvedValue(2);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const multiUpdateDto: BulkUpdateFlashSaleProductsDto = {
        products: [
          { productId: 'product-123', discountValue: 25 },
          { productId: 'product-456', discountValue: 30 },
        ],
      };

      await service.bulkUpdateProducts('flash-sale-123', multiUpdateDto);

      expect(flashSaleProductRepository.bulkUpdate).toHaveBeenCalledWith(
        'flash-sale-123',
        multiUpdateDto.products,
      );
    });
  });

  describe('bulkUpsertProducts', () => {
    it('should add all new products successfully', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      flashSaleProductRepository.upsertMany.mockResolvedValue(2);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 30,
            promotionalQuantity: 50,
          },
          {
            productId: 'product-789',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            promotionalQuantity: 100,
          },
        ],
      };

      const result = await service.bulkUpsertProducts('flash-sale-123', dto);

      expect(result.addedCount).toBe(2);
      expect(result.updatedCount).toBe(0);
      expect(result.upsertedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(flashSaleProductRepository.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-456',
            soldCount: 0,
          }),
          expect.objectContaining({
            productId: 'product-789',
            soldCount: 0,
          }),
        ]),
      );
    });

    it('should update existing products and preserve soldCount', async () => {
      const existingFsProduct = {
        ...mockFsProduct,
        productId: 'product-123',
        soldCount: 42,
        isEnabled: true,
        order: 5,
      } as FlashSaleProduct;

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [existingFsProduct],
      );
      flashSaleProductRepository.upsertMany.mockResolvedValue(1);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 25,
            promotionalQuantity: 200,
          },
        ],
      };

      const result = await service.bulkUpsertProducts('flash-sale-123', dto);

      expect(result.addedCount).toBe(0);
      expect(result.updatedCount).toBe(1);
      expect(result.upsertedCount).toBe(1);
      expect(flashSaleProductRepository.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-123',
            soldCount: 42,
            isEnabled: true,
            order: 5,
          }),
        ]),
      );
    });

    it('should handle mix of new and existing products', async () => {
      const existingFsProduct = {
        ...mockFsProduct,
        productId: 'product-123',
        soldCount: 10,
        isEnabled: false,
        order: 3,
      } as FlashSaleProduct;

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [existingFsProduct],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-123' } as any,
        { ...mockProduct, id: 'product-456' } as any,
      ]);
      flashSaleProductRepository.upsertMany.mockResolvedValue(2);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 25,
            promotionalQuantity: 200,
          },
          {
            productId: 'product-456',
            discountType: DiscountType.FIXED,
            discountValue: 10000,
            promotionalQuantity: 50,
          },
        ],
      };

      const result = await service.bulkUpsertProducts('flash-sale-123', dto);

      expect(result.addedCount).toBe(1);
      expect(result.updatedCount).toBe(1);
      expect(result.upsertedCount).toBe(2);
      expect(result.failedCount).toBe(0);
    });

    it('should skip conflict/stock/image checks for existing products', async () => {
      // Existing product with no stock and no image — should still succeed
      const existingFsProduct = {
        ...mockFsProduct,
        productId: 'product-123',
        soldCount: 5,
        isEnabled: true,
        order: 0,
      } as FlashSaleProduct;

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [existingFsProduct],
      );
      productRepository.findByIds.mockResolvedValue([
        {
          ...mockProduct,
          id: 'product-123',
          inventory: { remain: 0, available: 0 },
          images: { avatar: null, others: [] },
        } as any,
      ]);
      flashSaleProductRepository.upsertMany.mockResolvedValue(1);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 100,
          },
        ],
      };

      const result = await service.bulkUpsertProducts('flash-sale-123', dto);

      expect(result.updatedCount).toBe(1);
      expect(result.failedCount).toBe(0);
    });

    it('should fail new products that have no stock', async () => {
      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue(null);
      productRepository.findByIds.mockResolvedValue([
        {
          ...mockProduct,
          id: 'product-456',
          inventory: { remain: 0, available: 0 },
        } as any,
      ]);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 50,
          },
        ],
      };

      await expect(
        service.bulkUpsertProducts('flash-sale-123', dto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when flash sale not found', async () => {
      flashSaleRepository.findById.mockResolvedValue(null);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 50,
          },
        ],
      };

      await expect(
        service.bulkUpsertProducts('non-existent', dto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should only check conflicts for new product IDs', async () => {
      const existingFsProduct = {
        ...mockFsProduct,
        productId: 'product-123',
        soldCount: 0,
        isEnabled: true,
        order: 0,
      } as FlashSaleProduct;

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [existingFsProduct],
      );
      flashSaleRepository.findCurrentlyActive.mockResolvedValue({
        ...mockFlashSale,
        id: 'another-flash-sale',
      });
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-123' } as any,
        { ...mockProduct, id: 'product-456' } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      flashSaleProductRepository.upsertMany.mockResolvedValue(2);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 100,
          },
          {
            productId: 'product-456',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 30,
            promotionalQuantity: 50,
          },
        ],
      };

      await service.bulkUpsertProducts('flash-sale-123', dto);

      // Conflict check should only include the new product ID
      expect(
        flashSaleProductRepository.findActiveForProducts,
      ).toHaveBeenCalledWith('another-flash-sale', ['product-456']);
    });

    it('should skip conflict check entirely when all products are existing', async () => {
      const existingFsProduct = {
        ...mockFsProduct,
        productId: 'product-123',
        soldCount: 0,
        isEnabled: true,
        order: 0,
      } as FlashSaleProduct;

      flashSaleRepository.findById.mockResolvedValue(mockFlashSale);
      flashSaleProductRepository.findByFlashSaleIdAndProductIds.mockResolvedValue(
        [existingFsProduct],
      );
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-123' } as any,
      ]);
      flashSaleProductRepository.upsertMany.mockResolvedValue(1);
      flashSaleRepository.update.mockResolvedValue(mockFlashSale);

      const dto: BulkUpsertFlashSaleProductsDto = {
        products: [
          {
            productId: 'product-123',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            promotionalQuantity: 100,
          },
        ],
      };

      await service.bulkUpsertProducts('flash-sale-123', dto);

      // Should not call findCurrentlyActive since all products are existing
      expect(flashSaleRepository.findCurrentlyActive).not.toHaveBeenCalled();
    });
  });
});
