import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ShippingPromotionsService } from '../../src/shipping-promotions/shipping-promotions.service';
import { ShippingPromotionRepository } from '../../src/shipping-promotions/domain/shipping-promotion.repository';
import { ShippingPromotion } from '../../src/shipping-promotions/domain/shipping-promotion';
import { ShippingPromotionType } from '../../src/shipping-promotions/domain/shipping-promotion-type.enum';
import { DiscountType } from '../../src/combos/domain/discount-type.enum';
import { CreateShippingPromotionDto } from '../../src/shipping-promotions/dto/create-shipping-promotion.dto';
import { UpdateShippingPromotionDto } from '../../src/shipping-promotions/dto/update-shipping-promotion.dto';

describe('ShippingPromotionsService', () => {
  let service: ShippingPromotionsService;
  let repository: jest.Mocked<ShippingPromotionRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockFreeshipPromotion: ShippingPromotion = {
    id: 'promo-1',
    type: ShippingPromotionType.FREESHIP,
    name: 'Free Shipping Over 500K',
    startTime: new Date('2025-06-01T00:00:00Z'),
    endTime: new Date('2025-06-30T23:59:59Z'),
    isEnabled: true,
    freeshippingConfig: { minimumOrderValue: 500000 },
    shippingDiscountConfig: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockDiscountPromotion: ShippingPromotion = {
    id: 'promo-2',
    type: ShippingPromotionType.SHIPPING_DISCOUNT,
    name: 'Tiered Shipping Discount',
    startTime: new Date('2025-06-01T00:00:00Z'),
    endTime: new Date('2025-06-30T23:59:59Z'),
    isEnabled: true,
    freeshippingConfig: null,
    shippingDiscountConfig: {
      tiers: [
        {
          minimumOrderValue: 200000,
          discountType: DiscountType.FIXED,
          discountValue: 10000,
        },
        {
          minimumOrderValue: 500000,
          discountType: DiscountType.FIXED,
          discountValue: 20000,
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findActiveForCheckout: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingPromotionsService,
        {
          provide: ShippingPromotionRepository,
          useValue: mockRepository,
        },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ShippingPromotionsService>(ShippingPromotionsService);
    repository = module.get(ShippingPromotionRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CRUD Tests ====================

  describe('create', () => {
    it('should create a freeship promotion successfully', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.FREESHIP,
        name: 'Free Shipping Over 500K',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
        freeshippingConfig: { minimumOrderValue: 500000 },
      };

      repository.create.mockResolvedValue(mockFreeshipPromotion);

      const result = await service.create(dto);

      expect(result).toHaveProperty('id', 'promo-1');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ShippingPromotionType.FREESHIP,
          name: dto.name,
          isEnabled: true,
        }),
      );
    });

    it('should create a shipping discount promotion successfully', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.SHIPPING_DISCOUNT,
        name: 'Tiered Discount',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
        shippingDiscountConfig: {
          tiers: [
            {
              minimumOrderValue: 200000,
              discountType: DiscountType.FIXED,
              discountValue: 10000,
            },
          ],
        },
      };

      repository.create.mockResolvedValue(mockDiscountPromotion);

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw error when start time is after end time', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.FREESHIP,
        name: 'Invalid',
        startTime: '2025-06-30T00:00:00Z',
        endTime: '2025-06-01T00:00:00Z',
        freeshippingConfig: { minimumOrderValue: 500000 },
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when start time equals end time', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.FREESHIP,
        name: 'Invalid',
        startTime: '2025-06-15T00:00:00Z',
        endTime: '2025-06-15T00:00:00Z',
        freeshippingConfig: { minimumOrderValue: 500000 },
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when freeship config is missing for freeship type', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.FREESHIP,
        name: 'Missing Config',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when shipping discount config is missing for shipping_discount type', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.SHIPPING_DISCOUNT,
        name: 'Missing Config',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when percentage discount exceeds 100', async () => {
      const dto: CreateShippingPromotionDto = {
        type: ShippingPromotionType.SHIPPING_DISCOUNT,
        name: 'Invalid Percentage',
        startTime: '2025-06-01T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
        shippingDiscountConfig: {
          tiers: [
            {
              minimumOrderValue: 200000,
              discountType: DiscountType.PERCENTAGE,
              discountValue: 150,
            },
          ],
        },
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findOne', () => {
    it('should return promotion when found', async () => {
      repository.findById.mockResolvedValue(mockFreeshipPromotion);

      const result = await service.findOne('promo-1');

      expect(result).toHaveProperty('id', 'promo-1');
      expect(repository.findById).toHaveBeenCalledWith('promo-1');
    });

    it('should throw error when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('update', () => {
    it('should update promotion successfully', async () => {
      const dto: UpdateShippingPromotionDto = { name: 'Updated Name' };
      const updated = { ...mockFreeshipPromotion, name: 'Updated Name' };

      repository.findById.mockResolvedValue(mockFreeshipPromotion);
      repository.update.mockResolvedValue(updated);

      const result = await service.update('promo-1', dto);

      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should throw error when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'test' }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should validate time range when updating dates', async () => {
      repository.findById.mockResolvedValue(mockFreeshipPromotion);

      await expect(
        service.update('promo-1', {
          startTime: '2025-06-30T00:00:00Z',
          endTime: '2025-06-01T00:00:00Z',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should validate against existing dates when only updating one', async () => {
      repository.findById.mockResolvedValue(mockFreeshipPromotion);

      await expect(
        service.update('promo-1', {
          endTime: '2025-05-01T00:00:00Z',
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete successfully', async () => {
      repository.findById.mockResolvedValue(mockFreeshipPromotion);
      repository.softDelete.mockResolvedValue(true);

      await service.remove('promo-1');

      expect(repository.softDelete).toHaveBeenCalledWith('promo-1');
    });

    it('should throw error when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle enabled to false', async () => {
      repository.findById.mockResolvedValue(mockFreeshipPromotion);
      repository.update.mockResolvedValue({
        ...mockFreeshipPromotion,
        isEnabled: false,
      });

      await service.toggleEnabled('promo-1');

      expect(repository.update).toHaveBeenCalledWith('promo-1', {
        isEnabled: false,
      });
    });

    it('should toggle enabled to true', async () => {
      const disabled = { ...mockFreeshipPromotion, isEnabled: false };
      repository.findById.mockResolvedValue(disabled);
      repository.update.mockResolvedValue({
        ...mockFreeshipPromotion,
        isEnabled: true,
      });

      await service.toggleEnabled('promo-1');

      expect(repository.update).toHaveBeenCalledWith('promo-1', {
        isEnabled: true,
      });
    });

    it('should throw error when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.toggleEnabled('non-existent')).rejects.toMatchObject(
        { status: HttpStatus.NOT_FOUND },
      );
    });
  });

  // ==================== calculateShippingDiscount Tests ====================

  describe('calculateShippingDiscount', () => {
    const shippingFee = 30000;

    describe('general', () => {
      it('should return 0 when shipping fee is 0', () => {
        const result = service.calculateShippingDiscount(
          mockFreeshipPromotion,
          600000,
          0,
        );
        expect(result).toBe(0);
      });

      it('should return 0 when shipping fee is negative', () => {
        const result = service.calculateShippingDiscount(
          mockFreeshipPromotion,
          600000,
          -1000,
        );
        expect(result).toBe(0);
      });
    });

    describe('FREESHIP type', () => {
      it('should return full shipping fee when subtotal meets threshold', () => {
        const result = service.calculateShippingDiscount(
          mockFreeshipPromotion,
          500000,
          shippingFee,
        );
        expect(result).toBe(shippingFee);
      });

      it('should return full shipping fee when subtotal exceeds threshold', () => {
        const result = service.calculateShippingDiscount(
          mockFreeshipPromotion,
          1000000,
          shippingFee,
        );
        expect(result).toBe(shippingFee);
      });

      it('should return 0 when subtotal is below threshold', () => {
        const result = service.calculateShippingDiscount(
          mockFreeshipPromotion,
          400000,
          shippingFee,
        );
        expect(result).toBe(0);
      });

      it('should return 0 when freeshippingConfig is null', () => {
        const promo = {
          ...mockFreeshipPromotion,
          freeshippingConfig: null,
        };
        const result = service.calculateShippingDiscount(
          promo,
          600000,
          shippingFee,
        );
        expect(result).toBe(0);
      });
    });

    describe('SHIPPING_DISCOUNT type - FIXED', () => {
      it('should return fixed discount for matching tier', () => {
        // subtotal 300K matches tier at 200K (discount 10K)
        const result = service.calculateShippingDiscount(
          mockDiscountPromotion,
          300000,
          shippingFee,
        );
        expect(result).toBe(10000);
      });

      it('should return highest applicable tier discount', () => {
        // subtotal 600K matches both tiers, highest tier (500K) gives 20K
        const result = service.calculateShippingDiscount(
          mockDiscountPromotion,
          600000,
          shippingFee,
        );
        expect(result).toBe(20000);
      });

      it('should return 0 when subtotal below all tiers', () => {
        const result = service.calculateShippingDiscount(
          mockDiscountPromotion,
          100000,
          shippingFee,
        );
        expect(result).toBe(0);
      });

      it('should cap discount at shipping fee', () => {
        const promoWithHighDiscount: ShippingPromotion = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: {
            tiers: [
              {
                minimumOrderValue: 100000,
                discountType: DiscountType.FIXED,
                discountValue: 50000, // More than shipping fee
              },
            ],
          },
        };
        const result = service.calculateShippingDiscount(
          promoWithHighDiscount,
          200000,
          shippingFee,
        );
        expect(result).toBe(shippingFee);
      });
    });

    describe('SHIPPING_DISCOUNT type - PERCENTAGE', () => {
      const percentagePromotion: ShippingPromotion = {
        ...mockDiscountPromotion,
        shippingDiscountConfig: {
          tiers: [
            {
              minimumOrderValue: 200000,
              discountType: DiscountType.PERCENTAGE,
              discountValue: 50, // 50%
            },
          ],
        },
      };

      it('should calculate percentage discount on shipping fee', () => {
        // 30000 * 50% = 15000
        const result = service.calculateShippingDiscount(
          percentagePromotion,
          300000,
          shippingFee,
        );
        expect(result).toBe(15000);
      });

      it('should round percentage discount to nearest hundred', () => {
        // 35000 * 15% = 5250 -> roundToNearestHundred -> 5200
        const promoWithOddPercentage: ShippingPromotion = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: {
            tiers: [
              {
                minimumOrderValue: 100000,
                discountType: DiscountType.PERCENTAGE,
                discountValue: 15,
              },
            ],
          },
        };
        const result = service.calculateShippingDiscount(
          promoWithOddPercentage,
          200000,
          35000,
        );
        expect(result).toBe(5300); // 35000 * 15% = 5250 -> rounds to 5300
      });

      it('should cap percentage discount at shipping fee', () => {
        const promo100Percent: ShippingPromotion = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: {
            tiers: [
              {
                minimumOrderValue: 100000,
                discountType: DiscountType.PERCENTAGE,
                discountValue: 100,
              },
            ],
          },
        };
        const result = service.calculateShippingDiscount(
          promo100Percent,
          200000,
          shippingFee,
        );
        expect(result).toBe(shippingFee);
      });

      it('should round to nearest hundred before capping', () => {
        // 33000 * 33% = 10890 -> roundToNearestHundred -> 10900
        const promoOdd: ShippingPromotion = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: {
            tiers: [
              {
                minimumOrderValue: 100000,
                discountType: DiscountType.PERCENTAGE,
                discountValue: 33,
              },
            ],
          },
        };
        const result = service.calculateShippingDiscount(
          promoOdd,
          200000,
          33000,
        );
        expect(result).toBe(10900);
      });
    });

    describe('SHIPPING_DISCOUNT type - edge cases', () => {
      it('should return 0 when shippingDiscountConfig is null', () => {
        const promo = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: null,
        };
        const result = service.calculateShippingDiscount(
          promo,
          600000,
          shippingFee,
        );
        expect(result).toBe(0);
      });

      it('should return 0 when tiers array is empty', () => {
        const promo: ShippingPromotion = {
          ...mockDiscountPromotion,
          shippingDiscountConfig: { tiers: [] },
        };
        const result = service.calculateShippingDiscount(
          promo,
          600000,
          shippingFee,
        );
        expect(result).toBe(0);
      });

      it('should select tier with exact matching subtotal', () => {
        // subtotal exactly 200000, matches first tier
        const result = service.calculateShippingDiscount(
          mockDiscountPromotion,
          200000,
          shippingFee,
        );
        expect(result).toBe(10000);
      });

      it('should select tier with exact matching at highest tier', () => {
        // subtotal exactly 500000, matches both tiers, should pick highest (500K->20K)
        const result = service.calculateShippingDiscount(
          mockDiscountPromotion,
          500000,
          shippingFee,
        );
        expect(result).toBe(20000);
      });
    });
  });
});
