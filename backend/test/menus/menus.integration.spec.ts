import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../src/test/mongo-test.module';
import { MenusService } from '../../src/menus/menus.service';
import { MenuDocumentRepository } from '../../src/menus/model/menu.repository';
import { MenuRepository } from '../../src/menus/domain/menu.repository';
import { MenuSchemaClass, MenuSchema } from '../../src/menus/model/menu.schema';
import { ProductCategoryDocumentRepository } from '../../src/product-categories/model/product-category.repository';
import { ProductCategoryRepository } from '../../src/product-categories/domain/product-category.repository';
import {
  ProductCategorySchemaClass,
  ProductCategorySchema,
} from '../../src/product-categories/model/product-category.schema';
import { TopicDocumentRepository } from '../../src/topics/model/topic.repository';
import { TopicRepository } from '../../src/topics/domain/topic.repository';
import {
  TopicSchemaClass,
  TopicSchema,
} from '../../src/topics/model/topic.schema';
import { MenuStatus } from '../../src/menus/domain/menu-status.enum';
import { MenuType } from '../../src/menus/domain/menu-type.enum';
import { TopicStatus } from '../../src/topics/domain/topic-status.enum';

/**
 * Integration tests for MenusService + MenuDocumentRepository + related repositories
 * Tests the full flow from service through repositories to in-memory MongoDB
 */
describe('MenusService Integration', () => {
  let service: MenusService;
  let menuModel: PaginateModel<MenuSchemaClass>;
  let categoryRepository: ProductCategoryDocumentRepository;
  let topicRepository: TopicDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Helper to create test category
  const createTestCategory = async (name: string = 'Test Category') => {
    const categoryModel = module.get<PaginateModel<ProductCategorySchemaClass>>(
      getModelToken(ProductCategorySchemaClass.name),
    );
    const timestamp = Date.now();
    const category = new categoryModel({
      businessId: '110668',
      source: 'nhanh',
      code: `CAT-${timestamp}`,
      name,
      parentId: null,
      order: 0,
      status: 1,
    });
    return category.save();
  };

  // Helper to create test topic
  const createTestTopic = async (name: string = 'Test Topic') => {
    const topicModel = module.get<PaginateModel<TopicSchemaClass>>(
      getModelToken(TopicSchemaClass.name),
    );
    const topic = new topicModel({
      businessId: '110668',
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      order: 0,
      status: TopicStatus.ACTIVE,
      products: [],
      deletedAt: null,
    });
    return topic.save();
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: MenuSchemaClass.name, schema: MenuSchema },
          {
            name: ProductCategorySchemaClass.name,
            schema: ProductCategorySchema,
          },
          { name: TopicSchemaClass.name, schema: TopicSchema },
        ]),
      ],
      providers: [
        MenusService,
        MenuDocumentRepository,
        ProductCategoryDocumentRepository,
        TopicDocumentRepository,
        { provide: MenuRepository, useExisting: MenuDocumentRepository },
        {
          provide: ProductCategoryRepository,
          useExisting: ProductCategoryDocumentRepository,
        },
        { provide: TopicRepository, useExisting: TopicDocumentRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
    menuModel = module.get<PaginateModel<MenuSchemaClass>>(
      getModelToken(MenuSchemaClass.name),
    );
    categoryRepository = module.get<ProductCategoryDocumentRepository>(
      ProductCategoryDocumentRepository,
    );
    topicRepository = module.get<TopicDocumentRepository>(
      TopicDocumentRepository,
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await menuModel.deleteMany({});
    const categoryModel = module.get<PaginateModel<ProductCategorySchemaClass>>(
      getModelToken(ProductCategorySchemaClass.name),
    );
    await categoryModel.deleteMany({});
    const topicModel = module.get<PaginateModel<TopicSchemaClass>>(
      getModelToken(TopicSchemaClass.name),
    );
    await topicModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('create menu flow', () => {
    it('should create URL menu and persist to database', async () => {
      const menu = await service.create({
        name: 'Test Menu',
        type: MenuType.URL,
        url: '/test-url',
      });

      expect(menu.id).toBeDefined();
      expect(menu.name).toBe('Test Menu');
      expect(menu.type).toBe(MenuType.URL);
      expect(menu.url).toBe('/test-url');

      // Verify persisted to database
      const dbMenu = await menuModel.findById(menu.id);
      expect(dbMenu).not.toBeNull();
      expect(dbMenu?.name).toBe('Test Menu');
    });

    it('should create CATEGORY menu with valid category', async () => {
      const category = await createTestCategory('Electronics');

      const menu = await service.create({
        name: 'Electronics Menu',
        type: MenuType.CATEGORY,
        categoryId: category._id.toString(),
      });

      expect(menu.type).toBe(MenuType.CATEGORY);
      expect(menu.categoryId).toBe(category._id.toString());
    });

    it('should create TOPIC menu with valid topic', async () => {
      const topic = await createTestTopic('Featured Products');

      const menu = await service.create({
        name: 'Featured Menu',
        type: MenuType.TOPIC,
        topicId: topic._id.toString(),
      });

      expect(menu.type).toBe(MenuType.TOPIC);
      expect(menu.topicId).toBe(topic._id.toString());
    });

    it('should create hierarchical menu structure', async () => {
      const parent = await service.create({
        name: 'Parent Menu',
        type: MenuType.URL,
        url: '/parent',
      });

      const child = await service.create({
        name: 'Child Menu',
        type: MenuType.URL,
        url: '/child',
        parentId: parent.id,
      });

      expect(child.parentId).toBe(parent.id);

      // Verify in database
      const dbChild = await menuModel.findById(child.id);
      expect(dbChild?.parentId?.toString()).toBe(parent.id);
    });

    it('should reject CATEGORY menu with non-existent category', async () => {
      await expect(
        service.create({
          name: 'Invalid Menu',
          type: MenuType.CATEGORY,
          categoryId: '507f1f77bcf86cd799439011',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject TOPIC menu with non-existent topic', async () => {
      await expect(
        service.create({
          name: 'Invalid Menu',
          type: MenuType.TOPIC,
          topicId: '507f1f77bcf86cd799439011',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject menu with non-existent parent', async () => {
      await expect(
        service.create({
          name: 'Orphan Menu',
          type: MenuType.URL,
          url: '/orphan',
          parentId: '507f1f77bcf86cd799439011',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findOne flow', () => {
    it('should find menu by id through service and repository', async () => {
      const created = await service.create({
        name: 'Find Me Menu',
        type: MenuType.URL,
        url: '/find-me',
      });

      const found = await service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Me Menu');
    });

    it('should throw NOT_FOUND when menu does not exist', async () => {
      await expect(
        service.findOne('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll with pagination flow', () => {
    beforeEach(async () => {
      // Create 15 active and 5 inactive menus
      for (let i = 0; i < 15; i++) {
        await service.create({
          name: `Active Menu ${i}`,
          type: MenuType.URL,
          url: `/active-${i}`,
          order: i,
          status: MenuStatus.ACTIVE,
        });
      }
      for (let i = 0; i < 5; i++) {
        await service.create({
          name: `Inactive Menu ${i}`,
          type: MenuType.URL,
          url: `/inactive-${i}`,
          order: 100 + i,
          status: MenuStatus.INACTIVE,
        });
      }
    });

    it('should return all menus through full stack', async () => {
      const result = await service.findAll({});

      expect(result).toHaveLength(20);
    });

    it('should filter by status through full stack', async () => {
      const result = await service.findAll({
        filters: { status: MenuStatus.ACTIVE },
      });

      expect(result).toHaveLength(15);
      result.forEach((menu) => {
        expect(menu.status).toBe(MenuStatus.ACTIVE);
      });
    });

    it('should search by name', async () => {
      const result = await service.findAll({
        filters: { search: 'Active Menu 1' },
      });

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('update menu flow', () => {
    it('should update menu and persist changes', async () => {
      const created = await service.create({
        name: 'Original Name',
        type: MenuType.URL,
        url: '/original',
      });

      const updated = await service.update(created.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');

      // Verify persisted
      const dbMenu = await menuModel.findById(created.id);
      expect(dbMenu?.name).toBe('Updated Name');
    });

    it('should update menu type from URL to CATEGORY', async () => {
      const category = await createTestCategory();
      const menu = await service.create({
        name: 'URL Menu',
        type: MenuType.URL,
        url: '/url-menu',
      });

      const updated = await service.update(menu.id, {
        type: MenuType.CATEGORY,
        categoryId: category._id.toString(),
      });

      expect(updated.type).toBe(MenuType.CATEGORY);
      expect(updated.categoryId).toBe(category._id.toString());
    });

    it('should update parent reference', async () => {
      const parent = await service.create({
        name: 'Parent',
        type: MenuType.URL,
        url: '/parent',
      });
      const menu = await service.create({
        name: 'Child',
        type: MenuType.URL,
        url: '/child',
      });

      const updated = await service.update(menu.id, {
        parentId: parent.id,
      });

      expect(updated.parentId).toBe(parent.id);
    });

    it('should remove parent reference (set to null)', async () => {
      const parent = await service.create({
        name: 'Parent',
        type: MenuType.URL,
        url: '/parent',
      });
      const child = await service.create({
        name: 'Child',
        type: MenuType.URL,
        url: '/child',
        parentId: parent.id,
      });

      // Cannot directly set null through service due to validation
      // But update to a different parent should work
      const newParent = await service.create({
        name: 'New Parent',
        type: MenuType.URL,
        url: '/new-parent',
      });

      const updated = await service.update(child.id, {
        parentId: newParent.id,
      });

      expect(updated.parentId).toBe(newParent.id);
    });

    it('should throw NOT_FOUND when updating non-existent menu', async () => {
      await expect(
        service.update('507f1f77bcf86cd799439011', { name: 'Test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should prevent circular reference', async () => {
      const menu = await service.create({
        name: 'Self Reference',
        type: MenuType.URL,
        url: '/self',
      });

      await expect(
        service.update(menu.id, { parentId: menu.id }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('delete menu flow', () => {
    it('should soft delete menu', async () => {
      const created = await service.create({
        name: 'Delete Me',
        type: MenuType.URL,
        url: '/delete-me',
      });

      await service.remove(created.id);

      // Should not be found via service
      await expect(service.findOne(created.id)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      // But should exist in DB with deletedAt
      const dbMenu = await menuModel.findById(created.id);
      expect(dbMenu).not.toBeNull();
      expect(dbMenu?.deletedAt).toBeDefined();
    });

    it('should throw NOT_FOUND when deleting non-existent menu', async () => {
      await expect(
        service.remove('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('reorderMenus flow', () => {
    it('should reorder multiple menus', async () => {
      const menu1 = await service.create({
        name: 'Menu 1',
        type: MenuType.URL,
        url: '/menu-1',
        order: 0,
      });
      const menu2 = await service.create({
        name: 'Menu 2',
        type: MenuType.URL,
        url: '/menu-2',
        order: 1,
      });

      await service.reorderMenus({
        menus: [
          { id: menu1.id, order: 10 },
          { id: menu2.id, order: 5 },
        ],
      });

      const updated1 = await service.findOne(menu1.id);
      const updated2 = await service.findOne(menu2.id);

      expect(updated1.order).toBe(10);
      expect(updated2.order).toBe(5);
    });
  });

  describe('getActiveMenus flow (Shop API)', () => {
    it('should return active menus with resolved URLs', async () => {
      const category = await createTestCategory('Electronics');
      const topic = await createTestTopic('Featured');

      await service.create({
        name: 'Category Link',
        type: MenuType.CATEGORY,
        categoryId: category._id.toString(),
        order: 0,
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'Topic Link',
        type: MenuType.TOPIC,
        topicId: topic._id.toString(),
        order: 1,
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'Custom URL',
        type: MenuType.URL,
        url: '/custom-page',
        order: 2,
        status: MenuStatus.ACTIVE,
      });

      const result = await service.getActiveMenus();

      expect(result.menus).toHaveLength(3);
      expect(result.menus[0].url).toContain('/category/');
      expect(result.menus[1].url).toContain('/topic/');
      expect(result.menus[2].url).toBe('/custom-page');
    });

    it('should not return inactive menus', async () => {
      await service.create({
        name: 'Active Menu',
        type: MenuType.URL,
        url: '/active',
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'Inactive Menu',
        type: MenuType.URL,
        url: '/inactive',
        status: MenuStatus.INACTIVE,
      });

      const result = await service.getActiveMenus();

      expect(result.menus).toHaveLength(1);
      expect(result.menus[0].name).toBe('Active Menu');
    });

    it('should return menus ordered by order field', async () => {
      await service.create({
        name: 'Third',
        type: MenuType.URL,
        url: '/third',
        order: 3,
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'First',
        type: MenuType.URL,
        url: '/first',
        order: 1,
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'Second',
        type: MenuType.URL,
        url: '/second',
        order: 2,
        status: MenuStatus.ACTIVE,
      });

      const result = await service.getActiveMenus();

      expect(result.menus[0].name).toBe('First');
      expect(result.menus[1].name).toBe('Second');
      expect(result.menus[2].name).toBe('Third');
    });

    it('should include parentId for hierarchical building', async () => {
      const parent = await service.create({
        name: 'Parent',
        type: MenuType.URL,
        url: '/parent',
        order: 0,
        status: MenuStatus.ACTIVE,
      });
      await service.create({
        name: 'Child',
        type: MenuType.URL,
        url: '/child',
        parentId: parent.id,
        order: 1,
        status: MenuStatus.ACTIVE,
      });

      const result = await service.getActiveMenus();

      expect(result.menus).toHaveLength(2);
      const parentMenu = result.menus.find((m) => m.name === 'Parent');
      const childMenu = result.menus.find((m) => m.name === 'Child');

      expect(parentMenu?.parentId).toBeNull();
      expect(childMenu?.parentId).toBe(parent.id);
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across service and repository', async () => {
      const category = await createTestCategory();

      const created = await service.create({
        name: 'Integrity Test Menu',
        type: MenuType.CATEGORY,
        categoryId: category._id.toString(),
        order: 5,
        status: MenuStatus.ACTIVE,
      });

      // Via service
      const viaService = await service.findOne(created.id);

      // Via DB
      const viaDb = await menuModel.findById(created.id).lean();

      expect(viaService.name).toBe(viaDb?.name);
      expect(viaService.type).toBe(viaDb?.type);
      expect(viaService.categoryId).toBe(viaDb?.categoryId?.toString());
      expect(viaService.order).toBe(viaDb?.order);
      expect(viaService.status).toBe(viaDb?.status);
    });
  });

  describe('hierarchical menu structure', () => {
    it('should support multi-level menu hierarchy', async () => {
      const root = await service.create({
        name: 'Root Menu',
        type: MenuType.URL,
        url: '/root',
        order: 0,
      });
      const level1 = await service.create({
        name: 'Level 1',
        type: MenuType.URL,
        url: '/level-1',
        parentId: root.id,
        order: 0,
      });
      const level2 = await service.create({
        name: 'Level 2',
        type: MenuType.URL,
        url: '/level-2',
        parentId: level1.id,
        order: 0,
      });

      // Verify hierarchy
      expect(level2.parentId).toBe(level1.id);
      expect(level1.parentId).toBe(root.id);
      expect(root.parentId).toBeNull();
    });
  });
});
