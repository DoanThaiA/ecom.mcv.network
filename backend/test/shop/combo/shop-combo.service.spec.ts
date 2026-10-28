import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShopComboService } from '../../../src/shop/combo/shop-combo.service';
import { ComboRepository } from '../../../src/combos/domain/combo.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { Combo } from '../../../src/combos/domain/combo';
import { Product } from '../../../src/products/domain/product';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';

describe('ShopComboService', () => {
  let service: ShopComboService;
  let comboRepository: jest.Mocked<ComboRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct: Product = {
    id: 'product-123',
    businessId: '110668',
    source: 'nhanh',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: ProductStatus.ACTIVE,
    snapshot: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Product;

  const mockCombo: Combo = {
    id: 'combo-123',
    name: 'Test Combo',
    description: 'Test combo description',
    image: 'http://example.com/combo.jpg',
    items: [
      { productId: 'product-123', quantity: 1 },
      { productId: 'product-456', quantity: 1 },
    ],
    discountType: DiscountType.FIXED,
    discountValue: 20000,
    originalPrice: 200000,
    status: ComboStatus.ACTIVE,
    validFrom: null,
    validTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockComboRepository = {
      findActiveByProductId: jest.fn(),
      findById: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findVariantsByParentSnapshotId: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopComboService,
        { provide: ComboRepository, useValue: mockComboRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ShopComboService>(ShopComboService);
    comboRepository = module.get(ComboRepository);
    productRepository = module.get(ProductRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCombosForProduct', () => {
    it('should return active combos for a product', async () => {
      comboRepository.findActiveByProductId.mockResolvedValue([mockCombo]);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.combos[0].id).toBe('combo-123');
      expect(result.combos[0].name).toBe('Test Combo');
      expect(comboRepository.findActiveByProductId).toHaveBeenCalledWith(
        'product-123',
      );
    });

    it('should filter out expired combos', async () => {
      const expiredCombo = {
        ...mockCombo,
        validTo: new Date(Date.now() - 86400000), // Yesterday
      };
      comboRepository.findActiveByProductId.mockResolvedValue([expiredCombo]);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter out not-yet-valid combos', async () => {
      const futureCombo = {
        ...mockCombo,
        validFrom: new Date(Date.now() + 86400000), // Tomorrow
      };
      comboRepository.findActiveByProductId.mockResolvedValue([futureCombo]);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should include only currently valid combos', async () => {
      const validCombo = {
        ...mockCombo,
        validFrom: new Date(Date.now() - 86400000), // Started yesterday
        validTo: new Date(Date.now() + 86400000), // Ends tomorrow
      };
      comboRepository.findActiveByProductId.mockResolvedValue([validCombo]);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return empty list when no combos found', async () => {
      comboRepository.findActiveByProductId.mockResolvedValue([]);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should include product details in combo items', async () => {
      comboRepository.findActiveByProductId.mockResolvedValue([mockCombo]);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos[0].items).toHaveLength(2);
      expect(result.combos[0].items[0]).toMatchObject({
        productId: 'product-123',
        quantity: 1,
        productName: 'Test Product',
        productImage: 'http://example.com/image.jpg',
        productPrice: 100000,
        isParentProduct: false,
      });
    });

    it('should calculate discount amount correctly for fixed discount', async () => {
      comboRepository.findActiveByProductId.mockResolvedValue([mockCombo]);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos[0].originalPrice).toBe(200000);
      expect(result.combos[0].discountAmount).toBe(20000);
      expect(result.combos[0].finalPrice).toBe(180000);
    });

    it('should calculate discount amount correctly for percentage discount', async () => {
      const percentageCombo = {
        ...mockCombo,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15, // 15%
      };
      comboRepository.findActiveByProductId.mockResolvedValue([
        percentageCombo,
      ]);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getCombosForProduct('product-123');

      expect(result.combos[0].discountAmount).toBe(30000); // 15% of 200000 = 30000
      expect(result.combos[0].finalPrice).toBe(170000);
    });
  });

  describe('getComboById', () => {
    it('should return combo by ID', async () => {
      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getComboById('combo-123');

      expect(result.id).toBe('combo-123');
      expect(result.name).toBe('Test Combo');
      expect(result.items).toHaveLength(2);
      expect(comboRepository.findById).toHaveBeenCalledWith('combo-123');
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(service.getComboById('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.notFound');
    });

    it('should throw error when combo is not active', async () => {
      const inactiveCombo = {
        ...mockCombo,
        status: ComboStatus.INACTIVE,
      };
      comboRepository.findById.mockResolvedValue(inactiveCombo);

      await expect(service.getComboById('combo-123')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.comboNotActive');
    });

    it('should throw error when combo is not yet valid', async () => {
      const futureCombo = {
        ...mockCombo,
        validFrom: new Date(Date.now() + 86400000), // Tomorrow
      };
      comboRepository.findById.mockResolvedValue(futureCombo);

      await expect(service.getComboById('combo-123')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.comboNotYetValid');
    });

    it('should throw error when combo is expired', async () => {
      const expiredCombo = {
        ...mockCombo,
        validTo: new Date(Date.now() - 86400000), // Yesterday
      };
      comboRepository.findById.mockResolvedValue(expiredCombo);

      await expect(service.getComboById('combo-123')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.comboExpired');
    });

    it('should include variants for parent products', async () => {
      const variant1 = {
        id: 'variant-1',
        code: 'AH023-Đỏ-S',
        name: 'Áo - Đỏ - S',
        status: ProductStatus.ACTIVE,
        prices: { retail: 95000 },
        inventory: { available: 3 },
        images: { avatar: 'do-s.jpg' },
        attributes: [
          { id: 6, name: 'Màu sắc', value: 'Đỏ' },
          { id: 7, name: 'Kích cỡ', value: 'S' },
        ],
      } as unknown as Product;

      const variant2 = {
        id: 'variant-2',
        code: 'AH023-Đỏ-M',
        name: 'Áo - Đỏ - M',
        status: ProductStatus.ACTIVE,
        prices: { retail: 100000 },
        inventory: { available: 0 },
        attributes: [
          { id: 6, name: 'Màu sắc', value: 'Đỏ' },
          { id: 8, name: 'Kích cỡ', value: 'M' },
        ],
      } as unknown as Product;

      const parentProduct: Product = {
        ...mockProduct,
        code: 'AH023',
        variants: [variant1, variant2],
      } as unknown as Product;

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(parentProduct);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].isParentProduct).toBe(true);
      expect(result.items[0].productCode).toBe('AH023');
      expect(result.items[0].variants).toHaveLength(2);
      // The client needs code + attributes to split the single variant
      // dropdown into separate colour and size pickers.
      expect(result.items[0].variants).toEqual([
        {
          id: 'variant-1',
          name: 'Áo - Đỏ - S',
          price: 95000,
          code: 'AH023-Đỏ-S',
          available: 3,
          image: 'do-s.jpg',
          attributes: [
            { name: 'Màu sắc', value: 'Đỏ' },
            { name: 'Kích cỡ', value: 'S' },
          ],
        },
        {
          id: 'variant-2',
          name: 'Áo - Đỏ - M',
          price: 100000,
          code: 'AH023-Đỏ-M',
          available: 0,
          image: null,
          attributes: [
            { name: 'Màu sắc', value: 'Đỏ' },
            { name: 'Kích cỡ', value: 'M' },
          ],
        },
      ]);
    });

    it('should keep variant code and attributes optional when absent', async () => {
      const parentProduct: Product = {
        ...mockProduct,
        code: 'AH023',
        variants: [
          {
            id: 'variant-1',
            name: 'Size S',
            status: ProductStatus.ACTIVE,
            prices: { retail: 95000 },
          },
        ],
      } as unknown as Product;

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(parentProduct);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].variants).toEqual([
        {
          id: 'variant-1',
          name: 'Size S',
          price: 95000,
          code: null,
          available: 0,
          image: null,
          attributes: undefined,
        },
      ]);
    });

    it('should hide variants the shop cannot sell', async () => {
      const parentProduct: Product = {
        ...mockProduct,
        code: 'AH023',
        variants: [
          {
            id: 'variant-1',
            code: 'AH023-Đỏ-S',
            name: 'Áo - Đỏ - S',
            status: ProductStatus.ACTIVE,
            prices: { retail: 95000 },
            inventory: { available: 3 },
          },
          {
            id: 'variant-2',
            code: 'AH023-Đỏ-M',
            name: 'Áo - Đỏ - M',
            status: ProductStatus.DISCONTINUED,
            prices: { retail: 100000 },
            inventory: { available: 9 },
          },
        ],
      } as unknown as Product;

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(parentProduct);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].variants).toHaveLength(1);
      expect(result.items[0].variants?.[0].id).toBe('variant-1');
    });

    it('should still report a parent whose variants are all unsellable', async () => {
      // Real production case 25TNC2014OB: 35 variants, none ACTIVE. The client
      // needs isParentProduct to stay true so it blocks the add instead of
      // sending the parent id, which is not a sellable SKU.
      const parentProduct: Product = {
        ...mockProduct,
        code: 'AH023',
        variants: [
          {
            id: 'variant-1',
            name: 'Áo - Đỏ - S',
            status: ProductStatus.INACTIVE,
            prices: { retail: 95000 },
          },
        ],
      } as unknown as Product;

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(parentProduct);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].isParentProduct).toBe(true);
      expect(result.items[0].variants).toBeUndefined();
    });

    it('should handle product not found gracefully', async () => {
      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(null);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].productName).toBeNull();
      expect(result.items[0].productImage).toBeNull();
      expect(result.items[0].productPrice).toBeNull();
      expect(result.items[0].isParentProduct).toBe(false);
    });

    it('should not include variants when product has no snapshot', async () => {
      const productNoSnapshot: Product = {
        ...mockProduct,
        snapshot: null,
      };

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(productNoSnapshot);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].isParentProduct).toBe(false);
      expect(result.items[0].variants).toBeUndefined();
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
    });

    it('should not include variants when product is not parent product', async () => {
      const childProduct: Product = {
        ...mockProduct,
        snapshot: {
          id: '12345',
          parentId: 99999, // Not -2, so not a parent
        },
      } as Product;

      comboRepository.findById.mockResolvedValue(mockCombo);
      productRepository.findById.mockResolvedValue(childProduct);

      const result = await service.getComboById('combo-123');

      expect(result.items[0].isParentProduct).toBe(false);
      expect(result.items[0].variants).toBeUndefined();
      expect(
        productRepository.findVariantsByParentSnapshotId,
      ).not.toHaveBeenCalled();
    });

    it('should cap fixed discount at original price', async () => {
      const highDiscountCombo = {
        ...mockCombo,
        discountType: DiscountType.FIXED,
        discountValue: 300000, // Higher than original price
        originalPrice: 200000,
      };

      comboRepository.findById.mockResolvedValue(highDiscountCombo);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getComboById('combo-123');

      expect(result.discountAmount).toBe(200000); // Capped at original price
      expect(result.finalPrice).toBe(0);
    });
  });
});
