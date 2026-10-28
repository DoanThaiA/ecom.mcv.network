import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { MenuDocumentRepository } from '../../../src/menus/model/menu.repository';
import {
  MenuSchemaClass,
  MenuSchema,
} from '../../../src/menus/model/menu.schema';
import { Menu } from '../../../src/menus/domain/menu';
import { MenuStatus } from '../../../src/menus/domain/menu-status.enum';
import { MenuType } from '../../../src/menus/domain/menu-type.enum';

describe('MenuDocumentRepository', () => {
  let repository: MenuDocumentRepository;
  let menuModel: PaginateModel<MenuSchemaClass>;
  let module: TestingModule;

  const createTestMenu = (
    overrides: Partial<Menu> = {},
  ): Omit<Menu, 'id' | 'createdAt' | 'updatedAt'> => {
    const timestamp = Date.now();
    return {
      name: `Test Menu ${timestamp}`,
      parentId: null,
      type: MenuType.URL,
      categoryId: null,
      topicId: null,
      url: '/test-url',
      order: 0,
      status: MenuStatus.ACTIVE,
      deletedAt: null,
      ...overrides,
    } as Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: MenuSchemaClass.name, schema: MenuSchema },
        ]),
      ],
      providers: [MenuDocumentRepository],
    }).compile();

    repository = module.get<MenuDocumentRepository>(MenuDocumentRepository);
    menuModel = module.get<PaginateModel<MenuSchemaClass>>(
      getModelToken(MenuSchemaClass.name),
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await menuModel.deleteMany({});
  });

  describe('create', () => {
    it('should create a menu and return domain entity with id', async () => {
      const menuData = createTestMenu({ name: 'New Menu' });

      const result = await repository.create(menuData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Menu');
      expect(result.status).toBe(MenuStatus.ACTIVE);
    });

    it('should persist menu to database', async () => {
      const menuData = createTestMenu();

      const created = await repository.create(menuData);
      const found = await menuModel.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.name).toBe(menuData.name);
    });

    it('should create menu with parent reference', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      const child = await repository.create(
        createTestMenu({ name: 'Child', parentId: parent.id }),
      );

      expect(child.parentId).toBe(parent.id);
    });

    it('should create menu with category type', async () => {
      const categoryId = '507f1f77bcf86cd799439011';
      const menu = await repository.create(
        createTestMenu({
          type: MenuType.CATEGORY,
          categoryId,
          url: null,
        }),
      );

      expect(menu.type).toBe(MenuType.CATEGORY);
      expect(menu.categoryId).toBe(categoryId);
    });

    it('should create menu with topic type', async () => {
      const topicId = '507f1f77bcf86cd799439022';
      const menu = await repository.create(
        createTestMenu({
          type: MenuType.TOPIC,
          topicId,
          url: null,
        }),
      );

      expect(menu.type).toBe(MenuType.TOPIC);
      expect(menu.topicId).toBe(topicId);
    });
  });

  describe('findById', () => {
    it('should find menu by id', async () => {
      const menuData = createTestMenu();
      const created = await repository.create(menuData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(menuData.name);
    });

    it('should return null when menu not found', async () => {
      const found = await repository.findById('507f1f77bcf86cd799439011');

      expect(found).toBeNull();
    });

    it('should not return soft-deleted menus', async () => {
      const created = await repository.create(createTestMenu());
      await repository.remove(created.id);

      const found = await repository.findById(created.id);

      expect(found).toBeNull();
    });
  });

  describe('findAllActive', () => {
    it('should return active menus ordered by order field', async () => {
      await repository.create(createTestMenu({ name: 'Menu 3', order: 3 }));
      await repository.create(createTestMenu({ name: 'Menu 1', order: 1 }));
      await repository.create(createTestMenu({ name: 'Menu 2', order: 2 }));

      const found = await repository.findAllActive();

      expect(found).toHaveLength(3);
      expect(found[0].order).toBe(1);
      expect(found[1].order).toBe(2);
      expect(found[2].order).toBe(3);
    });

    it('should not return inactive menus', async () => {
      await repository.create(createTestMenu({ status: MenuStatus.ACTIVE }));
      await repository.create(
        createTestMenu({ name: 'Inactive', status: MenuStatus.INACTIVE }),
      );

      const found = await repository.findAllActive();

      expect(found).toHaveLength(1);
      expect(found[0].status).toBe(MenuStatus.ACTIVE);
    });

    it('should not return soft-deleted menus', async () => {
      const menu = await repository.create(createTestMenu());
      await repository.remove(menu.id);

      const found = await repository.findAllActive();

      expect(found).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted menus', async () => {
      await repository.create(createTestMenu({ status: MenuStatus.ACTIVE }));
      await repository.create(createTestMenu({ status: MenuStatus.INACTIVE }));

      const found = await repository.findAll();

      expect(found).toHaveLength(2);
    });

    it('should return menus ordered by order field', async () => {
      await repository.create(createTestMenu({ order: 5 }));
      await repository.create(createTestMenu({ order: 1 }));
      await repository.create(createTestMenu({ order: 3 }));

      const found = await repository.findAll();

      expect(found[0].order).toBe(1);
      expect(found[1].order).toBe(3);
      expect(found[2].order).toBe(5);
    });
  });

  describe('findByParentId', () => {
    it('should find root menus (parentId = null)', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      await repository.create(
        createTestMenu({ name: 'Child', parentId: parent.id }),
      );

      const roots = await repository.findByParentId(null);

      expect(roots).toHaveLength(1);
      expect(roots[0].name).toBe('Parent');
    });

    it('should find child menus by parent ID', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      await repository.create(
        createTestMenu({ name: 'Child 1', parentId: parent.id, order: 1 }),
      );
      await repository.create(
        createTestMenu({ name: 'Child 2', parentId: parent.id, order: 2 }),
      );

      const children = await repository.findByParentId(parent.id);

      expect(children).toHaveLength(2);
      expect(children[0].name).toBe('Child 1');
      expect(children[1].name).toBe('Child 2');
    });

    it('should return children ordered by order field', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      await repository.create(
        createTestMenu({ name: 'Child 3', parentId: parent.id, order: 3 }),
      );
      await repository.create(
        createTestMenu({ name: 'Child 1', parentId: parent.id, order: 1 }),
      );

      const children = await repository.findByParentId(parent.id);

      expect(children[0].order).toBe(1);
      expect(children[1].order).toBe(3);
    });
  });

  describe('findManyWithPagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 15; i++) {
        await repository.create(
          createTestMenu({
            name: `Menu ${i}`,
            order: i,
            status: i < 10 ? MenuStatus.ACTIVE : MenuStatus.INACTIVE,
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
        filterOptions: { status: MenuStatus.ACTIVE },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(10);
    });

    it('should search by name', async () => {
      const result = await repository.findManyWithPagination({
        filterOptions: { search: 'Menu 1' },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBeGreaterThan(0);
    });

    it('should filter by parentId (null for roots)', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      await repository.create(
        createTestMenu({ name: 'Child', parentId: parent.id }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { parentId: null },
        paginationOptions: { page: 1, limit: 100 },
      });

      // 15 from beforeEach + 1 parent = 16 root menus
      expect(result.totalDocs).toBe(16);
    });

    it('should filter by specific parentId', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      await repository.create(
        createTestMenu({ name: 'Child', parentId: parent.id }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { parentId: parent.id },
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].name).toBe('Child');
    });

    it('should sort by order by default', async () => {
      const result = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].order).toBe(0);
      expect(result.docs[1].order).toBe(1);
    });

    it('should sort by custom field', async () => {
      const result = await repository.findManyWithPagination({
        sortOptions: [{ orderBy: 'name', order: 'desc' }],
        paginationOptions: { page: 1, limit: 5 },
      });

      expect(result.docs[0].name).toBe('Menu 9');
    });
  });

  describe('update', () => {
    it('should update menu and return updated entity', async () => {
      const created = await repository.create(createTestMenu());

      const updated = await repository.update(created.id, {
        name: 'Updated Name',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
    });

    it('should update status', async () => {
      const created = await repository.create(createTestMenu());

      const updated = await repository.update(created.id, {
        status: MenuStatus.INACTIVE,
      });

      expect(updated?.status).toBe(MenuStatus.INACTIVE);
    });

    it('should update parentId', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      const menu = await repository.create(createTestMenu());

      const updated = await repository.update(menu.id, {
        parentId: parent.id,
      });

      expect(updated?.parentId).toBe(parent.id);
    });

    it('should set parentId to null', async () => {
      const parent = await repository.create(
        createTestMenu({ name: 'Parent' }),
      );
      const menu = await repository.create(
        createTestMenu({ parentId: parent.id }),
      );

      const updated = await repository.update(menu.id, {
        parentId: null,
      });

      expect(updated?.parentId).toBeNull();
    });

    it('should update type and categoryId', async () => {
      const menu = await repository.create(
        createTestMenu({ type: MenuType.URL }),
      );
      const categoryId = '507f1f77bcf86cd799439011';

      const updated = await repository.update(menu.id, {
        type: MenuType.CATEGORY,
        categoryId,
      });

      expect(updated?.type).toBe(MenuType.CATEGORY);
      expect(updated?.categoryId).toBe(categoryId);
    });

    it('should return null when menu not found', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        name: 'Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('bulkUpdateOrder', () => {
    it('should update order for multiple menus', async () => {
      const menu1 = await repository.create(createTestMenu({ order: 0 }));
      const menu2 = await repository.create(createTestMenu({ order: 1 }));

      await repository.bulkUpdateOrder([
        { id: menu1.id, order: 5 },
        { id: menu2.id, order: 10 },
      ]);

      const found1 = await repository.findById(menu1.id);
      const found2 = await repository.findById(menu2.id);

      expect(found1?.order).toBe(5);
      expect(found2?.order).toBe(10);
    });

    it('should handle empty updates array', async () => {
      await expect(repository.bulkUpdateOrder([])).resolves.not.toThrow();
    });
  });

  describe('remove', () => {
    it('should soft delete menu', async () => {
      const created = await repository.create(createTestMenu());

      await repository.remove(created.id);

      // Should not be found via normal query
      const found = await repository.findById(created.id);
      expect(found).toBeNull();

      // But should still exist in database with deletedAt
      const raw = await menuModel.findById(created.id);
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeDefined();
    });
  });

  describe('hierarchical menu structure', () => {
    it('should support multi-level hierarchy', async () => {
      const root = await repository.create(
        createTestMenu({ name: 'Root', order: 0 }),
      );
      const level1 = await repository.create(
        createTestMenu({ name: 'Level 1', parentId: root.id, order: 0 }),
      );
      const level2 = await repository.create(
        createTestMenu({ name: 'Level 2', parentId: level1.id, order: 0 }),
      );

      const roots = await repository.findByParentId(null);
      const children1 = await repository.findByParentId(root.id);
      const children2 = await repository.findByParentId(level1.id);

      expect(roots).toHaveLength(1);
      expect(children1).toHaveLength(1);
      expect(children2).toHaveLength(1);
      expect(children2[0].name).toBe('Level 2');
    });
  });
});
