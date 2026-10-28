import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CombosService } from '../../src/combos/combos.service';
import { ComboRepository } from '../../src/combos/domain/combo.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { Combo } from '../../src/combos/domain/combo';
import { ComboStatus } from '../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../src/combos/domain/discount-type.enum';
import { CreateComboDto } from '../../src/combos/dto/create-combo.dto';
import { UpdateComboDto } from '../../src/combos/dto/update-combo.dto';
import {
  calculateDiscountAmount,
  calculateRoundedDiscountAmount,
} from '../../src/utils/helpers/round-price';

describe('CombosService', () => {
  let service: CombosService;
  let comboRepository: jest.Mocked<ComboRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: 'active',
  };

  const mockCombo: Combo = {
    id: 'combo-123',
    name: 'Test Combo',
    description: 'Test combo description',
    image: 'http://example.com/combo.jpg',
    items: [
      { productId: 'product-123', quantity: 2 },
      { productId: 'product-456', quantity: 1 },
    ],
    discountType: DiscountType.FIXED,
    discountValue: 50000,
    originalPrice: 300000,
    status: ComboStatus.ACTIVE,
    validFrom: null,
    validTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockComboRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyWithPagination: jest.fn(),
      findActiveByProductId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
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
        CombosService,
        { provide: ComboRepository, useValue: mockComboRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<CombosService>(CombosService);
    comboRepository = module.get(ComboRepository);
    productRepository = module.get(ProductRepository);
    i18n = module.get(I18nService);

    // Default mock for findByIds - returns products matching the requested IDs
    productRepository.findByIds.mockImplementation((ids: string[]) => {
      return Promise.resolve(ids.map((id) => ({ ...mockProduct, id }) as any));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateComboDto = {
      name: 'New Combo',
      description: 'New combo description',
      items: [
        { productId: 'product-123', quantity: 2 },
        { productId: 'product-456', quantity: 1 },
      ],
      discountType: DiscountType.FIXED,
      discountValue: 50000,
    };

    it('should create combo successfully', async () => {
      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        { ...mockProduct, id: 'product-456' },
      ] as any);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      comboRepository.create.mockResolvedValue(mockCombo);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', mockCombo.id);
      expect(result).toHaveProperty('name', mockCombo.name);
      expect(comboRepository.create).toHaveBeenCalled();
    });

    it('should throw error when percentage discount exceeds 100', async () => {
      const invalidDto: CreateComboDto = {
        ...createDto,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 150,
      };

      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        { ...mockProduct, id: 'product-456' },
      ] as any);

      await expect(service.create(invalidDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when fixed discount exceeds original price', async () => {
      const invalidDto: CreateComboDto = {
        ...createDto,
        discountType: DiscountType.FIXED,
        discountValue: 1000000, // Much higher than total
      };

      productRepository.findByIds.mockResolvedValue([
        mockProduct,
        { ...mockProduct, id: 'product-456' },
      ] as any);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      await expect(service.create(invalidDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when product not found', async () => {
      productRepository.findByIds.mockResolvedValue([mockProduct] as any); // Missing one product

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should calculate original price correctly', async () => {
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-123', prices: { retail: 100000 } },
        { ...mockProduct, id: 'product-456', prices: { retail: 150000 } },
      ] as any);
      productRepository.findById.mockImplementation((id) => {
        if (id === 'product-123')
          return Promise.resolve({
            ...mockProduct,
            prices: { retail: 100000 },
          } as any);
        return Promise.resolve({
          ...mockProduct,
          id: 'product-456',
          prices: { retail: 150000 },
        } as any);
      });
      comboRepository.create.mockResolvedValue(mockCombo);

      await service.create(createDto);

      // 100000 * 2 + 150000 * 1 = 350000
      expect(comboRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalPrice: 350000,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return combo when found', async () => {
      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findOne('combo-123');

      expect(result).toHaveProperty('id', mockCombo.id);
      expect(comboRepository.findById).toHaveBeenCalledWith('combo-123');
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated combos', async () => {
      const paginatedResult = {
        docs: [mockCombo],
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
      comboRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(1);
      expect(comboRepository.findManyWithPagination).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateComboDto = {
      name: 'Updated Combo',
      description: 'Updated description',
    };

    it('should update combo successfully', async () => {
      const updatedCombo = { ...mockCombo, ...updateDto };
      comboRepository.findById.mockResolvedValue(mockCombo);
      comboRepository.update.mockResolvedValue(updatedCombo as any);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.update('combo-123', updateDto);

      expect(result).toHaveProperty('name', 'Updated Combo');
      expect(comboRepository.update).toHaveBeenCalledWith(
        'combo-123',
        expect.objectContaining({ name: 'Updated Combo' }),
      );
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should validate discount when updating', async () => {
      const invalidUpdate: UpdateComboDto = {
        discountType: DiscountType.PERCENTAGE,
        discountValue: 150,
      };

      comboRepository.findById.mockResolvedValue(mockCombo);

      await expect(
        service.update('combo-123', invalidUpdate),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should recalculate original price when items updated', async () => {
      const updateWithItems: UpdateComboDto = {
        items: [{ productId: 'product-789', quantity: 3 }],
      };

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, id: 'product-789', prices: { retail: 200000 } },
      ] as any);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'product-789',
        prices: { retail: 200000 },
      } as any);
      comboRepository.update.mockResolvedValue({
        ...mockCombo,
        items: updateWithItems.items!,
        originalPrice: 600000,
      });

      await service.update('combo-123', updateWithItems);

      expect(comboRepository.update).toHaveBeenCalledWith(
        'combo-123',
        expect.objectContaining({
          originalPrice: 600000,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove combo successfully', async () => {
      comboRepository.findById.mockResolvedValue(mockCombo);
      comboRepository.remove.mockResolvedValue(undefined);

      await service.remove('combo-123');

      expect(comboRepository.remove).toHaveBeenCalledWith('combo-123');
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findByProductId', () => {
    it('should return combos containing product', async () => {
      comboRepository.findActiveByProductId.mockResolvedValue([mockCombo]);
      productRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findByProductId('product-123');

      expect(result).toHaveLength(1);
      expect(comboRepository.findActiveByProductId).toHaveBeenCalledWith(
        'product-123',
      );
    });
  });

  describe('calculateDiscountAmount (shared utility)', () => {
    it('should calculate fixed discount correctly', () => {
      const result = calculateDiscountAmount(100000, DiscountType.FIXED, 30000);
      expect(result).toBe(30000);
    });

    it('should cap fixed discount at original price', () => {
      const result = calculateDiscountAmount(
        100000,
        DiscountType.FIXED,
        150000,
      );
      expect(result).toBe(100000);
    });

    it('should calculate percentage discount correctly', () => {
      const result = calculateDiscountAmount(
        100000,
        DiscountType.PERCENTAGE,
        20,
      );
      expect(result).toBe(20000);
    });

    it('should round percentage discount', () => {
      const result = calculateDiscountAmount(
        99999,
        DiscountType.PERCENTAGE,
        33,
      );
      expect(result).toBe(Math.round(99999 * 0.33));
    });
  });

  describe('calculateFinalPrice', () => {
    it('should calculate final price correctly for fixed discount', () => {
      const result = service.calculateFinalPrice(
        100000,
        DiscountType.FIXED,
        30000,
      );
      expect(result).toBe(70000);
    });

    it('should calculate final price correctly for percentage discount', () => {
      const result = service.calculateFinalPrice(
        100000,
        DiscountType.PERCENTAGE,
        25,
      );
      expect(result).toBe(75000);
    });

    it('should not return negative price', () => {
      const result = service.calculateFinalPrice(
        100000,
        DiscountType.FIXED,
        150000,
      );
      expect(result).toBe(0);
    });
  });
});
