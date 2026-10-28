import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MenusService } from '../../src/menus/menus.service';
import { MenuRepository } from '../../src/menus/domain/menu.repository';
import { ProductCategoryRepository } from '../../src/product-categories/domain/product-category.repository';
import { TopicRepository } from '../../src/topics/domain/topic.repository';
import { Menu } from '../../src/menus/domain/menu';
import { MenuStatus } from '../../src/menus/domain/menu-status.enum';
import { MenuType } from '../../src/menus/domain/menu-type.enum';
import { CreateMenuDto } from '../../src/menus/dto/create-menu.dto';
import { UpdateMenuDto } from '../../src/menus/dto/update-menu.dto';

describe('MenusService', () => {
  let service: MenusService;
  let menuRepository: jest.Mocked<MenuRepository>;
  let categoryRepository: jest.Mocked<ProductCategoryRepository>;
  let topicRepository: jest.Mocked<TopicRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockCategory = {
    id: 'category-123',
    name: 'Test Category',
    slug: 'danh-muc',
  };

  const mockTopic = {
    id: 'topic-123',
    name: 'Test Topic',
    slug: 'chu-de',
  };

  const mockMenu: Menu = {
    id: 'menu-123',
    name: 'Test Menu',
    parentId: null,
    type: MenuType.URL,
    categoryId: null,
    topicId: null,
    url: '/test-url',
    order: 0,
    status: MenuStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockMenuRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findManyWithPagination: jest.fn(),
      findAllActive: jest.fn(),
      findAll: jest.fn(),
      findByParentId: jest.fn(),
      update: jest.fn(),
      bulkUpdateOrder: jest.fn(),
      remove: jest.fn(),
    };

    const mockCategoryRepository = {
      findById: jest.fn(),
    };

    const mockTopicRepository = {
      findById: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        { provide: MenuRepository, useValue: mockMenuRepository },
        {
          provide: ProductCategoryRepository,
          useValue: mockCategoryRepository,
        },
        { provide: TopicRepository, useValue: mockTopicRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
    menuRepository = module.get(MenuRepository);
    categoryRepository = module.get(ProductCategoryRepository);
    topicRepository = module.get(TopicRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create URL menu successfully', async () => {
      const createDto: CreateMenuDto = {
        name: 'New Menu',
        type: MenuType.URL,
        url: '/new-url',
      };
      menuRepository.create.mockResolvedValue(mockMenu);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', mockMenu.id);
      expect(result).toHaveProperty('name', mockMenu.name);
      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          type: MenuType.URL,
          url: '/new-url',
        }),
      );
    });

    it('should create CATEGORY menu with valid category', async () => {
      const createDto: CreateMenuDto = {
        name: 'Category Menu',
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
      };
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      menuRepository.create.mockResolvedValue({
        ...mockMenu,
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
      });

      const result = await service.create(createDto);

      expect(categoryRepository.findById).toHaveBeenCalledWith('category-123');
      expect(result.type).toBe(MenuType.CATEGORY);
    });

    it('should throw error when CATEGORY type without categoryId', async () => {
      const createDto: CreateMenuDto = {
        name: 'Category Menu',
        type: MenuType.CATEGORY,
      };

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when category not found', async () => {
      const createDto: CreateMenuDto = {
        name: 'Category Menu',
        type: MenuType.CATEGORY,
        categoryId: 'non-existent',
      };
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should create TOPIC menu with valid topic', async () => {
      const createDto: CreateMenuDto = {
        name: 'Topic Menu',
        type: MenuType.TOPIC,
        topicId: 'topic-123',
      };
      topicRepository.findById.mockResolvedValue(mockTopic as any);
      menuRepository.create.mockResolvedValue({
        ...mockMenu,
        type: MenuType.TOPIC,
        topicId: 'topic-123',
      });

      const result = await service.create(createDto);

      expect(topicRepository.findById).toHaveBeenCalledWith('topic-123');
      expect(result.type).toBe(MenuType.TOPIC);
    });

    it('should throw error when TOPIC type without topicId', async () => {
      const createDto: CreateMenuDto = {
        name: 'Topic Menu',
        type: MenuType.TOPIC,
      };

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when topic not found', async () => {
      const createDto: CreateMenuDto = {
        name: 'Topic Menu',
        type: MenuType.TOPIC,
        topicId: 'non-existent',
      };
      topicRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when URL type without url', async () => {
      const createDto: CreateMenuDto = {
        name: 'URL Menu',
        type: MenuType.URL,
      };

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should create menu with parent reference', async () => {
      const parentMenu = { ...mockMenu, id: 'parent-123' };
      const createDto: CreateMenuDto = {
        name: 'Child Menu',
        type: MenuType.URL,
        url: '/child-url',
        parentId: 'parent-123',
      };
      menuRepository.findById.mockResolvedValue(parentMenu);
      menuRepository.create.mockResolvedValue({
        ...mockMenu,
        parentId: 'parent-123',
      });

      const result = await service.create(createDto);

      expect(menuRepository.findById).toHaveBeenCalledWith('parent-123');
      expect(result.parentId).toBe('parent-123');
    });

    it('should throw error when parent not found', async () => {
      const createDto: CreateMenuDto = {
        name: 'Child Menu',
        type: MenuType.URL,
        url: '/child-url',
        parentId: 'non-existent',
      };
      menuRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should use default order and status', async () => {
      const createDto: CreateMenuDto = {
        name: 'Menu',
        type: MenuType.URL,
        url: '/url',
      };
      menuRepository.create.mockResolvedValue(mockMenu);

      await service.create(createDto);

      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order: 0,
          status: MenuStatus.ACTIVE,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return menu when found', async () => {
      menuRepository.findById.mockResolvedValue(mockMenu);

      const result = await service.findOne('menu-123');

      expect(result).toHaveProperty('id', mockMenu.id);
      expect(menuRepository.findById).toHaveBeenCalledWith('menu-123');
    });

    it('should throw error when menu not found', async () => {
      menuRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll', () => {
    it('should return menus array', async () => {
      menuRepository.findMany.mockResolvedValue([mockMenu]);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(menuRepository.findMany).toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      menuRepository.findMany.mockResolvedValue([]);

      await service.findAll({
        filters: { status: MenuStatus.ACTIVE, search: 'test' },
      });

      expect(menuRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: { status: MenuStatus.ACTIVE, search: 'test' },
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateMenuDto = {
      name: 'Updated Menu',
    };

    it('should update menu successfully', async () => {
      const updatedMenu = { ...mockMenu, name: 'Updated Menu' };
      menuRepository.findById.mockResolvedValue(mockMenu);
      menuRepository.update.mockResolvedValue(updatedMenu);

      const result = await service.update('menu-123', updateDto);

      expect(result).toHaveProperty('name', 'Updated Menu');
      expect(menuRepository.update).toHaveBeenCalled();
    });

    it('should throw error when menu not found', async () => {
      menuRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should prevent circular reference (self-parent)', async () => {
      menuRepository.findById.mockResolvedValue(mockMenu);

      await expect(
        service.update('menu-123', { parentId: 'menu-123' }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when new parent not found', async () => {
      menuRepository.findById
        .mockResolvedValueOnce(mockMenu) // First call for finding menu to update
        .mockResolvedValueOnce(null); // Second call for finding parent

      await expect(
        service.update('menu-123', { parentId: 'non-existent' }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should validate category when changing to CATEGORY type', async () => {
      menuRepository.findById.mockResolvedValue(mockMenu);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      menuRepository.update.mockResolvedValue({
        ...mockMenu,
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
      });

      await service.update('menu-123', {
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
      });

      expect(categoryRepository.findById).toHaveBeenCalledWith('category-123');
    });

    it('should validate topic when changing to TOPIC type', async () => {
      menuRepository.findById.mockResolvedValue(mockMenu);
      topicRepository.findById.mockResolvedValue(mockTopic as any);
      menuRepository.update.mockResolvedValue({
        ...mockMenu,
        type: MenuType.TOPIC,
        topicId: 'topic-123',
      });

      await service.update('menu-123', {
        type: MenuType.TOPIC,
        topicId: 'topic-123',
      });

      expect(topicRepository.findById).toHaveBeenCalledWith('topic-123');
    });
  });

  describe('remove', () => {
    it('should remove menu successfully', async () => {
      menuRepository.findById.mockResolvedValue(mockMenu);
      menuRepository.remove.mockResolvedValue(undefined);

      await service.remove('menu-123');

      expect(menuRepository.remove).toHaveBeenCalledWith('menu-123');
    });

    it('should throw error when menu not found', async () => {
      menuRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('reorderMenus', () => {
    it('should reorder menus successfully', async () => {
      menuRepository.bulkUpdateOrder.mockResolvedValue(undefined);

      await service.reorderMenus({
        menus: [
          { id: 'menu-1', order: 0 },
          { id: 'menu-2', order: 1 },
        ],
      });

      expect(menuRepository.bulkUpdateOrder).toHaveBeenCalledWith([
        { id: 'menu-1', order: 0 },
        { id: 'menu-2', order: 1 },
      ]);
    });
  });

  describe('getActiveMenus', () => {
    it('should return active menus with resolved URLs', async () => {
      const categoryMenu: Menu = {
        ...mockMenu,
        id: 'cat-menu',
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
        url: '/category/danh-muc-category-123',
      };
      const topicMenu: Menu = {
        ...mockMenu,
        id: 'topic-menu',
        type: MenuType.TOPIC,
        topicId: 'topic-123',
        url: '/topic/chu-de-topic-123',
      };
      const urlMenu: Menu = {
        ...mockMenu,
        id: 'url-menu',
        type: MenuType.URL,
        url: '/custom-url',
      };

      menuRepository.findAllActive.mockResolvedValue([
        categoryMenu,
        topicMenu,
        urlMenu,
      ]);

      const result = await service.getActiveMenus();

      expect(result.menus).toHaveLength(3);
      expect(result.menus[0].url).toContain('danh-muc');
      expect(result.menus[1].url).toContain('chu-de');
      expect(result.menus[2].url).toBe('/custom-url');
    });

    it('should return # for menu with missing category', async () => {
      const categoryMenu: Menu = {
        ...mockMenu,
        type: MenuType.CATEGORY,
        categoryId: 'deleted-category',
        url: null,
      };
      menuRepository.findAllActive.mockResolvedValue([categoryMenu]);
      categoryRepository.findById.mockResolvedValue(null);

      const result = await service.getActiveMenus();

      expect(result.menus[0].url).toBe('#');
    });

    it('should return # for menu with missing topic', async () => {
      const topicMenu: Menu = {
        ...mockMenu,
        type: MenuType.TOPIC,
        topicId: 'deleted-topic',
        url: null,
      };
      menuRepository.findAllActive.mockResolvedValue([topicMenu]);
      topicRepository.findById.mockResolvedValue(null);

      const result = await service.getActiveMenus();

      expect(result.menus[0].url).toBe('#');
    });

    it('should use custom url if provided for any menu type', async () => {
      const menuWithCustomUrl: Menu = {
        ...mockMenu,
        type: MenuType.CATEGORY,
        categoryId: 'category-123',
        url: '/custom-override',
      };
      menuRepository.findAllActive.mockResolvedValue([menuWithCustomUrl]);

      const result = await service.getActiveMenus();

      expect(result.menus[0].url).toBe('/custom-override');
    });

    it('should include parentId in shop menu response', async () => {
      const parentMenu = { ...mockMenu, id: 'parent-123', parentId: null };
      const childMenu = {
        ...mockMenu,
        id: 'child-123',
        parentId: 'parent-123',
      };
      menuRepository.findAllActive.mockResolvedValue([parentMenu, childMenu]);

      const result = await service.getActiveMenus();

      expect(result.menus[0].parentId).toBeNull();
      expect(result.menus[1].parentId).toBe('parent-123');
    });
  });

  describe('localization', () => {
    it('should create menu with Vietnamese and English names', async () => {
      const createDto: CreateMenuDto = {
        name: 'Products',
        type: MenuType.URL,
        url: '/products',
        localization: {
          vi: 'Sản phẩm',
          en: 'Products',
        },
      };
      const menuWithLocalization = {
        ...mockMenu,
        localization: { vi: 'Sản phẩm', en: 'Products' },
      };
      menuRepository.create.mockResolvedValue(menuWithLocalization);

      const result = await service.create(createDto);

      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: 'Sản phẩm', en: 'Products' },
        }),
      );
      expect(result.localization).toEqual({ vi: 'Sản phẩm', en: 'Products' });
    });

    it('should create menu with only Vietnamese name', async () => {
      const createDto: CreateMenuDto = {
        name: 'Default Name',
        type: MenuType.URL,
        url: '/test',
        localization: {
          vi: 'Tên tiếng Việt',
        },
      };
      menuRepository.create.mockResolvedValue(mockMenu);

      await service.create(createDto);

      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: { vi: 'Tên tiếng Việt', en: undefined },
        }),
      );
    });

    it('should create menu without localization when not provided', async () => {
      const createDto: CreateMenuDto = {
        name: 'Default Name',
        type: MenuType.URL,
        url: '/test',
      };
      menuRepository.create.mockResolvedValue(mockMenu);

      await service.create(createDto);

      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          localization: null,
        }),
      );
    });

    it('should include localization in shop menu response', async () => {
      const menuWithLocalization = {
        ...mockMenu,
        localization: { vi: 'Sản phẩm', en: 'Products' },
      };
      menuRepository.findAllActive.mockResolvedValue([menuWithLocalization]);

      const result = await service.getActiveMenus();

      expect(result.menus[0]).toHaveProperty('localization');
      expect(result.menus[0].localization).toEqual({
        vi: 'Sản phẩm',
        en: 'Products',
      });
    });

    it('should update menu with new localization', async () => {
      const updateDto: UpdateMenuDto = {
        localization: {
          vi: 'Tên mới',
          en: 'New Name',
        },
      };
      const updatedMenu = {
        ...mockMenu,
        localization: { vi: 'Tên mới', en: 'New Name' },
      };
      menuRepository.findById.mockResolvedValue(mockMenu);
      menuRepository.update.mockResolvedValue(updatedMenu);

      const result = await service.update('menu-123', updateDto);

      expect(result.localization).toEqual({ vi: 'Tên mới', en: 'New Name' });
    });
  });
});
