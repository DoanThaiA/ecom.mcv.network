import { Test, TestingModule } from '@nestjs/testing';
import { ProductBrandsService } from '../../src/product-brands/product-brands.service';
import { ProductBrandRepository } from '../../src/product-brands/domain/product-brand.repository';
import { NhanhAuthService } from '../../src/nhanh/services/nhanh-auth.service';
import { ProductBrand } from '../../src/product-brands/domain/product-brand';
import { ProductBrandStatus } from '../../src/product-brands/domain/product-brand-status.enum';

describe('ProductBrandsService', () => {
  let service: ProductBrandsService;
  let productBrandRepository: jest.Mocked<ProductBrandRepository>;
  let nhanhAuthService: jest.Mocked<NhanhAuthService>;

  const mockBrand: ProductBrand = {
    id: 'brand-123',
    businessId: '110668',
    source: 'nhanh',
    code: 'BRAND-001',
    name: 'Apple',
    status: ProductBrandStatus.ACTIVE,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenData = {
    businessId: 110668,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    const mockProductBrandRepository = {
      findById: jest.fn(),
      findManyWithPagination: jest.fn(),
    };

    const mockNhanhAuthService = {
      getAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductBrandsService,
        {
          provide: ProductBrandRepository,
          useValue: mockProductBrandRepository,
        },
        { provide: NhanhAuthService, useValue: mockNhanhAuthService },
      ],
    }).compile();

    service = module.get<ProductBrandsService>(ProductBrandsService);
    productBrandRepository = module.get(ProductBrandRepository);
    nhanhAuthService = module.get(NhanhAuthService);

    nhanhAuthService.getAccessToken.mockResolvedValue(mockTokenData as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findManyWithPagination', () => {
    it('should return paginated brands', async () => {
      const paginatedResult = {
        docs: [mockBrand],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      productBrandRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findManyWithPagination({
        page: 1,
        limit: 10,
      });

      expect(result.docs).toHaveLength(1);
      expect(
        productBrandRepository.findManyWithPagination,
      ).toHaveBeenCalledWith({
        filterOptions: expect.objectContaining({
          businessId: '110668',
        }),
        sortOptions: undefined,
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should use default pagination when not provided', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      productBrandRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({});

      expect(
        productBrandRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          paginationOptions: { page: 1, limit: 10 },
        }),
      );
    });

    it('should apply provided filters', async () => {
      const paginatedResult = {
        docs: [mockBrand],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      productBrandRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({
        filters: { status: ProductBrandStatus.ACTIVE },
      });

      expect(
        productBrandRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({
            status: ProductBrandStatus.ACTIVE,
          }),
        }),
      );
    });

    it('should apply sort options', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
        offset: 0,
      };
      productBrandRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({
        sort: [{ orderBy: 'name', order: 'asc' }],
      });

      expect(
        productBrandRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sortOptions: [{ orderBy: 'name', order: 'asc' }],
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return brand when found', async () => {
      productBrandRepository.findById.mockResolvedValue(mockBrand);

      const result = await service.findById('brand-123');

      expect(result).toEqual(mockBrand);
      expect(productBrandRepository.findById).toHaveBeenCalledWith('brand-123');
    });

    it('should return null when brand not found', async () => {
      productBrandRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });
});
