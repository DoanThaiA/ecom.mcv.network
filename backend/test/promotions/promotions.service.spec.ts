import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PromotionsService } from '../../src/promotions/promotions.service';
import { PromotionRepository } from '../../src/promotions/domain/promotion.repository';
import { BundleDealHandler } from '../../src/promotions/handlers/bundle-deal.handler';
import { OrderDiscountHandler } from '../../src/promotions/handlers/order-discount.handler';
import { ProductDiscountHandler } from '../../src/promotions/handlers/product-discount.handler';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { FlashSaleRepository } from '../../src/flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../src/flash-sale-products/domain/flash-sale-product.repository';
import { PromotionProductRepository } from '../../src/promotion-products/domain/promotion-product.repository';
import { PromotionUsageRecordRepository } from '../../src/promotion-usage-records/domain/promotion-usage-record.repository';
import { PromotionType } from '../../src/promotions/domain/promotion-type.enum';
import { PromotionStatus } from '../../src/promotions/domain/promotion-status.enum';
import { BundleDealSubType } from '../../src/promotions/domain/bundle-deal-sub-type.enum';
import { Promotion } from '../../src/promotions/domain/promotion';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let promotionRepository: jest.Mocked<PromotionRepository>;
  let bundleDealHandler: jest.Mocked<BundleDealHandler>;
  let orderDiscountHandler: jest.Mocked<OrderDiscountHandler>;
  let productRepository: jest.Mocked<ProductRepository>;
  let i18nService: jest.Mocked<I18nService>;

  const mockPromotion: Promotion = {
    id: 'promo-123',
    type: PromotionType.BUNDLE_DEAL,
    name: 'Test Bundle Deal',
    startTime: new Date('2024-01-01T00:00:00Z'),
    endTime: new Date('2024-12-31T23:59:59Z'),
    isEnabled: true,
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_TO_GET_GIFT,
      tiers: [
        {
          minOrderValue: 100000,
          giftProducts: [
            {
              productId: 'product-1',
              name: 'Gift Product 1',
              image: 'https://example.com/image1.jpg',
            },
          ],
        },
        {
          minOrderValue: 200000,
          giftProducts: [
            {
              productId: 'product-2',
              name: 'Gift Product 2',
              image: 'https://example.com/image2.jpg',
            },
          ],
        },
      ],
      notApplicableWithOtherPromotions: false,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        {
          provide: PromotionRepository,
          useValue: {
            existsByName: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findActiveByType: jest.fn(),
            findByPromoCode: jest.fn(),
          },
        },
        {
          provide: BundleDealHandler,
          useValue: {
            validate: jest.fn(),
            enrich: jest.fn(),
            checkEligibility: jest.fn(),
            getTierCount: jest.fn(),
          },
        },
        {
          provide: OrderDiscountHandler,
          useValue: {
            validate: jest.fn(),
            enrich: jest.fn(),
            checkEligibility: jest.fn(),
            getTierCount: jest.fn(),
          },
        },
        {
          provide: ProductDiscountHandler,
          useValue: {
            validate: jest.fn(),
            enrich: jest.fn(),
            checkEligibility: jest.fn(),
            getTierCount: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
            findByIds: jest.fn(),
          },
        },
        {
          provide: FlashSaleRepository,
          useValue: {
            findCurrentlyActive: jest.fn(),
          },
        },
        {
          provide: FlashSaleProductRepository,
          useValue: {
            findByActiveFlashSaleAndProductId: jest.fn(),
          },
        },
        {
          provide: PromotionProductRepository,
          useValue: {
            findByPromotionId: jest.fn(),
            bulkCreate: jest.fn(),
            removeByPromotionId: jest.fn(),
          },
        },
        {
          provide: PromotionUsageRecordRepository,
          useValue: {
            create: jest.fn(),
            findByPromotionAndUser: jest.fn(),
            deleteByPromotionId: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    promotionRepository = module.get(
      PromotionRepository,
    ) as jest.Mocked<PromotionRepository>;
    bundleDealHandler = module.get(
      BundleDealHandler,
    ) as jest.Mocked<BundleDealHandler>;
    orderDiscountHandler = module.get(
      OrderDiscountHandler,
    ) as jest.Mocked<OrderDiscountHandler>;
    productRepository = module.get(
      ProductRepository,
    ) as jest.Mocked<ProductRepository>;
    i18nService = module.get(I18nService) as jest.Mocked<I18nService>;

    // Default mock for product lookup - return mock products for gift products
    productRepository.findByIds.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Gift Product 1',
        images: ['https://example.com/image1.jpg'],
      } as any,
      {
        id: 'product-2',
        name: 'Gift Product 2',
        images: ['https://example.com/image2.jpg'],
      } as any,
      {
        id: 'product-3',
        name: 'Gift Product 3',
        images: ['https://example.com/image3.jpg'],
      } as any,
      {
        id: 'gift-1',
        name: 'Gift 1',
        images: ['https://example.com/gift-1.jpg'],
      } as any,
      {
        id: 'gift-2',
        name: 'Gift 2',
        images: ['https://example.com/gift-2.jpg'],
      } as any,
      {
        id: 'gift-3',
        name: 'Gift 3',
        images: ['https://example.com/gift-3.jpg'],
      } as any,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      type: PromotionType.BUNDLE_DEAL,
      name: 'New Bundle Deal',
      startTime: '2024-06-01T00:00:00Z',
      endTime: '2024-12-31T23:59:59Z',
      bundleDealConfig: {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [
              {
                productId: 'product-1',
                name: 'Gift Product 1',
                image: 'https://example.com/image1.jpg',
              },
            ],
          },
        ],
      },
    };

    it('should create a new bundle deal promotion', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      bundleDealHandler.validate.mockResolvedValue(undefined);
      promotionRepository.create.mockResolvedValue(mockPromotion);

      const result = await service.create(createDto as any);

      expect(promotionRepository.existsByName).toHaveBeenCalledWith(
        createDto.name,
      );
      expect(bundleDealHandler.validate).toHaveBeenCalled();
      expect(promotionRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('promo-123');
      expect(result.status).toBeDefined();
    });

    it('should throw error when name already exists', async () => {
      promotionRepository.existsByName.mockResolvedValue(true);

      await expect(service.create(createDto as any)).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.nameAlreadyExists');
    });

    it('should throw error when startTime is after endTime', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      const invalidDto = {
        ...createDto,
        startTime: '2024-12-31T23:59:59Z',
        endTime: '2024-01-01T00:00:00Z',
      };

      await expect(service.create(invalidDto as any)).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith(
        'promotion.startTimeMustBeBeforeEndTime',
      );
    });

    it('should throw error when startTime equals endTime', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      const invalidDto = {
        ...createDto,
        startTime: '2024-06-01T00:00:00Z',
        endTime: '2024-06-01T00:00:00Z',
      };

      await expect(service.create(invalidDto as any)).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith(
        'promotion.startTimeMustBeBeforeEndTime',
      );
    });

    it('should throw error when promotion type is unsupported', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      const unsupportedDto = {
        ...createDto,
        type: PromotionType.PRODUCT_COMBO, // Not yet implemented
      };

      await expect(service.create(unsupportedDto as any)).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.unsupportedType');
    });

    it('should throw error when bundle deal config is missing', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      const dtoWithoutConfig = {
        type: PromotionType.BUNDLE_DEAL,
        name: 'New Bundle Deal',
        startTime: '2024-06-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
      };

      await expect(service.create(dtoWithoutConfig as any)).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith(
        'promotion.bundleDealConfigRequired',
      );
    });

    it('should throw error when bundle deal validation fails', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      bundleDealHandler.validate.mockRejectedValue(new Error('Invalid config'));

      await expect(service.create(createDto as any)).rejects.toThrow(
        'Invalid config',
      );
    });
  });

  describe('findById', () => {
    it('should find promotion by ID with status', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);

      const result = await service.findById('promo-123');

      expect(promotionRepository.findById).toHaveBeenCalledWith('promo-123');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('promo-123');
      expect(result!.status).toBeDefined();
    });

    it('should return null when promotion not found', async () => {
      promotionRepository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all promotions with pagination', async () => {
      const mockPaginateResult = {
        docs: [mockPromotion],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };

      promotionRepository.findAll.mockResolvedValue(mockPaginateResult as any);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(promotionRepository.findAll).toHaveBeenCalledWith(
        {
          type: undefined,
          status: undefined,
          keyword: undefined,
        },
        1,
        10,
      );
      expect(result.docs).toHaveLength(1);
      expect(result.docs[0]!.status).toBeDefined();
    });

    it('should apply filters when provided', async () => {
      const mockPaginateResult = {
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
      };

      promotionRepository.findAll.mockResolvedValue(mockPaginateResult as any);

      await service.findAll({
        type: PromotionType.BUNDLE_DEAL,
        status: PromotionStatus.ACTIVE,
        keyword: 'test',
        page: 2,
        limit: 20,
      });

      expect(promotionRepository.findAll).toHaveBeenCalledWith(
        {
          type: PromotionType.BUNDLE_DEAL,
          status: PromotionStatus.ACTIVE,
          keyword: 'test',
        },
        2,
        20,
      );
    });

    it('should use default pagination when not provided', async () => {
      const mockPaginateResult = {
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
      };

      promotionRepository.findAll.mockResolvedValue(mockPaginateResult as any);

      await service.findAll({});

      expect(promotionRepository.findAll).toHaveBeenCalledWith(
        {
          type: undefined,
          status: undefined,
          keyword: undefined,
        },
        1,
        10,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Bundle Deal',
      startTime: '2024-07-01T00:00:00Z',
    };

    it('should update promotion', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      promotionRepository.existsByName.mockResolvedValue(false);
      const updatedPromotion = { ...mockPromotion, name: updateDto.name };
      promotionRepository.update.mockResolvedValue(updatedPromotion);

      const result = await service.update('promo-123', updateDto as any);

      expect(promotionRepository.findById).toHaveBeenCalledWith('promo-123');
      expect(promotionRepository.update).toHaveBeenCalledWith(
        'promo-123',
        expect.objectContaining({ name: updateDto.name }),
      );
      expect(result!.name).toBe('Updated Bundle Deal');
      expect(result!.status).toBeDefined();
    });

    it('should throw error when promotion not found', async () => {
      promotionRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateDto as any),
      ).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.notFound');
    });

    it('should throw error when updating to existing name', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      promotionRepository.existsByName.mockResolvedValue(true);

      await expect(
        service.update('promo-123', updateDto as any),
      ).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.nameAlreadyExists');
    });

    it('should not check name uniqueness when name unchanged', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      promotionRepository.update.mockResolvedValue(mockPromotion);
      const dtoWithSameName = { name: mockPromotion.name };

      await service.update('promo-123', dtoWithSameName as any);

      expect(promotionRepository.existsByName).not.toHaveBeenCalled();
    });

    it('should validate time range when updating times', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      const invalidDto = {
        startTime: '2024-12-31T23:59:59Z',
        endTime: '2024-01-01T00:00:00Z',
      };

      await expect(
        service.update('promo-123', invalidDto as any),
      ).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith(
        'promotion.startTimeMustBeBeforeEndTime',
      );
    });

    it('should update isEnabled flag', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      promotionRepository.update.mockResolvedValue({
        ...mockPromotion,
        isEnabled: false,
      });

      await service.update('promo-123', { isEnabled: false } as any);

      expect(promotionRepository.update).toHaveBeenCalledWith(
        'promo-123',
        expect.objectContaining({ isEnabled: false }),
      );
    });

    it('should update bundle deal config and validate', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      bundleDealHandler.validate.mockResolvedValue(undefined);
      const updatedConfig = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 150000,
            giftProducts: [
              {
                productId: 'product-3',
                name: 'Gift product-3',
                image: 'https://example.com/product-3.jpg',
              },
            ],
          },
        ],
      };
      promotionRepository.update.mockResolvedValue(mockPromotion);

      await service.update('promo-123', {
        bundleDealConfig: updatedConfig,
      } as any);

      expect(bundleDealHandler.validate).toHaveBeenCalled();
      expect(promotionRepository.update).toHaveBeenCalledWith(
        'promo-123',
        expect.objectContaining({ bundleDealConfig: expect.any(Object) }),
      );
    });

    it('should return null when update fails', async () => {
      promotionRepository.findById.mockResolvedValue(mockPromotion);
      promotionRepository.update.mockResolvedValue(null);

      const result = await service.update('promo-123', updateDto as any);

      expect(result).toBeNull();
    });
  });

  describe('pause', () => {
    it('should pause active promotion', async () => {
      const activePromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000), // 1 day ago
        endTime: new Date(Date.now() + 86400000), // 1 day ahead
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValue(activePromotion);
      promotionRepository.update.mockResolvedValue({
        ...activePromotion,
        isEnabled: false,
      });

      const result = await service.pause('promo-123');

      expect(promotionRepository.update).toHaveBeenCalledWith('promo-123', {
        isEnabled: false,
      });
      expect(result!.status).toBe(PromotionStatus.PAUSED);
    });

    it('should pause upcoming promotion', async () => {
      const upcomingPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() + 86400000), // 1 day ahead
        endTime: new Date(Date.now() + 172800000), // 2 days ahead
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValue(upcomingPromotion);
      promotionRepository.update.mockResolvedValue({
        ...upcomingPromotion,
        isEnabled: false,
      });

      const result = await service.pause('promo-123');

      expect(result!.status).toBe(PromotionStatus.PAUSED);
    });

    it('should throw error when promotion not found', async () => {
      promotionRepository.findById.mockResolvedValue(null);

      await expect(service.pause('nonexistent')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.notFound');
    });

    it('should throw error when pausing already paused promotion', async () => {
      const pausedPromotion = {
        ...mockPromotion,
        isEnabled: false,
      };
      promotionRepository.findById.mockResolvedValue(pausedPromotion);

      await expect(service.pause('promo-123')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.cannotPause');
    });

    it('should throw error when pausing ended promotion', async () => {
      const endedPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 172800000), // 2 days ago
        endTime: new Date(Date.now() - 86400000), // 1 day ago
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValue(endedPromotion);

      await expect(service.pause('promo-123')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.cannotPause');
    });
  });

  describe('resume', () => {
    it('should resume paused promotion', async () => {
      const pausedPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000), // 1 day ago
        endTime: new Date(Date.now() + 86400000), // 1 day ahead
        isEnabled: false,
      };
      promotionRepository.findById.mockResolvedValue(pausedPromotion);
      promotionRepository.update.mockResolvedValue({
        ...pausedPromotion,
        isEnabled: true,
      });

      const result = await service.resume('promo-123');

      expect(promotionRepository.update).toHaveBeenCalledWith('promo-123', {
        isEnabled: true,
      });
      expect(result!.status).toBe(PromotionStatus.ACTIVE);
    });

    it('should throw error when promotion not found', async () => {
      promotionRepository.findById.mockResolvedValue(null);

      await expect(service.resume('nonexistent')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.notFound');
    });

    it('should throw error when resuming active promotion', async () => {
      const activePromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000), // 1 day ago
        endTime: new Date(Date.now() + 86400000), // 1 day ahead
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValue(activePromotion);

      await expect(service.resume('promo-123')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.cannotResume');
    });

    it('should allow resuming paused ended promotion (status becomes ENDED)', async () => {
      const endedPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 172800000), // 2 days ago
        endTime: new Date(Date.now() - 86400000), // 1 day ago
        isEnabled: false,
      };
      promotionRepository.findById.mockResolvedValue(endedPromotion);
      promotionRepository.update.mockResolvedValue({
        ...endedPromotion,
        isEnabled: true,
      });

      const result = await service.resume('promo-123');

      // After resuming, status is ENDED (because endTime passed)
      expect(result!.status).toBe(PromotionStatus.ENDED);
    });

    it('should allow resuming paused upcoming promotion (status becomes UPCOMING)', async () => {
      const upcomingPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() + 86400000), // 1 day ahead
        endTime: new Date(Date.now() + 172800000), // 2 days ahead
        isEnabled: false,
      };
      promotionRepository.findById.mockResolvedValue(upcomingPromotion);
      promotionRepository.update.mockResolvedValue({
        ...upcomingPromotion,
        isEnabled: true,
      });

      const result = await service.resume('promo-123');

      // After resuming, status is UPCOMING (because startTime not reached)
      expect(result!.status).toBe(PromotionStatus.UPCOMING);
    });
  });

  describe('delete', () => {
    it('should soft delete promotion', async () => {
      promotionRepository.softDelete.mockResolvedValue(true);

      const result = await service.delete('promo-123');

      expect(promotionRepository.softDelete).toHaveBeenCalledWith('promo-123');
      expect(result).toBe(true);
    });

    it('should throw error when promotion not found', async () => {
      promotionRepository.softDelete.mockResolvedValue(false);

      await expect(service.delete('nonexistent')).rejects.toThrow();

      expect(i18nService.t).toHaveBeenCalledWith('promotion.notFound');
    });
  });

  describe('getActiveBundleDeals', () => {
    it('should get active bundle deals with status', async () => {
      const activePromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isEnabled: true,
      };
      promotionRepository.findActiveByType.mockResolvedValue([activePromotion]);

      const result = await service.getActiveBundleDeals();

      expect(promotionRepository.findActiveByType).toHaveBeenCalledWith(
        PromotionType.BUNDLE_DEAL,
      );
      expect(result).toHaveLength(1);
      expect(result[0]!.status).toBe(PromotionStatus.ACTIVE);
    });

    it('should return empty array when no active bundle deals', async () => {
      promotionRepository.findActiveByType.mockResolvedValue([]);

      const result = await service.getActiveBundleDeals();

      expect(result).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should handle promotion lifecycle: create -> pause -> resume -> delete', async () => {
      // Create
      promotionRepository.existsByName.mockResolvedValue(false);
      bundleDealHandler.validate.mockResolvedValue(undefined);
      const newPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isEnabled: true,
      };
      promotionRepository.create.mockResolvedValue(newPromotion);

      const created = await service.create({
        type: PromotionType.BUNDLE_DEAL,
        name: 'Lifecycle Test',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        bundleDealConfig: {
          subType: BundleDealSubType.BUY_TO_GET_GIFT,
          tiers: [
            {
              minOrderValue: 100000,
              giftProducts: [
                {
                  productId: 'product-1',
                  name: 'Gift Product 1',
                  image: 'https://example.com/image1.jpg',
                },
              ],
            },
          ],
        },
      } as any);

      expect(created.status).toBe(PromotionStatus.ACTIVE);

      // Pause
      promotionRepository.findById.mockResolvedValue(newPromotion);
      promotionRepository.update.mockResolvedValue({
        ...newPromotion,
        isEnabled: false,
      });

      const paused = await service.pause('promo-123');
      expect(paused!.status).toBe(PromotionStatus.PAUSED);

      // Resume
      const pausedPromotion = { ...newPromotion, isEnabled: false };
      promotionRepository.findById.mockResolvedValue(pausedPromotion);
      promotionRepository.update.mockResolvedValue({
        ...pausedPromotion,
        isEnabled: true,
      });

      const resumed = await service.resume('promo-123');
      expect(resumed!.status).toBe(PromotionStatus.ACTIVE);

      // Delete
      promotionRepository.softDelete.mockResolvedValue(true);
      const deleted = await service.delete('promo-123');
      expect(deleted).toBe(true);
    });

    it('should compute correct status for different time ranges', async () => {
      // UPCOMING
      const upcomingPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 172800000),
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValueOnce(upcomingPromotion);

      const upcoming = await service.findById('promo-1');
      expect(upcoming!.status).toBe(PromotionStatus.UPCOMING);

      // ACTIVE
      const activePromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValueOnce(activePromotion);

      const active = await service.findById('promo-2');
      expect(active!.status).toBe(PromotionStatus.ACTIVE);

      // ENDED
      const endedPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 172800000),
        endTime: new Date(Date.now() - 86400000),
        isEnabled: true,
      };
      promotionRepository.findById.mockResolvedValueOnce(endedPromotion);

      const ended = await service.findById('promo-3');
      expect(ended!.status).toBe(PromotionStatus.ENDED);

      // PAUSED
      const pausedPromotion = {
        ...mockPromotion,
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() + 86400000),
        isEnabled: false,
      };
      promotionRepository.findById.mockResolvedValueOnce(pausedPromotion);

      const paused = await service.findById('promo-4');
      expect(paused!.status).toBe(PromotionStatus.PAUSED);
    });

    it('should handle multiple bundle deal tiers', async () => {
      promotionRepository.existsByName.mockResolvedValue(false);
      bundleDealHandler.validate.mockResolvedValue(undefined);
      const multiTierPromotion = {
        ...mockPromotion,
        bundleDealConfig: {
          subType: BundleDealSubType.BUY_TO_GET_GIFT,
          tiers: [
            {
              minOrderValue: 100000,
              giftProducts: [
                {
                  productId: 'gift-1',
                  name: 'Gift gift-1',
                  image: 'https://example.com/gift-1.jpg',
                },
              ],
            },
            {
              minOrderValue: 200000,
              giftProducts: [
                {
                  productId: 'gift-2',
                  name: 'Gift gift-2',
                  image: 'https://example.com/gift-2.jpg',
                },
              ],
            },
            {
              minOrderValue: 300000,
              giftProducts: [
                {
                  productId: 'gift-3',
                  name: 'Gift gift-3',
                  image: 'https://example.com/gift-3.jpg',
                },
              ],
            },
          ],
          notApplicableWithOtherPromotions: false,
        },
      };
      promotionRepository.create.mockResolvedValue(multiTierPromotion);

      const created = await service.create({
        type: PromotionType.BUNDLE_DEAL,
        name: 'Multi-tier Bundle Deal',
        startTime: '2024-06-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
        bundleDealConfig: multiTierPromotion.bundleDealConfig,
      } as any);

      expect(created.bundleDealConfig!.tiers).toHaveLength(3);
    });
  });
});
