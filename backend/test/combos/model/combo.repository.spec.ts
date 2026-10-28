import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { ComboDocumentRepository } from '../../../src/combos/model/combo.repository';
import {
  ComboSchemaClass,
  ComboSchema,
} from '../../../src/combos/model/combo.schema';
import { Combo } from '../../../src/combos/domain/combo';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

describe('ComboDocumentRepository', () => {
  let repository: ComboDocumentRepository;
  let comboModel: PaginateModel<ComboSchemaClass>;
  let module: TestingModule;

  const createTestCombo = (
    overrides: Partial<Combo> = {},
  ): Omit<Combo, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      name: `Test Combo ${Date.now()}`,
      description: 'Test combo description',
      image: 'http://example.com/combo.jpg',
      items: [
        { productId: '507f1f77bcf86cd799439011', quantity: 2 },
        { productId: '507f1f77bcf86cd799439012', quantity: 1 },
      ],
      discountType: DiscountType.FIXED,
      discountValue: 50000,
      originalPrice: 300000,
      status: ComboStatus.ACTIVE,
      validFrom: null,
      validTo: null,
      deletedAt: null,
      ...overrides,
    } as Omit<Combo, 'id' | 'createdAt' | 'updatedAt'>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: ComboSchemaClass.name, schema: ComboSchema },
        ]),
      ],
      providers: [ComboDocumentRepository],
    }).compile();

    repository = module.get<ComboDocumentRepository>(ComboDocumentRepository);
    comboModel = module.get<PaginateModel<ComboSchemaClass>>(
      getModelToken(ComboSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await comboModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a combo and return domain entity with id', async () => {
      const comboData = createTestCombo();

      const result = await repository.create(comboData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(comboData.name);
      expect(result.discountType).toBe(DiscountType.FIXED);
      expect(result.discountValue).toBe(50000);
      expect(result.items).toHaveLength(2);
    });

    it('should persist combo to database', async () => {
      const comboData = createTestCombo();

      const created = await repository.create(comboData);
      const found = await comboModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.name).toBe(comboData.name);
    });
  });

  describe('findById', () => {
    it('should find combo by id', async () => {
      const comboData = createTestCombo();
      const created = await repository.create(comboData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(comboData.name);
    });

    it('should return null when combo not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });

    it('should not return soft-deleted combos', async () => {
      const created = await repository.create(createTestCombo());
      await repository.remove(created.id);

      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should find multiple combos by ids', async () => {
      const combo1 = await repository.create(
        createTestCombo({ name: 'Combo 1' }),
      );
      const combo2 = await repository.create(
        createTestCombo({ name: 'Combo 2' }),
      );
      await repository.create(createTestCombo({ name: 'Combo 3' }));

      const found = await repository.findByIds([combo1.id, combo2.id]);

      expect(found).toHaveLength(2);
      expect(found.map((c) => c.id)).toContain(combo1.id);
      expect(found.map((c) => c.id)).toContain(combo2.id);
    });

    it('should return empty array when no combos found', async () => {
      const found = await repository.findByIds(['507f1f77bcf86cd799439011']);

      expect(found).toEqual([]);
    });
  });

  describe('findActiveByProductId', () => {
    it('should find active combos containing a product', async () => {
      const productId = '507f1f77bcf86cd799439099';
      await repository.create(
        createTestCombo({
          name: 'Combo with product',
          items: [{ productId, quantity: 1 }],
          status: ComboStatus.ACTIVE,
        }),
      );
      await repository.create(
        createTestCombo({
          name: 'Combo without product',
          items: [{ productId: '507f1f77bcf86cd799439088', quantity: 1 }],
        }),
      );

      const found = await repository.findActiveByProductId(productId);

      expect(found).toHaveLength(1);
      expect(found[0].name).toBe('Combo with product');
    });

    it('should not return inactive combos', async () => {
      const productId = '507f1f77bcf86cd799439099';
      await repository.create(
        createTestCombo({
          items: [{ productId, quantity: 1 }],
          status: ComboStatus.INACTIVE,
        }),
      );

      const found = await repository.findActiveByProductId(productId);

      expect(found).toHaveLength(0);
    });

    it('should not return expired combos', async () => {
      const productId = '507f1f77bcf86cd799439099';
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await repository.create(
        createTestCombo({
          items: [{ productId, quantity: 1 }],
          status: ComboStatus.ACTIVE,
          validTo: yesterday,
        }),
      );

      const found = await repository.findActiveByProductId(productId);

      expect(found).toHaveLength(0);
    });

    it('should not return future combos', async () => {
      const productId = '507f1f77bcf86cd799439099';
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await repository.create(
        createTestCombo({
          items: [{ productId, quantity: 1 }],
          status: ComboStatus.ACTIVE,
          validFrom: tomorrow,
        }),
      );

      const found = await repository.findActiveByProductId(productId);

      expect(found).toHaveLength(0);
    });
  });

  describe('findActiveByProductIds', () => {
    it('should find active combos containing any of the products', async () => {
      const productId1 = '507f1f77bcf86cd799439001';
      const productId2 = '507f1f77bcf86cd799439002';

      await repository.create(
        createTestCombo({
          name: 'Combo 1',
          items: [{ productId: productId1, quantity: 1 }],
        }),
      );
      await repository.create(
        createTestCombo({
          name: 'Combo 2',
          items: [{ productId: productId2, quantity: 1 }],
        }),
      );
      await repository.create(
        createTestCombo({
          name: 'Combo 3',
          items: [{ productId: '507f1f77bcf86cd799439003', quantity: 1 }],
        }),
      );

      const found = await repository.findActiveByProductIds([
        productId1,
        productId2,
      ]);

      expect(found).toHaveLength(2);
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 15; i++) {
        await repository.create(
          createTestCombo({
            name: `Combo ${i}`,
            status: i < 10 ? ComboStatus.ACTIVE : ComboStatus.INACTIVE,
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
        filterOptions: { status: ComboStatus.ACTIVE },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(10);
      result.docs.forEach((doc) => {
        expect(doc.status).toBe(ComboStatus.ACTIVE);
      });
    });

    it('should search by name', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { search: 'Combo 1' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBeGreaterThan(0);
    });

    it('should filter by product id', async () => {
      const productId = '507f1f77bcf86cd799439099';
      await repository.create(
        createTestCombo({
          name: 'Special Combo',
          items: [{ productId, quantity: 1 }],
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { productId },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].name).toBe('Special Combo');
    });

    it('should apply sorting', async () => {
      const result = await repository.findManyWithPagination({
        sortOptions: [{ orderBy: 'name', order: 'asc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].name).toBe('Combo 0');
    });
  });

  describe('update', () => {
    it('should update combo and return updated entity', async () => {
      const created = await repository.create(createTestCombo());

      const updated = await repository.update(created.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
    });

    it('should update discount settings', async () => {
      const created = await repository.create(createTestCombo());

      const updated = await repository.update(created.id, {
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
      });

      expect(updated?.discountType).toBe(DiscountType.PERCENTAGE);
      expect(updated?.discountValue).toBe(20);
    });

    it('should update items', async () => {
      const created = await repository.create(createTestCombo());

      const updated = await repository.update(created.id, {
        items: [{ productId: '507f1f77bcf86cd799439099', quantity: 5 }],
      });

      expect(updated?.items).toHaveLength(1);
      expect(updated?.items[0].quantity).toBe(5);
    });

    it('should return null when combo not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        name: 'Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete combo', async () => {
      const created = await repository.create(createTestCombo());

      await repository.remove(created.id);

      // Should not be found via normal query
      const found = await repository.findById(created.id);
      expect(found).toBeNull();

      // But should still exist in database with deletedAt
      const raw = await comboModel.findById(created.id);
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeDefined();
    });
  });

  describe('discount types', () => {
    it('should handle fixed discount', async () => {
      const combo = await repository.create(
        createTestCombo({
          discountType: DiscountType.FIXED,
          discountValue: 100000,
          originalPrice: 500000,
        }),
      );

      expect(combo.discountType).toBe(DiscountType.FIXED);
      expect(combo.discountValue).toBe(100000);
    });

    it('should handle percentage discount', async () => {
      const combo = await repository.create(
        createTestCombo({
          discountType: DiscountType.PERCENTAGE,
          discountValue: 25,
          originalPrice: 400000,
        }),
      );

      expect(combo.discountType).toBe(DiscountType.PERCENTAGE);
      expect(combo.discountValue).toBe(25);
    });
  });

  describe('validity dates', () => {
    it('should store validFrom and validTo dates', async () => {
      const validFrom = new Date('2025-01-01');
      const validTo = new Date('2025-12-31');

      const combo = await repository.create(
        createTestCombo({
          validFrom,
          validTo,
        }),
      );

      expect(combo.validFrom).toEqual(validFrom);
      expect(combo.validTo).toEqual(validTo);
    });

    it('should handle null validity dates', async () => {
      const combo = await repository.create(
        createTestCombo({
          validFrom: null,
          validTo: null,
        }),
      );

      expect(combo.validFrom).toBeNull();
      expect(combo.validTo).toBeNull();
    });
  });
});
