import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { BundleDealHandler } from '../../src/promotions/handlers/bundle-deal.handler';
import { BundleDealConfig } from '../../src/promotions/domain/bundle-deal-config';
import { BundleDealSubType } from '../../src/promotions/domain/bundle-deal-sub-type.enum';

describe('BundleDealHandler', () => {
  let handler: BundleDealHandler;
  let i18n: jest.Mocked<I18nService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundleDealHandler,
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    handler = module.get<BundleDealHandler>(BundleDealHandler);
    i18n = module.get(I18nService) as jest.Mocked<I18nService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate - BUY_TO_GET_GIFT', () => {
    it('should validate valid BUY_TO_GET_GIFT config', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
        ],
      } as any as BundleDealConfig;

      await expect(handler.validate(config)).resolves.toBeUndefined();
    });

    it('should throw when subType is missing', async () => {
      const config = { subType: 0 } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith(
        'promotion.bundleDealSubTypeRequired',
      );
    });

    it('should throw when tiers are empty', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.atLeastOneTierRequired');
    });

    it('should throw when tier has invalid minOrderValue', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: -1,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
        ],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidMinOrderValue');
    });

    it('should throw when tier has no gift products', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [{ minOrderValue: 100000, giftProducts: [] }],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith(
        'promotion.atLeastOneGiftProductRequired',
      );
    });

    it('should throw when tiers are not in ascending order', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 200000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p2', name: 'Gift 2', image: 'img2' }],
          },
        ],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.tiersMustBeAscending');
    });
  });

  describe('validate - BUY_X_GET_Y', () => {
    const validBuyXGetYConfig = {
      subType: BundleDealSubType.BUY_X_GET_Y,
      requiredQuantity: 3,
      requiredProducts: [{ productId: 'p1', name: 'Prod 1', image: 'img1' }],
      giftQuantity: 1,
      giftProducts: [{ productId: 'g1', name: 'Gift 1', image: 'img1' }],
    } as any as BundleDealConfig;

    it('should validate valid BUY_X_GET_Y config', async () => {
      await expect(
        handler.validate(validBuyXGetYConfig),
      ).resolves.toBeUndefined();
    });

    it('should validate config with optional fields', async () => {
      const config = {
        ...validBuyXGetYConfig,
        minimumOrderValue: 500000,
        maxGiftQuantity: 10,
      } as any as BundleDealConfig;

      await expect(handler.validate(config)).resolves.toBeUndefined();
    });

    it('should throw when requiredQuantity is missing', async () => {
      const config = {
        ...validBuyXGetYConfig,
        requiredQuantity: undefined,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidRequiredQuantity');
    });

    it('should throw when requiredQuantity is 0', async () => {
      const config = {
        ...validBuyXGetYConfig,
        requiredQuantity: 0,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidRequiredQuantity');
    });

    it('should throw when requiredProducts is empty', async () => {
      const config = {
        ...validBuyXGetYConfig,
        requiredProducts: [],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith(
        'promotion.atLeastOneRequiredProductRequired',
      );
    });

    it('should throw when giftQuantity is missing', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftQuantity: undefined,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidGiftQuantity');
    });

    it('should throw when giftQuantity is 0', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftQuantity: 0,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidGiftQuantity');
    });

    it('should throw when giftProducts is empty', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftProducts: [],
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith(
        'promotion.atLeastOneGiftProductRequired',
      );
    });

    it('should throw when minimumOrderValue is negative', async () => {
      const config = {
        ...validBuyXGetYConfig,
        minimumOrderValue: -1,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidMinimumOrderValue');
    });

    it('should allow minimumOrderValue of 0', async () => {
      const config = {
        ...validBuyXGetYConfig,
        minimumOrderValue: 0,
      } as any as BundleDealConfig;

      await expect(handler.validate(config)).resolves.toBeUndefined();
    });

    it('should throw when maxGiftQuantity is 0', async () => {
      const config = {
        ...validBuyXGetYConfig,
        maxGiftQuantity: 0,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidMaxGiftQuantity');
    });

    it('should throw when maxGiftQuantity is less than giftQuantity', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftQuantity: 5,
        maxGiftQuantity: 3,
      } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.maxGiftQuantityTooLow');
    });

    it('should allow maxGiftQuantity equal to giftQuantity', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftQuantity: 5,
        maxGiftQuantity: 5,
      } as any as BundleDealConfig;

      await expect(handler.validate(config)).resolves.toBeUndefined();
    });

    it('should allow maxGiftQuantity greater than giftQuantity', async () => {
      const config = {
        ...validBuyXGetYConfig,
        giftQuantity: 2,
        maxGiftQuantity: 100,
      } as any as BundleDealConfig;

      await expect(handler.validate(config)).resolves.toBeUndefined();
    });
  });

  describe('validate - invalid subType', () => {
    it('should throw for unknown subType', async () => {
      const config = { subType: 99 } as any as BundleDealConfig;

      expect(() => handler.validate(config)).toThrow();
      expect(i18n.t).toHaveBeenCalledWith('promotion.invalidSubType');
    });
  });

  describe('checkEligibility', () => {
    it('should return qualifying tiers for BUY_TO_GET_GIFT', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
          {
            minOrderValue: 200000,
            giftProducts: [{ productId: 'p2', name: 'Gift 2', image: 'img2' }],
          },
        ],
      } as any as BundleDealConfig;

      const result = await handler.checkEligibility(150000, config);

      expect(result.eligible).toBe(true);
      expect(result.qualifyingTiers).toHaveLength(1);
      expect(result.qualifyingTiers[0].minOrderValue).toBe(100000);
    });

    it('should return all qualifying tiers when cart total exceeds all', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
          {
            minOrderValue: 200000,
            giftProducts: [{ productId: 'p2', name: 'Gift 2', image: 'img2' }],
          },
        ],
      } as any as BundleDealConfig;

      const result = await handler.checkEligibility(300000, config);

      expect(result.eligible).toBe(true);
      expect(result.qualifyingTiers).toHaveLength(2);
    });

    it('should return not eligible when cart total is below all tiers', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
        ],
      } as any as BundleDealConfig;

      const result = await handler.checkEligibility(50000, config);

      expect(result.eligible).toBe(false);
      expect(result.qualifyingTiers).toHaveLength(0);
    });

    it('should check minimumOrderValue for BUY_X_GET_Y', async () => {
      const config = {
        subType: BundleDealSubType.BUY_X_GET_Y,
        minimumOrderValue: 200000,
        requiredQuantity: 3,
        requiredProducts: [{ productId: 'p1', name: 'Prod', image: '' }],
        giftQuantity: 1,
        giftProducts: [{ productId: 'g1', name: 'Gift', image: '' }],
      } as any as BundleDealConfig;

      const eligible = await handler.checkEligibility(250000, config);
      expect(eligible.eligible).toBe(true);
      expect(eligible.qualifyingTiers).toHaveLength(0);

      const notEligible = await handler.checkEligibility(100000, config);
      expect(notEligible.eligible).toBe(false);
    });

    it('should be eligible when no minimumOrderValue for BUY_X_GET_Y', async () => {
      const config = {
        subType: BundleDealSubType.BUY_X_GET_Y,
        requiredQuantity: 3,
        requiredProducts: [{ productId: 'p1', name: 'Prod', image: '' }],
        giftQuantity: 1,
        giftProducts: [{ productId: 'g1', name: 'Gift', image: '' }],
      } as any as BundleDealConfig;

      const result = await handler.checkEligibility(0, config);
      expect(result.eligible).toBe(true);
    });
  });

  describe('enrich', () => {
    it('should return enriched config for BUY_X_GET_Y', async () => {
      const config = {
        subType: BundleDealSubType.BUY_X_GET_Y,
        requiredQuantity: 3,
        giftQuantity: 1,
        minimumOrderValue: 100000,
        maxGiftQuantity: 10,
        requiredProducts: [{ productId: 'p1', name: 'Prod', image: '' }],
        giftProducts: [{ productId: 'g1', name: 'Gift', image: '' }],
      } as any as BundleDealConfig;

      const result = await handler.enrich(config);

      expect(result.subType).toBe(BundleDealSubType.BUY_X_GET_Y);
      expect(result.requiredQuantity).toBe(3);
      expect(result.giftQuantity).toBe(1);
      expect(result.requiredProducts).toHaveLength(1);
      expect(result.giftProducts).toHaveLength(1);
    });

    it('should return enriched config for BUY_TO_GET_GIFT', async () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
        ],
      } as any as BundleDealConfig;

      const result = await handler.enrich(config);

      expect(result.subType).toBe(BundleDealSubType.BUY_TO_GET_GIFT);
      expect(result.tiers).toHaveLength(1);
    });
  });

  describe('getTierCount', () => {
    it('should return 1 for BUY_X_GET_Y', () => {
      const config = {
        subType: BundleDealSubType.BUY_X_GET_Y,
      } as any as BundleDealConfig;

      expect(handler.getTierCount(config)).toBe(1);
    });

    it('should return tier count for BUY_TO_GET_GIFT', () => {
      const config = {
        subType: BundleDealSubType.BUY_TO_GET_GIFT,
        tiers: [
          {
            minOrderValue: 100000,
            giftProducts: [{ productId: 'p1', name: 'Gift 1', image: 'img1' }],
          },
          {
            minOrderValue: 200000,
            giftProducts: [{ productId: 'p2', name: 'Gift 2', image: 'img2' }],
          },
        ],
      } as any as BundleDealConfig;

      expect(handler.getTierCount(config)).toBe(2);
    });

    it('should return 0 for null config', () => {
      expect(handler.getTierCount(null as any)).toBe(0);
    });
  });
});
