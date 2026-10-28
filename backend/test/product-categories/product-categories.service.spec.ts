import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ProductCategoriesService } from '../../src/product-categories/product-categories.service';
import { ProductCategoryRepository } from '../../src/product-categories/domain/product-category.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { ProductCategory } from '../../src/product-categories/domain/product-category';
import { ProductCategoryStatus } from '../../src/product-categories/domain/product-category-status.enum';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let productCategoryRepository: jest.Mocked<ProductCategoryRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;
  let i18n: jest.Mocked<I18nService>;

  const mockCategory: ProductCategory = {
    id: 'category-123',
    businessId: '110668',
    source: 'nhanh',
    code: 'CAT-001',
    name: 'Electronics',
    parentId: null,
    status: ProductCategoryStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChildCategory: ProductCategory = {
    id: 'category-456',
    businessId: '110668',
    source: 'nhanh',
    code: 'CAT-002',
    name: 'Smartphones',
    parentId: 'category-123',
    status: ProductCategoryStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    const mockProductCategoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilter: jest.fn(),
      findByParentId: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoriesService,
        {
          provide: ProductCategoryRepository,
          useValue: mockProductCategoryRepository,
        },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ProductCategoriesService>(ProductCategoriesService);
    productCategoryRepository = module.get(ProductCategoryRepository);
    nhanhAuthService = module.get(NhanhAuthService);
    i18n = module.get(I18nService);

    // Default mock for auth service
    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return categories with businessId filter', async () => {
      productCategoryRepository.findAllWithFilter.mockResolvedValue([
        mockCategory,
        mockChildCategory,
      ]);

      const result = await service.findAll({});

      expect(result).toHaveLength(2);
      expect(productCategoryRepository.findAllWithFilter).toHaveBeenCalledWith({
        filterOptions: expect.objectContaining({
          businessId: '110668',
        }),
        sortOptions: undefined,
      });
    });

    it('should apply provided filters', async () => {
      productCategoryRepository.findAllWithFilter.mockResolvedValue([
        mockCategory,
      ]);

      const result = await service.findAll({
        filters: { status: ProductCategoryStatus.ACTIVE },
      });

      expect(productCategoryRepository.findAllWithFilter).toHaveBeenCalledWith({
        filterOptions: expect.objectContaining({
          businessId: '110668',
          status: ProductCategoryStatus.ACTIVE,
        }),
        sortOptions: undefined,
      });
    });

    it('should apply sorting options', async () => {
      productCategoryRepository.findAllWithFilter.mockResolvedValue([]);

      await service.findAll({
        sort: [{ orderBy: 'name', order: 'asc' }],
      });

      expect(productCategoryRepository.findAllWithFilter).toHaveBeenCalledWith({
        filterOptions: expect.anything(),
        sortOptions: [{ orderBy: 'name', order: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('should return category when found', async () => {
      productCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await service.findOne('category-123');

      expect(result).toEqual(mockCategory);
      expect(productCategoryRepository.findById).toHaveBeenCalledWith(
        'category-123',
      );
    });

    it('should throw error when category not found', async () => {
      productCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAllProductCategories', () => {
    it('should return all categories', async () => {
      productCategoryRepository.findAll.mockResolvedValue([
        mockCategory,
        mockChildCategory,
      ]);

      const result = await service.findAllProductCategories();

      expect(result).toHaveLength(2);
      expect(productCategoryRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findByParentId', () => {
    it('should return child categories', async () => {
      productCategoryRepository.findByParentId.mockResolvedValue([
        mockChildCategory,
      ]);

      const result = await service.findByParentId('category-123');

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBe('category-123');
      expect(productCategoryRepository.findByParentId).toHaveBeenCalledWith(
        'category-123',
      );
    });

    it('should return empty array when no children exist', async () => {
      productCategoryRepository.findByParentId.mockResolvedValue([]);

      const result = await service.findByParentId('leaf-category');

      expect(result).toHaveLength(0);
    });
  });

  describe('getProductCategoryTree', () => {
    it('should build category tree correctly', async () => {
      const grandChild: ProductCategory = {
        ...mockChildCategory,
        id: 'category-789',
        name: 'iPhone',
        parentId: 'category-456',
      };

      productCategoryRepository.findAll.mockResolvedValue([
        mockCategory,
        mockChildCategory,
        grandChild,
      ]);

      const result = await service.getProductCategoryTree();

      // Should have one root category
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('category-123');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('category-456');
      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0].id).toBe('category-789');
    });

    it('should handle categories with missing parent as root', async () => {
      const orphanCategory: ProductCategory = {
        ...mockCategory,
        id: 'orphan-123',
        parentId: 'missing-parent',
      };

      productCategoryRepository.findAll.mockResolvedValue([
        mockCategory,
        orphanCategory,
      ]);

      const result = await service.getProductCategoryTree();

      // Both should be at root level
      expect(result).toHaveLength(2);
    });

    it('should handle empty category list', async () => {
      productCategoryRepository.findAll.mockResolvedValue([]);

      const result = await service.getProductCategoryTree();

      expect(result).toHaveLength(0);
    });

    it('should handle multiple root categories', async () => {
      const anotherRoot: ProductCategory = {
        ...mockCategory,
        id: 'category-root-2',
        name: 'Clothing',
        parentId: null,
      };

      productCategoryRepository.findAll.mockResolvedValue([
        mockCategory,
        anotherRoot,
        mockChildCategory,
      ]);

      const result = await service.getProductCategoryTree();

      expect(result).toHaveLength(2);
      const electronicsRoot = result.find((c) => c.id === 'category-123');
      expect(electronicsRoot.children).toHaveLength(1);
    });

    it('should preserve category data in tree nodes', async () => {
      productCategoryRepository.findAll.mockResolvedValue([mockCategory]);

      const result = await service.getProductCategoryTree();

      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockCategory.id,
          name: mockCategory.name,
          businessId: mockCategory.businessId,
          status: mockCategory.status,
          children: [],
        }),
      );
    });
  });
});
