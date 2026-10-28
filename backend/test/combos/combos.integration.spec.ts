import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../src/test/mongo-test.module';
import { CombosService } from '../../src/combos/combos.service';
import { ComboDocumentRepository } from '../../src/combos/model/combo.repository';
import { ComboRepository } from '../../src/combos/domain/combo.repository';
import {
  ComboSchemaClass,
  ComboSchema,
} from '../../src/combos/model/combo.schema';
import { ProductDocumentRepository } from '../../src/products/model/product.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../src/products/model/product.schema';
import { ComboStatus } from '../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../src/combos/domain/discount-type.enum';
import { ProductStatus } from '../../src/products/domain/product-status.enum';
import { ProductType } from '../../src/products/domain/product-type.enum';

/**
 * Integration tests for CombosService + ComboDocumentRepository + ProductRepository
 * Tests the full flow from service through repositories to in-memory MongoDB
 */
describe('CombosService Integration', () => {
  let service: CombosService;
  let comboModel: PaginateModel<ComboSchemaClass>;
  let productRepository: ProductDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Helper to create test products
  const createTestProduct = async (
    overrides: Partial<{
      code: string;
      name: string;
      prices: { retail: number };
    }> = {},
  ) => {
    const timestamp = Date.now() + Math.random();
    const productData = {
      businessId: '110668',
      source: 'nhanh' as const,
      code: `PROD-${timestamp}`,
      name: `Test Product ${timestamp}`,
      description: 'Test product description',
      prices: { retail: 100000, ...overrides.prices },
      images: { avatar: 'http://example.com/image.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      ...overrides,
    };
    return productRepository.create(productData as any);
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: ComboSchemaClass.name, schema: ComboSchema },
          { name: ProductSchemaClass.name, schema: ProductSchema },
        ]),
      ],
      providers: [
        CombosService,
        ComboDocumentRepository,
        ProductDocumentRepository,
        { provide: ComboRepository, useExisting: ComboDocumentRepository },
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<CombosService>(CombosService);
    comboModel = module.get<PaginateModel<ComboSchemaClass>>(
      getModelToken(ComboSchemaClass.name),
    );
    productRepository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await comboModel.deleteMany({});
    const productModel = module.get<PaginateModel<ProductSchemaClass>>(
      getModelToken(ProductSchemaClass.name),
    );
    await productModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('create combo flow', () => {
    it('should create combo with valid products and persist to database', async () => {
      const product1 = await createTestProduct({
        name: 'Product 1',
        prices: { retail: 100000 },
      });
      const product2 = await createTestProduct({
        name: 'Product 2',
        prices: { retail: 150000 },
      });

      const createDto = {
        name: 'Test Combo',
        description: 'A test combo',
        items: [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 2 },
        ],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      };

      const combo = await service.create(createDto);

      // Verify returned combo
      expect(combo.id).toBeDefined();
      expect(combo.name).toBe('Test Combo');
      expect(combo.items).toHaveLength(2);
      expect(combo.originalPrice).toBe(100000 + 150000 * 2); // 400000
      expect(combo.discountAmount).toBe(40000); // 10% of 400000
      expect(combo.finalPrice).toBe(360000); // 400000 - 40000

      // Verify persisted to database
      const dbCombo = await comboModel.findById(combo.id);
      expect(dbCombo).not.toBeNull();
      expect(dbCombo?.name).toBe('Test Combo');
    });

    it('should enrich combo items with product details', async () => {
      const product = await createTestProduct({
        name: 'Enriched Product',
        prices: { retail: 200000 },
      });

      const combo = await service.create({
        name: 'Enriched Combo',
        items: [{ productId: product.id, quantity: 1 }],
        discountType: DiscountType.FIXED,
        discountValue: 50000,
      });

      expect(combo.items[0].productName).toBe('Enriched Product');
      expect(combo.items[0].productPrice).toBe(200000);
    });

    it('should reject combo with non-existent products', async () => {
      await expect(
        service.create({
          name: 'Invalid Combo',
          items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1 }],
          discountType: DiscountType.FIXED,
          discountValue: 10000,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject percentage discount over 100', async () => {
      const product = await createTestProduct();

      await expect(
        service.create({
          name: 'Invalid Discount',
          items: [{ productId: product.id, quantity: 1 }],
          discountType: DiscountType.PERCENTAGE,
          discountValue: 150,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject fixed discount exceeding original price', async () => {
      const product = await createTestProduct({ prices: { retail: 50000 } });

      await expect(
        service.create({
          name: 'Invalid Fixed Discount',
          items: [{ productId: product.id, quantity: 1 }],
          discountType: DiscountType.FIXED,
          discountValue: 100000, // More than product price
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findOne flow', () => {
    it('should find combo by id through service and repository', async () => {
      const product = await createTestProduct();
      const created = await service.create({
        name: 'Find Me Combo',
        items: [{ productId: product.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
      });

      const found = await service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Me Combo');
    });

    it('should throw NOT_FOUND when combo does not exist', async () => {
      await expect(
        service.findOne('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll with pagination flow', () => {
    beforeEach(async () => {
      const product = await createTestProduct();
      // Create 15 active and 5 inactive combos
      for (let i = 0; i < 15; i++) {
        await service.create({
          name: `Active Combo ${i}`,
          items: [{ productId: product.id, quantity: 1 }],
          discountType: DiscountType.PERCENTAGE,
          discountValue: 5,
          status: ComboStatus.ACTIVE,
        });
      }
      for (let i = 0; i < 5; i++) {
        await service.create({
          name: `Inactive Combo ${i}`,
          items: [{ productId: product.id, quantity: 1 }],
          discountType: DiscountType.PERCENTAGE,
          discountValue: 5,
          status: ComboStatus.INACTIVE,
        });
      }
    });

    it('should return paginated combos through full stack', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(20);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
    });

    it('should filter by status through full stack', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 20,
        filters: { status: ComboStatus.ACTIVE },
      });

      expect(result.totalDocs).toBe(15);
      result.docs.forEach((combo) => {
        expect(combo.status).toBe(ComboStatus.ACTIVE);
      });
    });

    it('should return correct page through full stack', async () => {
      const page1 = await service.findAll({ page: 1, limit: 10 });
      const page2 = await service.findAll({ page: 2, limit: 10 });

      const page1Ids = page1.docs.map((c) => c.id);
      const page2Ids = page2.docs.map((c) => c.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('update combo flow', () => {
    it('should update combo and persist changes', async () => {
      const product = await createTestProduct();
      const created = await service.create({
        name: 'Original Name',
        items: [{ productId: product.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      const updated = await service.update(created.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');

      // Verify persisted
      const dbCombo = await comboModel.findById(created.id);
      expect(dbCombo?.name).toBe('Updated Name');
    });

    it('should recalculate original price when items change', async () => {
      const product1 = await createTestProduct({ prices: { retail: 100000 } });
      const product2 = await createTestProduct({ prices: { retail: 200000 } });

      const created = await service.create({
        name: 'Price Test Combo',
        items: [{ productId: product1.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      expect(created.originalPrice).toBe(100000);

      const updated = await service.update(created.id, {
        items: [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 2 },
        ],
      });

      expect(updated.originalPrice).toBe(500000); // 100000 + 200000*2
    });

    it('should throw NOT_FOUND when updating non-existent combo', async () => {
      await expect(
        service.update('507f1f77bcf86cd799439011', { name: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should validate discount on update', async () => {
      const product = await createTestProduct({ prices: { retail: 100000 } });
      const created = await service.create({
        name: 'Discount Test',
        items: [{ productId: product.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });

      // Try to update with invalid percentage
      await expect(
        service.update(created.id, { discountValue: 150 }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('delete combo flow', () => {
    it('should soft delete combo', async () => {
      const product = await createTestProduct();
      const created = await service.create({
        name: 'Delete Me',
        items: [{ productId: product.id, quantity: 1 }],
        discountType: DiscountType.FIXED,
        discountValue: 10000,
      });

      await service.remove(created.id);

      // Should not be found via service
      await expect(service.findOne(created.id)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      // But should exist in DB with deletedAt
      const dbCombo = await comboModel.findById(created.id);
      expect(dbCombo).not.toBeNull();
      expect(dbCombo?.deletedAt).toBeDefined();
    });

    it('should throw NOT_FOUND when deleting non-existent combo', async () => {
      await expect(
        service.remove('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findByProductId flow', () => {
    it('should find active combos containing a product', async () => {
      const product1 = await createTestProduct();
      const product2 = await createTestProduct();

      await service.create({
        name: 'Combo with Product 1',
        items: [{ productId: product1.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
        status: ComboStatus.ACTIVE,
      });

      await service.create({
        name: 'Combo with Both Products',
        items: [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 1 },
        ],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        status: ComboStatus.ACTIVE,
      });

      await service.create({
        name: 'Inactive Combo',
        items: [{ productId: product1.id, quantity: 1 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
        status: ComboStatus.INACTIVE,
      });

      const combos = await service.findByProductId(product1.id);

      // Should find 2 active combos (not the inactive one)
      expect(combos).toHaveLength(2);
      combos.forEach((combo) => {
        expect(combo.status).toBe(ComboStatus.ACTIVE);
      });
    });
  });

  describe('discount calculations', () => {
    it('should calculate fixed discount correctly', async () => {
      const product = await createTestProduct({ prices: { retail: 100000 } });

      const combo = await service.create({
        name: 'Fixed Discount Combo',
        items: [{ productId: product.id, quantity: 2 }],
        discountType: DiscountType.FIXED,
        discountValue: 50000,
      });

      expect(combo.originalPrice).toBe(200000);
      expect(combo.discountAmount).toBe(50000);
      expect(combo.finalPrice).toBe(150000);
    });

    it('should calculate percentage discount correctly', async () => {
      const product = await createTestProduct({ prices: { retail: 100000 } });

      const combo = await service.create({
        name: 'Percentage Discount Combo',
        items: [{ productId: product.id, quantity: 3 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 25,
      });

      expect(combo.originalPrice).toBe(300000);
      expect(combo.discountAmount).toBe(75000); // 25% of 300000
      expect(combo.finalPrice).toBe(225000);
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across service and repository', async () => {
      const product = await createTestProduct({ prices: { retail: 150000 } });

      const created = await service.create({
        name: 'Integrity Test Combo',
        description: 'Testing data integrity',
        items: [{ productId: product.id, quantity: 2 }],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        status: ComboStatus.ACTIVE,
      });

      // Via service
      const viaService = await service.findOne(created.id);

      // Via DB
      const viaDb = await comboModel.findById(created.id).lean();

      expect(viaService.name).toBe(viaDb?.name);
      expect(viaService.originalPrice).toBe(viaDb?.originalPrice);
      expect(viaService.discountType).toBe(viaDb?.discountType);
      expect(viaService.discountValue).toBe(viaDb?.discountValue);
    });
  });
});
