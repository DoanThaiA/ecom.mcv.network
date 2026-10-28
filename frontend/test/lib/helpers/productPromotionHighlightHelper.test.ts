import { describe, expect, it } from 'vitest';
import {
  BundleDealSubType,
  DiscountType,
} from '@/types/gen/shared/shared/common/enums';
import type { ProductPromotionGiftPromotion } from '@/types/gen/shop/shop/shop/shop';
import {
  buildGiftProductHighlights,
  filterActivePromotionHighlights,
  filterGiftPromotionsForProduct,
  formatPromotionDiscountValue,
  formatPromotionEndDate,
  sortPromotionHighlights,
} from '@/lib/helpers/productPromotionHighlightHelper';

const createGiftPromotion = (
  overrides: Partial<ProductPromotionGiftPromotion>,
): ProductPromotionGiftPromotion => ({
  promotionId: 'promotion-1',
  promotionName: 'Gift promotion',
  subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
  tiers: [],
  requiredProducts: [],
  giftProducts: [],
  notApplicableWithOtherPromotions: false,
  endTime: new Date('2026-08-01T00:00:00.000Z'),
  ...overrides,
});

describe('productPromotionHighlightHelper', () => {
  it('formats numeric proto discount enums correctly', () => {
    expect(
      formatPromotionDiscountValue(
        DiscountType.DISCOUNT_TYPE_PERCENTAGE,
        15,
      ),
    ).toBe('15%');
    expect(
      formatPromotionDiscountValue(
        DiscountType.DISCOUNT_TYPE_PERCENTAGE,
        7.5,
      ),
    ).toBe('7.5%');
    expect(
      formatPromotionDiscountValue(DiscountType.DISCOUNT_TYPE_FIXED, 80000),
    ).toBe('80.000đ');
  });

  it('formats end dates in the business timezone and active locale', () => {
    const endTime = new Date('2026-07-31T17:30:00.000Z');

    expect(formatPromotionEndDate(endTime, 'vi')).toBe('01/08/2026');
    expect(formatPromotionEndDate(endTime, 'en')).toBe('08/01/2026');
  });

  it('keeps buy-to-get-gift globally and filters buy-x-get-y by current product', () => {
    const globalPromotion = createGiftPromotion({ promotionId: 'global' });
    const matchingBuyX = createGiftPromotion({
      promotionId: 'matching',
      subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
      requiredProducts: [
        {
          productId: 'product-a',
          name: 'Product A',
          image: '',
          originalPrice: 100000,
          isAvailable: true,
        },
      ],
    });
    const unrelatedBuyX = createGiftPromotion({
      promotionId: 'unrelated',
      subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
      requiredProducts: [
        {
          productId: 'product-b',
          name: 'Product B',
          image: '',
          originalPrice: 100000,
          isAvailable: true,
        },
      ],
    });

    const result = filterGiftPromotionsForProduct(
      [globalPromotion, matchingBuyX, unrelatedBuyX],
      'product-a',
    );

    expect(result.map((promotion) => promotion.promotionId)).toEqual([
      'global',
      'matching',
    ]);
  });

  it('builds gift cards for every configured gift and preserves availability', () => {
    const promotion = createGiftPromotion({
      tiers: [
        {
          minimumOrderValue: 500000,
          giftProducts: [
            {
              productId: 'available-gift',
              name: 'Available gift',
              image: '/gift.jpg',
              originalPrice: 99000,
              isAvailable: true,
            },
            {
              productId: 'unavailable-gift',
              name: 'Unavailable gift',
              image: '/gift-2.jpg',
              originalPrice: 99000,
              isAvailable: false,
            },
          ],
        },
      ],
    });

    const result = buildGiftProductHighlights([promotion]);

    expect(result).toHaveLength(2);
    expect(result.map((gift) => gift.product)).toEqual([
      expect.objectContaining({
        productId: 'available-gift',
        isAvailable: true,
      }),
      expect.objectContaining({
        productId: 'unavailable-gift',
        isAvailable: false,
      }),
    ]);
  });

  it('sorts promotions by the soonest end time', () => {
    const result = sortPromotionHighlights([
      { id: 'later', endTime: new Date('2026-09-01T00:00:00.000Z') },
      { id: 'sooner', endTime: new Date('2026-08-01T00:00:00.000Z') },
    ]);

    expect(result.map((promotion) => promotion.id)).toEqual([
      'sooner',
      'later',
    ]);
  });

  it('filters promotions that expired while a cached response was in flight', () => {
    const result = filterActivePromotionHighlights(
      [
        { id: 'expired', endTime: new Date('2026-08-01T00:00:00.000Z') },
        { id: 'active', endTime: new Date('2026-08-03T00:00:00.000Z') },
      ],
      new Date('2026-08-02T00:00:00.000Z'),
    );

    expect(result.map((promotion) => promotion.id)).toEqual(['active']);
  });
});
