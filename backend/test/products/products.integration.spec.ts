import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../src/test/mongo-test.module';
import { ProductsService } from '../../src/products/products.service';
import { ProductDocumentRepository } from '../../src/products/model/product.repository';
import { ProductRepository } from '../../src/products/domain/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../src/products/model/product.schema';
import { ProductStatus } from '../../src/products/domain/product-status.enum';
import { ProductType } from '../../src/products/domain/product-type.enum';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';

/**
 * Integration tests for ProductsService + ProductDocumentRepository
 * Tests the full flow from service through repository to in-memory MongoDB
 */
describe('ProductsService Integration', () => {
  let service: ProductsService;
  let productModel: PaginateModel<ProductSchemaClass>;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockNhanhAuthService = {
    getAccessToken: jest.fn().mockResolvedValue({ businessId: '110668' }),
  };

  const createTestProduct = (
    overrides: Partial<{
      code: string;
      name: string;
      status: ProductStatus;
      type: ProductType;
      prices: { retail: number };
      images: { avatar?: string; others?: string[] };
      category?: { id: string; name: string };
      businessId: string;
      source: 'nhanh' | 'shopify';
      snapshot?: Record<string, any>;
      variants?: any[];
      variantOptions?: Array<{ id: string; name: string; values: string[] }>;
    }> = {},
  ) => {
    const timestamp = Date.now();
    return {
      businessId: '110668',
      source: 'nhanh' as const,
      code: `PROD-${timestamp}`,
      name: `Test Product ${timestamp}`,
      description: 'Test product description',
      prices: { retail: 100000 },
      images: { avatar: 'http://example.com/image.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      ...overrides,
    };
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: ProductSchemaClass.name, schema: ProductSchema },
        ]),
      ],
      providers: [
        ProductsService,
        ProductDocumentRepository,
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: I18nService, useValue: mockI18n },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<PaginateModel<ProductSchemaClass>>(
      getModelToken(ProductSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await productModel.deleteMany({});
    jest.clearAllMocks();
  });

  // Helper to create product directly in DB
  const createProductInDb = async (
    data: ReturnType<typeof createTestProduct>,
  ) => {
    const repository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
    return repository.create(data as any);
  };

  describe('findOne flow', () => {
    it('should find product by id through service and repository', async () => {
      const created = await createProductInDb(createTestProduct());

      const found = await service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should throw NOT_FOUND when product does not exist', async () => {
      await expect(
        service.findOne('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findByCode flow', () => {
    it('should find product by code through full stack', async () => {
      const testProduct = createTestProduct({ code: 'UNIQUE-CODE-123' });
      await createProductInDb(testProduct);

      const found = await service.findByCode('UNIQUE-CODE-123');

      expect(found).toBeDefined();
      expect(found.code).toBe('UNIQUE-CODE-123');
    });

    it('should throw NOT_FOUND for non-existent code', async () => {
      await expect(service.findByCode('NON-EXISTENT')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll with pagination flow', () => {
    beforeEach(async () => {
      // Create 15 active products and 5 inactive
      for (let i = 0; i < 15; i++) {
        await createProductInDb(
          createTestProduct({
            code: `PROD-ACTIVE-${i}`,
            name: `Active Product ${i}`,
            status: ProductStatus.ACTIVE,
            snapshot: { id: i + 1, parentId: -1 }, // standalone products
          }),
        );
      }
      for (let i = 0; i < 5; i++) {
        await createProductInDb(
          createTestProduct({
            code: `PROD-INACTIVE-${i}`,
            name: `Inactive Product ${i}`,
            status: ProductStatus.INACTIVE,
            snapshot: { id: i + 100, parentId: -1 },
          }),
        );
      }
    });

    it('should return paginated products through full stack', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        filters: { businessId: '110668' },
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
        filters: {
          businessId: '110668',
          status: ProductStatus.ACTIVE,
        },
      });

      expect(result.totalDocs).toBe(15);
      result.docs.forEach((product) => {
        expect(product.status).toBe(ProductStatus.ACTIVE);
      });
    });

    it('should use businessId from NhanhAuthService when not provided', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        filters: {},
      });

      expect(mockNhanhAuthService.getAccessToken).toHaveBeenCalled();
    });

    it('should return correct page through full stack', async () => {
      const page1 = await service.findAll({
        page: 1,
        limit: 10,
        filters: { businessId: '110668' },
      });

      const page2 = await service.findAll({
        page: 2,
        limit: 10,
        filters: { businessId: '110668' },
      });

      // Pages should have different products
      const page1Ids = page1.docs.map((p) => p.id);
      const page2Ids = page2.docs.map((p) => p.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('findOneWithVariants flow', () => {
    it('should return product without variants for standalone product', async () => {
      const created = await createProductInDb(
        createTestProduct({
          snapshot: { id: 1, parentId: -1 }, // standalone
        }),
      );

      const result = await service.findOneWithVariants(created.id);

      expect(result.id).toBe(created.id);
      // Standalone products don't have variants
      expect(result.variants).toBeUndefined();
    });

    it('should return product with empty variants when parent has no children', async () => {
      const created = await createProductInDb(
        createTestProduct({
          snapshot: { id: 100, parentId: -2 }, // parent
        }),
      );

      const result = await service.findOneWithVariants(created.id);

      expect(result.id).toBe(created.id);
      // No variants embedded yet (would be embedded during sync)
    });

    it('should return product with embedded variants', async () => {
      // Create parent product with embedded variants (as would be done during sync)
      const parent = await createProductInDb(
        createTestProduct({
          code: 'PARENT-001',
          name: 'Parent Product',
          snapshot: { id: 100, parentId: -2 }, // parent
          variants: [
            {
              id: 'variant-1',
              businessId: '110668',
              source: 'nhanh',
              code: 'CHILD-001',
              name: 'Variant 1',
              prices: { retail: 100000 },
              images: {},
              status: 2,
              attributes: [{ id: 1, name: 'Color', value: 'Red' }],
            },
            {
              id: 'variant-2',
              businessId: '110668',
              source: 'nhanh',
              code: 'CHILD-002',
              name: 'Variant 2',
              prices: { retail: 100000 },
              images: {},
              status: 2,
              attributes: [{ id: 1, name: 'Color', value: 'Blue' }],
            },
          ] as any,
          variantOptions: [{ id: '1', name: 'Color', values: ['Blue', 'Red'] }],
        }),
      );

      const result = await service.findOneWithVariants(parent.id);

      expect(result.id).toBe(parent.id);
      expect(result.variants).toBeDefined();
      expect(result.variants).toHaveLength(2);
      expect(result.variantOptions).toBeDefined();
      expect(result.variantOptions![0].name).toBe('Color');
      expect(result.variantOptions![0].values).toContain('Red');
      expect(result.variantOptions![0].values).toContain('Blue');
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across service and repository', async () => {
      const productData = createTestProduct({
        code: 'INTEGRITY-001',
        name: 'Integrity Test Product',
        prices: { retail: 500000 },
      });

      const created = await createProductInDb(productData);

      // Verify via service
      const viaService = await service.findOne(created.id);

      // Verify via direct DB query
      const viaDb = await productModel.findById(created.id).lean();

      expect(viaService.code).toBe(viaDb?.code);
      expect(viaService.name).toBe(viaDb?.name);
      expect(viaService.prices.retail).toBe(viaDb?.prices?.retail);
    });

    it('should properly map domain entity through all layers', async () => {
      const categoryId = '507f1f77bcf86cd799439011'; // Valid ObjectId
      const created = await createProductInDb(
        createTestProduct({
          code: 'MAPPER-001',
          prices: { retail: 100000 },
          images: {
            avatar: 'http://example.com/avatar.jpg',
            others: ['http://example.com/1.jpg', 'http://example.com/2.jpg'],
          },
          category: { id: categoryId, name: 'Mapped Category' },
        }),
      );

      const found = await service.findOne(created.id);

      // Verify all fields are properly mapped
      expect(found.id).toBeDefined();
      expect(found.code).toBe('MAPPER-001');
      expect(found.prices.retail).toBe(100000);
      expect(found.images.avatar).toBe('http://example.com/avatar.jpg');
      expect(found.images.others).toHaveLength(2);
      expect(found.category?.id).toBe(categoryId);
      expect(found.category?.name).toBe('Mapped Category');
      expect(found.createdAt).toBeInstanceOf(Date);
      expect(found.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics placeholder', () => {
      const stats = service.getStatistics();

      expect(stats).toEqual({
        total: 0,
        byStatus: {},
        bySource: {},
      });
    });
  });
});
