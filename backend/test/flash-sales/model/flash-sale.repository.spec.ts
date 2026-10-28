import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { FlashSaleDocumentRepository } from '../../../src/flash-sales/model/flash-sale.repository';
import {
  FlashSaleSchemaClass,
  FlashSaleSchema,
} from '../../../src/flash-sales/model/flash-sale.schema';
import { FlashSale } from '../../../src/flash-sales/domain/flash-sale';
import { FlashSaleStatus } from '../../../src/flash-sales/domain/flash-sale-status.enum';

describe('FlashSaleDocumentRepository', () => {
  let repository: FlashSaleDocumentRepository;
  let flashSaleModel: PaginateModel<FlashSaleSchemaClass>;
  let module: TestingModule;

  const createTestFlashSale = (
    overrides: Partial<FlashSale> = {},
  ): Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'> => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      name: `Flash Sale ${Date.now()}`,
      startTime: oneHourAgo,
      endTime: oneHourLater,
      isEnabled: true,
      deletedAt: null,
      ...overrides,
    } as Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
        ]),
      ],
      providers: [FlashSaleDocumentRepository],
    }).compile();

    repository = module.get<FlashSaleDocumentRepository>(
      FlashSaleDocumentRepository,
    );
    flashSaleModel = module.get<PaginateModel<FlashSaleSchemaClass>>(
      getModelToken(FlashSaleSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await flashSaleModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a flash sale and return domain entity with id', async () => {
      const flashSaleData = createTestFlashSale();

      const result = await repository.create(flashSaleData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(flashSaleData.name);
      expect(result.isEnabled).toBe(true);
    });

    it('should persist flash sale to database', async () => {
      const flashSaleData = createTestFlashSale();

      const created = await repository.create(flashSaleData);
      const found = await flashSaleModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.name).toBe(flashSaleData.name);
    });
  });

  describe('findById', () => {
    it('should find flash sale by id', async () => {
      const flashSaleData = createTestFlashSale();
      const created = await repository.create(flashSaleData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(flashSaleData.name);
    });

    it('should return null when flash sale not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });

    it('should not return soft-deleted flash sales', async () => {
      const created = await repository.create(createTestFlashSale());
      await repository.remove(created.id);

      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      const now = new Date();
      for (let i = 0; i < 15; i++) {
        const startOffset = i < 5 ? -60 * 60 * 1000 : 60 * 60 * 1000;
        const endOffset = i < 10 ? 60 * 60 * 1000 : -60 * 60 * 1000;

        await repository.create(
          createTestFlashSale({
            name: `Flash Sale ${i}`,
            startTime: new Date(now.getTime() + startOffset),
            endTime: new Date(now.getTime() + endOffset),
            isEnabled: i < 12,
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

    it('should filter by ACTIVE status', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { status: FlashSaleStatus.ACTIVE },
        paginationOptions: { page: 1, limit: 20 },
      });

      result.docs.forEach((doc) => {
        expect(doc.isEnabled).toBe(true);
        expect(new Date(doc.startTime).getTime()).toBeLessThanOrEqual(
          Date.now(),
        );
        expect(new Date(doc.endTime).getTime()).toBeGreaterThanOrEqual(
          Date.now(),
        );
      });
    });

    it('should filter by DISABLED status', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { status: FlashSaleStatus.DISABLED },
        paginationOptions: { page: 1, limit: 20 },
      });

      result.docs.forEach((doc) => {
        expect(doc.isEnabled).toBe(false);
      });
    });

    it('should search by name', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { search: 'Flash Sale 1' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBeGreaterThan(0);
    });

    it('should apply sorting', async () => {
      const result = await repository.findManyWithPagination({
        sortOptions: [{ orderBy: 'name', order: 'asc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].name).toBe('Flash Sale 0');
    });
  });

  describe('update', () => {
    it('should update flash sale and return updated entity', async () => {
      const created = await repository.create(createTestFlashSale());

      const updated = await repository.update(created.id, {
        name: 'Updated Name',
        isEnabled: false,
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.isEnabled).toBe(false);
    });

    it('should update time range', async () => {
      const created = await repository.create(createTestFlashSale());
      const newStart = new Date('2025-06-01');
      const newEnd = new Date('2025-06-30');

      const updated = await repository.update(created.id, {
        startTime: newStart,
        endTime: newEnd,
      });

      expect(updated?.startTime).toEqual(newStart);
      expect(updated?.endTime).toEqual(newEnd);
    });

    it('should return null when flash sale not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        name: 'Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete flash sale', async () => {
      const created = await repository.create(createTestFlashSale());

      await repository.remove(created.id);

      // Should not be found via normal query
      const found = await repository.findById(created.id);
      expect(found).toBeNull();

      // But should still exist in database with deletedAt
      const raw = await flashSaleModel.findById(created.id);
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeDefined();
    });
  });
});
