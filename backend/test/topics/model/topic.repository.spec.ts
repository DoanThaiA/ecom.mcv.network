import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { TopicDocumentRepository } from '../../../src/topics/model/topic.repository';
import {
  TopicSchemaClass,
  TopicSchema,
} from '../../../src/topics/model/topic.schema';
import { Topic, TopicProduct } from '../../../src/topics/domain/topic';
import { TopicStatus } from '../../../src/topics/domain/topic-status.enum';

describe('TopicDocumentRepository', () => {
  let repository: TopicDocumentRepository;
  let topicModel: PaginateModel<TopicSchemaClass>;
  let module: TestingModule;

  const createTestTopic = (
    overrides: Partial<Topic> = {},
  ): Omit<Topic, 'id' | 'createdAt' | 'updatedAt'> => {
    const timestamp = Date.now();
    return {
      businessId: '110668',
      name: `Test Topic ${timestamp}`,
      slug: `test-topic-${timestamp}`,
      description: 'Test topic description',
      image: 'http://example.com/topic.jpg',
      order: 0,
      status: TopicStatus.ACTIVE,
      products: [],
      deletedAt: null,
      ...overrides,
    } as Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: TopicSchemaClass.name, schema: TopicSchema },
        ]),
      ],
      providers: [TopicDocumentRepository],
    }).compile();

    repository = module.get<TopicDocumentRepository>(TopicDocumentRepository);
    topicModel = module.get<PaginateModel<TopicSchemaClass>>(
      getModelToken(TopicSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await topicModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a topic and return domain entity with id', async () => {
      const topicData = createTestTopic();

      const result = await repository.create(topicData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(topicData.name);
      expect(result.slug).toBe(topicData.slug);
      expect(result.status).toBe(TopicStatus.ACTIVE);
    });

    it('should persist topic to database', async () => {
      const topicData = createTestTopic();

      const created = await repository.create(topicData);
      const found = await topicModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.name).toBe(topicData.name);
    });
  });

  describe('findById', () => {
    it('should find topic by id', async () => {
      const topicData = createTestTopic();
      const created = await repository.create(topicData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(topicData.name);
    });

    it('should return null when topic not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });

    it('should not return soft-deleted topics', async () => {
      const created = await repository.create(createTestTopic());
      await repository.remove(created.id);

      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find topic by slug and businessId', async () => {
      const topicData = createTestTopic({ slug: 'unique-slug' });
      await repository.create(topicData);

      const found = await repository.findBySlug('110668', 'unique-slug');

      expect(found).not.toBeNull();
      expect(found?.slug).toBe('unique-slug');
    });

    it('should return null for different businessId', async () => {
      const topicData = createTestTopic({ slug: 'test-slug' });
      await repository.create(topicData);

      const found = await repository.findBySlug(
        'different-business',
        'test-slug',
      );

      expect(found).toBeNull();
    });

    it('should return null for non-existent slug', async () => {
      const found = await repository.findBySlug('110668', 'non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findActiveByBusinessId', () => {
    it('should return active topics ordered by order field', async () => {
      await repository.create(
        createTestTopic({ name: 'Topic 3', order: 3, slug: 'topic-3' }),
      );
      await repository.create(
        createTestTopic({ name: 'Topic 1', order: 1, slug: 'topic-1' }),
      );
      await repository.create(
        createTestTopic({ name: 'Topic 2', order: 2, slug: 'topic-2' }),
      );

      const found = await repository.findActiveByBusinessId('110668');

      expect(found).toHaveLength(3);
      expect(found[0].order).toBe(1);
      expect(found[1].order).toBe(2);
      expect(found[2].order).toBe(3);
    });

    it('should not return inactive topics', async () => {
      await repository.create(createTestTopic({ status: TopicStatus.ACTIVE }));
      await repository.create(
        createTestTopic({ status: TopicStatus.INACTIVE, slug: 'inactive' }),
      );

      const found = await repository.findActiveByBusinessId('110668');

      expect(found).toHaveLength(1);
      expect(found[0].status).toBe(TopicStatus.ACTIVE);
    });
  });

  describe('findByProductId', () => {
    it('should find topics containing a product', async () => {
      const productId = '507f1f77bcf86cd799439099';
      await repository.create(
        createTestTopic({
          name: 'Topic with product',
          slug: 'with-product',
          products: [{ productId, order: 0 }],
        }),
      );
      await repository.create(
        createTestTopic({
          name: 'Topic without product',
          slug: 'without-product',
          products: [],
        }),
      );

      const found = await repository.findByProductId(productId);

      expect(found).toHaveLength(1);
      expect(found[0].name).toBe('Topic with product');
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 15; i++) {
        await repository.create(
          createTestTopic({
            name: `Topic ${i}`,
            slug: `topic-${i}`,
            order: i,
            status: i < 10 ? TopicStatus.ACTIVE : TopicStatus.INACTIVE,
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

    it('should filter by status', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { status: TopicStatus.ACTIVE },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(10);
    });

    it('should filter by businessId', async () => {
      await repository.create(
        createTestTopic({
          businessId: 'other-business',
          slug: 'other-slug',
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
        filterOptions: { search: 'Topic 1' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBeGreaterThan(0);
    });

    it('should sort by order by default', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].order).toBe(0);
      expect(result.docs[1].order).toBe(1);
    });
  });

  describe('update', () => {
    it('should update topic and return updated entity', async () => {
      const created = await repository.create(createTestTopic());

      const updated = await repository.update(created.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
    });

    it('should update status', async () => {
      const created = await repository.create(createTestTopic());

      const updated = await repository.update(created.id, {
        status: TopicStatus.INACTIVE,
      });

      expect(updated?.status).toBe(TopicStatus.INACTIVE);
    });

    it('should return null when topic not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        name: 'Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('addProducts', () => {
    it('should add products to topic', async () => {
      const created = await repository.create(
        createTestTopic({ products: [] }),
      );

      const products: TopicProduct[] = [
        { productId: '507f1f77bcf86cd799439001', order: 0 },
        { productId: '507f1f77bcf86cd799439002', order: 1 },
      ];

      const updated = await repository.addProducts(created.id, products);

      expect(updated?.products).toHaveLength(2);
    });
  });

  describe('removeProducts', () => {
    it('should remove products from topic', async () => {
      const productId1 = '507f1f77bcf86cd799439001';
      const productId2 = '507f1f77bcf86cd799439002';

      const created = await repository.create(
        createTestTopic({
          products: [
            { productId: productId1, order: 0 },
            { productId: productId2, order: 1 },
          ],
        }),
      );

      const updated = await repository.removeProducts(created.id, [productId1]);

      expect(updated?.products).toHaveLength(1);
      expect(updated?.products[0].productId).toBe(productId2);
    });
  });

  describe('reorderProducts', () => {
    it('should replace products with new order', async () => {
      const created = await repository.create(
        createTestTopic({
          products: [
            { productId: '507f1f77bcf86cd799439001', order: 0 },
            { productId: '507f1f77bcf86cd799439002', order: 1 },
          ],
        }),
      );

      const newOrder: TopicProduct[] = [
        { productId: '507f1f77bcf86cd799439002', order: 0 },
        { productId: '507f1f77bcf86cd799439001', order: 1 },
      ];

      const updated = await repository.reorderProducts(created.id, newOrder);

      expect(updated?.products[0].productId).toBe('507f1f77bcf86cd799439002');
      expect(updated?.products[1].productId).toBe('507f1f77bcf86cd799439001');
    });
  });

  describe('bulkUpdateOrder', () => {
    it('should update order for multiple topics', async () => {
      const topic1 = await repository.create(
        createTestTopic({ order: 0, slug: 'topic-a' }),
      );
      const topic2 = await repository.create(
        createTestTopic({ order: 1, slug: 'topic-b' }),
      );

      await repository.bulkUpdateOrder([
        { id: topic1.id, order: 5 },
        { id: topic2.id, order: 10 },
      ]);

      const found1 = await repository.findById(topic1.id);
      const found2 = await repository.findById(topic2.id);

      expect(found1?.order).toBe(5);
      expect(found2?.order).toBe(10);
    });
  });

  describe('remove', () => {
    it('should soft delete topic', async () => {
      const created = await repository.create(createTestTopic());

      await repository.remove(created.id);

      // Should not be found via normal query
      const found = await repository.findById(created.id);
      expect(found).toBeNull();

      // But should still exist in database with deletedAt
      const raw = await topicModel.findById(created.id);
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeDefined();
    });
  });

  describe('unique slug constraint', () => {
    it('should enforce unique slug per business', async () => {
      await repository.create(createTestTopic({ slug: 'unique-slug' }));

      await expect(
        repository.create(createTestTopic({ slug: 'unique-slug' })),
      ).rejects.toThrow();
    });

    it('should allow same slug in different business', async () => {
      await repository.create(
        createTestTopic({ businessId: 'business-1', slug: 'same-slug' }),
      );

      await expect(
        repository.create(
          createTestTopic({ businessId: 'business-2', slug: 'same-slug' }),
        ),
      ).resolves.toBeDefined();
    });
  });
});
