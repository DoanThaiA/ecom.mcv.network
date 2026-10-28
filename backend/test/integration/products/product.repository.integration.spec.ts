import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductDocumentModule } from '../../../src/products/model/product-document.module';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { createTestingDatabase } from '../../helpers/mongodb.helper';

/**
 * Integration-level guard for the two product-repository methods used by
 * the recommendation service. Both must exclude child variant docs
 * (snapshot.parentId > 0) or the shop storefront leaks variant SKUs
 * through the "Gợi ý sản phẩm" section.
 */
describe('ProductRepository parent-only query filter', () => {
  let module: TestingModule;
  let productRepository: ProductRepository;
  let closeDatabase: () => Promise<void>;
  let clearDatabase: (module: TestingModule) => Promise<void>;

  const categoryId = new Types.ObjectId();
  const parentId = new Types.ObjectId().toString();
  const standaloneId = new Types.ObjectId().toString();
  const variantId = new Types.ObjectId().toString();
  const missingParentIdDocId = new Types.ObjectId().toString();

  const baseDoc = {
    businessId: '110668',
    source: 'nhanh',
    status: ProductStatus.ACTIVE,
    deletedAt: null,
    type: 'regular',
    prices: { retail: 100000 },
    category: { id: categoryId, name: 'Test' },
    reviewStats: { reviewCount: 1, averageRating: 5 },
  };

  beforeAll(async () => {
    const db = await createTestingDatabase();
    closeDatabase = db.closeDatabase;
    clearDatabase = db.clearDatabase;

    module = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(db.uri), ProductDocumentModule],
    }).compile();

    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  afterAll(async () => {
    await module.close();
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase(module);
    const model = module.get<any>('ProductSchemaClassModel');

    await model.insertMany([
      {
        ...baseDoc,
        _id: parentId,
        code: 'PARENT',
        name: 'Parent product',
        snapshot: { id: 100, parentId: -2 },
      },
      {
        ...baseDoc,
        _id: standaloneId,
        code: 'STANDALONE',
        name: 'Standalone product',
        snapshot: { id: 200, parentId: -1 },
      },
      {
        ...baseDoc,
        _id: variantId,
        code: 'PARENT-Red-S',
        name: 'Variant child (Red-S)',
        snapshot: { id: 101, parentId: 100 },
      },
      {
        ...baseDoc,
        _id: missingParentIdDocId,
        code: 'NO-PARENTID',
        name: 'Legacy doc without parentId field',
        snapshot: { id: 300 },
      },
    ]);
  });

  describe('findActiveByIds', () => {
    it('should return parent, standalone, and legacy docs but exclude variant children', async () => {
      const result = await productRepository.findActiveByIds([
        parentId,
        standaloneId,
        variantId,
        missingParentIdDocId,
      ]);

      const ids = result.map((p) => p.id).sort();
      expect(ids).toEqual(
        [parentId, standaloneId, missingParentIdDocId].sort(),
      );
      expect(ids).not.toContain(variantId);
    });

    it('should return empty array when given only variant IDs', async () => {
      const result = await productRepository.findActiveByIds([variantId]);
      expect(result).toEqual([]);
    });
  });

  describe('findPopularByCategories', () => {
    it('should exclude variant children from category-based popular lookup', async () => {
      const result = await productRepository.findPopularByCategories(
        [categoryId.toString()],
        [],
        10,
      );

      const ids = result.map((p) => p.id);
      expect(ids).toContain(parentId);
      expect(ids).toContain(standaloneId);
      expect(ids).toContain(missingParentIdDocId);
      expect(ids).not.toContain(variantId);
    });
  });
});
