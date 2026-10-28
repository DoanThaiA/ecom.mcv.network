import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { ProductDocumentRepository } from '../../../src/products/model/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../../src/products/model/product.schema';
import { Product } from '../../../src/products/domain/product';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { generateSlug } from '../../../src/utils/slugify';

describe('ProductDocumentRepository', () => {
  let repository: ProductDocumentRepository;
  let productModel: PaginateModel<ProductSchemaClass>;
  let module: TestingModule;

  const createTestProduct = (
    overrides: Partial<Product> = {},
  ): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      businessId: '110668',
      source: 'nhanh' as const,
      code: `PROD-${Date.now()}`,
      barcode: '1234567890',
      name: 'Test Product',
      description: 'Test description',
      prices: {
        retail: 100000,
        wholesale: 90000,
        import: 80000,
      },
      images: {
        avatar: 'http://example.com/image.jpg',
        others: [],
      },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      category: {
        id: '507f1f77bcf86cd799439011',
        name: 'Test Category',
      },
      snapshot: {
        id: Math.floor(Math.random() * 1000000),
        parentId: -2,
        attributes: [],
      },
      ...overrides,
    } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: ProductSchemaClass.name, schema: ProductSchema },
        ]),
      ],
      providers: [ProductDocumentRepository],
    }).compile();

    repository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
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
  });

  describe('create', () => {
    it('should create a product and return domain entity with id', async () => {
      const productData = createTestProduct();

      const result = await repository.create(productData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.code).toBe(productData.code);
      expect(result.name).toBe(productData.name);
      expect(result.businessId).toBe(productData.businessId);
      expect(result.status).toBe(ProductStatus.ACTIVE);
    });

    it('should persist product to database', async () => {
      const productData = createTestProduct();

      const created = await repository.create(productData);
      const found = await productModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.code).toBe(productData.code);
    });

    it('should throw conflict error for duplicate snapshot.id', async () => {
      const snapshotId = 12345;
      const productData1 = createTestProduct({
        snapshot: { id: snapshotId, parentId: -1, attributes: [] },
      });
      const productData2 = createTestProduct({
        code: 'DIFFERENT-CODE',
        snapshot: { id: snapshotId, parentId: -1, attributes: [] },
      });

      await repository.create(productData1);

      await expect(repository.create(productData2)).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      const productData = createTestProduct();
      const created = await repository.create(productData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.code).toBe(productData.code);
    });

    it('should return null when product not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });

    it('should not return soft-deleted products', async () => {
      const created = await repository.create(createTestProduct());
      await repository.remove(created.id);

      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find product by code', async () => {
      const productData = createTestProduct({ code: 'UNIQUE-CODE' });
      await repository.create(productData);

      const found = await repository.findByCode('UNIQUE-CODE');

      expect(found).not.toBeNull();
      expect(found?.code).toBe('UNIQUE-CODE');
    });

    it('should return null when code not found', async () => {
      const found = await repository.findByCode('NON-EXISTENT');

      expect(found).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should find multiple products by ids', async () => {
      const product1 = await repository.create(
        createTestProduct({ code: 'PROD-1' }),
      );
      const product2 = await repository.create(
        createTestProduct({ code: 'PROD-2' }),
      );
      await repository.create(createTestProduct({ code: 'PROD-3' }));

      const found = await repository.findByIds([product1.id, product2.id]);

      expect(found).toHaveLength(2);
      expect(found.map((p) => p.id)).toContain(product1.id);
      expect(found.map((p) => p.id)).toContain(product2.id);
    });

    it('should return empty array when no products found', async () => {
      const found = await repository.findByIds(['507f1f77bcf86cd799439011']);

      expect(found).toEqual([]);
    });
  });

  describe('findBySnapshotId', () => {
    it('should find product by snapshot id and source', async () => {
      const snapshotId = 99999;
      await repository.create(
        createTestProduct({
          snapshot: { id: snapshotId, parentId: -1, attributes: [] },
        }),
      );

      const found = await repository.findBySnapshotId(snapshotId, 'nhanh');

      expect(found).not.toBeNull();
      expect((found?.snapshot as any)?.id).toBe(snapshotId);
    });

    it('should return null for different source', async () => {
      const snapshotId = 99998;
      await repository.create(
        createTestProduct({
          snapshot: { id: snapshotId, parentId: -1, attributes: [] },
        }),
      );

      const found = await repository.findBySnapshotId(snapshotId, 'shopify');

      expect(found).toBeNull();
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 15; i++) {
        await repository.create(
          createTestProduct({
            code: `PROD-${String(i).padStart(3, '0')}`,
            name: `Product ${i}`,
            status: i < 10 ? ProductStatus.ACTIVE : ProductStatus.INACTIVE,
          }),
        );
      }
    });

    it('should return paginated results', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });

    it('should return second page', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 2, limit: 10 },
      });

      expect(result.docs).toHaveLength(5);
      expect(result.page).toBe(2);
      expect(result.hasNextPage).toBe(false);
    });

    it('should filter by status', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { status: ProductStatus.ACTIVE },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(10);
      result.docs.forEach((doc) => {
        expect(doc.status).toBe(ProductStatus.ACTIVE);
      });
    });

    it('should filter by businessId', async () => {
      await repository.create(
        createTestProduct({
          businessId: 'different-business',
          code: 'DIFFERENT-BIZ',
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { businessId: '110668' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(15);
    });

    it('should search by name', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { search: 'Product 1' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBeGreaterThan(0);
    });

    it('should always exclude child variants from listing', async () => {
      // Create a child variant
      await repository.create(
        createTestProduct({
          code: 'CHILD-VARIANT',
          snapshot: { id: 999999, parentId: 12345, attributes: [] },
        }),
      );

      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 50 },
      });

      // All should have parentId = -2 or -1 (child variants are always excluded)
      result.docs.forEach((doc) => {
        const parentId = (doc.snapshot as any)?.parentId;
        expect(
          parentId === -1 || parentId === -2 || parentId === undefined,
        ).toBe(true);
      });
    });

    it('should filter by productIds', async () => {
      const product1 = await repository.create(
        createTestProduct({ code: 'FILTER-ID-1' }),
      );
      const product2 = await repository.create(
        createTestProduct({ code: 'FILTER-ID-2' }),
      );
      await repository.create(createTestProduct({ code: 'FILTER-ID-3' }));

      const result = await repository.findManyWithPagination({
        filterOptions: { productIds: [product1.id, product2.id] },
        paginationOptions: { page: 1, limit: 50 },
      });

      expect(result.totalDocs).toBe(2);
      expect(result.docs.map((p) => p.id)).toContain(product1.id);
      expect(result.docs.map((p) => p.id)).toContain(product2.id);
    });

    it('should filter by minPrice', async () => {
      // Note: beforeEach creates 15 products with retail price 100000
      // Create additional products with different prices
      await repository.create(
        createTestProduct({
          code: 'PRICE-LOW',
          prices: { retail: 50000, wholesale: 45000, import: 40000 },
        }),
      );
      await repository.create(
        createTestProduct({
          code: 'PRICE-HIGH',
          prices: { retail: 200000, wholesale: 180000, import: 150000 },
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { minPrice: 100000 },
        paginationOptions: { page: 1, limit: 50 },
      });

      // Should include 15 products with 100000 + 1 with 200000 = 16
      expect(result.totalDocs).toBe(16);
      result.docs.forEach((doc) => {
        expect(doc.prices.retail).toBeGreaterThanOrEqual(100000);
      });
    });

    it('should filter by maxPrice', async () => {
      // Note: beforeEach creates 15 products with retail price 100000
      await repository.create(
        createTestProduct({
          code: 'PRICE-LOW',
          prices: { retail: 50000, wholesale: 45000, import: 40000 },
        }),
      );
      await repository.create(
        createTestProduct({
          code: 'PRICE-HIGH',
          prices: { retail: 200000, wholesale: 180000, import: 150000 },
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { maxPrice: 100000 },
        paginationOptions: { page: 1, limit: 50 },
      });

      // Should include 15 products with 100000 + 1 with 50000 = 16
      expect(result.totalDocs).toBe(16);
      result.docs.forEach((doc) => {
        expect(doc.prices.retail).toBeLessThanOrEqual(100000);
      });
    });

    it('should filter by price range (minPrice and maxPrice)', async () => {
      // Note: beforeEach creates 15 products with retail price 100000
      await repository.create(
        createTestProduct({
          code: 'PRICE-LOW',
          prices: { retail: 50000, wholesale: 45000, import: 40000 },
        }),
      );
      await repository.create(
        createTestProduct({
          code: 'PRICE-HIGH',
          prices: { retail: 200000, wholesale: 180000, import: 150000 },
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { minPrice: 60000, maxPrice: 150000 },
        paginationOptions: { page: 1, limit: 50 },
      });

      // Should include only 15 products with 100000 (in range 60000-150000)
      expect(result.totalDocs).toBe(15);
      result.docs.forEach((doc) => {
        expect(doc.prices.retail).toBeGreaterThanOrEqual(60000);
        expect(doc.prices.retail).toBeLessThanOrEqual(150000);
      });
    });

    it('should apply sorting', async () => {
      const result = await repository.findManyWithPagination({
        sortOptions: [{ orderBy: 'name', order: 'asc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].name).toBe('Product 0');
    });
  });

  describe('update', () => {
    it('should update product and return updated entity', async () => {
      const created = await repository.create(createTestProduct());

      const updated = await repository.update(created.id, {
        name: 'Updated Name',
        description: 'Updated description',
        images: created.images,
      } as Partial<Product>);

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
    });

    it('should persist updates to database', async () => {
      const created = await repository.create(createTestProduct());

      await repository.update(created.id, {
        name: 'Persisted Name',
        images: created.images,
      } as Partial<Product>);
      const found = await repository.findById(created.id);

      expect(found?.name).toBe('Persisted Name');
    });

    it('should return null when product not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        name: 'Test',
        images: { avatar: null, others: [] },
      } as Partial<Product>);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete product', async () => {
      const created = await repository.create(createTestProduct());

      await repository.remove(created.id);

      // Should not be found via normal query
      const found = await repository.findById(created.id);
      expect(found).toBeNull();

      // But should still exist in database with deletedAt
      const raw = await productModel.findById(created.id);
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeDefined();
    });
  });

  describe('bulkUpsert', () => {
    it('should create multiple products', async () => {
      const products = [
        createTestProduct({ code: 'BULK-1', name: 'Bulk Product 1' }),
        createTestProduct({ code: 'BULK-2', name: 'Bulk Product 2' }),
        createTestProduct({ code: 'BULK-3', name: 'Bulk Product 3' }),
      ];

      const count = await repository.bulkUpsert(products);

      expect(count).toBe(3);

      const all = await productModel.find({});
      expect(all).toHaveLength(3);
    });

    it('should update existing products by snapshot.id', async () => {
      const snapshotId = 88888;
      await repository.create(
        createTestProduct({
          code: 'ORIGINAL',
          name: 'Original Name',
          snapshot: { id: snapshotId, parentId: -1, attributes: [] },
        }),
      );

      await repository.bulkUpsert([
        createTestProduct({
          code: 'UPDATED',
          name: 'Updated Name',
          snapshot: { id: snapshotId, parentId: -1, attributes: [] },
        }),
      ]);

      const all = await productModel.find({});
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe('Updated Name');
    });

    it('should PROPERLY preserve createdAt and update updatedAt on update', async () => {
      const snapshotId = 77777;
      const created = await repository.create(
        createTestProduct({
          code: 'ORIGINAL-TIME',
          name: 'Original Name',
          snapshot: { id: snapshotId, parentId: -1, attributes: [] },
        }),
      );

      // Wait a bit to ensure timestamps would differ
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updateData = createTestProduct({
        code: 'UPDATED-TIME',
        name: 'Updated Name',
        snapshot: { id: snapshotId, parentId: -1, attributes: [] },
      });

      await repository.bulkUpsert([updateData]);

      const updated = await productModel.findById(created.id);

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      // createdAt should MATCH the original creation time
      expect(updated?.createdAt.toISOString()).toBe(
        created.createdAt.toISOString(),
      );
      // updatedAt should be RECENT (greater than original)
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime(),
      );
    });

    it('should return 0 for empty array', async () => {
      const count = await repository.bulkUpsert([]);

      expect(count).toBe(0);
    });

    it('should generate a slug for parent/standalone products on insert', async () => {
      const name = 'Áo Sơ Mi Hoạ Tiết';
      await repository.bulkUpsert([
        createTestProduct({
          code: 'PARENT-SLUG',
          name,
          snapshot: { id: 60001, parentId: -2, attributes: [] },
        }),
      ]);

      const doc = await productModel.findOne({ code: 'PARENT-SLUG' }).lean();
      expect(doc?.slug).toBe(generateSlug(name));
    });

    it('should NOT generate a slug for variant products (parentId > 0)', async () => {
      await repository.bulkUpsert([
        createTestProduct({
          code: 'VARIANT-NO-SLUG',
          name: 'Áo Sơ Mi Hoạ Tiết - L',
          snapshot: { id: 60002, parentId: 60001, attributes: [] },
        }),
      ]);

      const doc = await productModel
        .findOne({ code: 'VARIANT-NO-SLUG' })
        .lean();
      expect(doc?.slug).toBeUndefined();
    });

    it('should not throw on the unique slug index when two variants share a name', async () => {
      // Regression: variants used to receive a name-derived slug, so two
      // distinct variants with the same name collided on the unique
      // { businessId, slug } index (E11000) during Nhanh webhook/bulk sync.
      await productModel.syncIndexes();

      const sharedName = 'Sơ Mi Hoạ Tiết Tay Dài Rêu L';
      const variantA = createTestProduct({
        code: 'VARIANT-DUP-A',
        name: sharedName,
        snapshot: { id: 60010, parentId: 50001, attributes: [] },
      });
      const variantB = createTestProduct({
        code: 'VARIANT-DUP-B',
        name: sharedName,
        snapshot: { id: 60011, parentId: 50002, attributes: [] },
      });

      await expect(repository.bulkUpsert([variantA, variantB])).resolves.toBe(
        2,
      );

      const docs = await productModel
        .find({ code: { $in: ['VARIANT-DUP-A', 'VARIANT-DUP-B'] } })
        .lean();
      expect(docs).toHaveLength(2);
      docs.forEach((doc) => expect(doc.slug).toBeUndefined());
    });
  });

  describe('findVariantsByParentSnapshotId', () => {
    it('should find child variants by parent snapshot id', async () => {
      const parentSnapshotId = 11111;

      // Create parent
      await repository.create(
        createTestProduct({
          code: 'PARENT',
          snapshot: { id: parentSnapshotId, parentId: -2, attributes: [] },
        }),
      );

      // Create children
      await repository.create(
        createTestProduct({
          code: 'CHILD-1',
          snapshot: { id: 22222, parentId: parentSnapshotId, attributes: [] },
        }),
      );
      await repository.create(
        createTestProduct({
          code: 'CHILD-2',
          snapshot: { id: 33333, parentId: parentSnapshotId, attributes: [] },
        }),
      );

      const variants = await repository.findVariantsByParentSnapshotId(
        '110668',
        'nhanh',
        parentSnapshotId,
      );

      expect(variants).toHaveLength(2);
      expect(variants.map((v) => v.code)).toContain('CHILD-1');
      expect(variants.map((v) => v.code)).toContain('CHILD-2');
    });

    it('should return empty array when no variants found', async () => {
      const variants = await repository.findVariantsByParentSnapshotId(
        '110668',
        'nhanh',
        99999,
      );

      expect(variants).toEqual([]);
    });
  });

  describe('updateDescriptionContent', () => {
    it('should update description and content', async () => {
      const created = await repository.create(createTestProduct());

      await repository.updateDescriptionContent(
        created.id,
        'New description',
        '<p>New content</p>',
      );

      const found = await repository.findById(created.id);
      expect(found?.description).toBe('New description');
      expect(found?.content).toBe('<p>New content</p>');
    });

    it('should update only description when content not provided', async () => {
      const created = await repository.create(
        createTestProduct({ content: 'Original content' }),
      );

      await repository.updateDescriptionContent(created.id, 'New description');

      const found = await repository.findById(created.id);
      expect(found?.description).toBe('New description');
    });
  });
});
