import { describe, expect, it } from 'vitest';
import {
  BundleDealSubType,
  DiscountType,
  OrderDiscountSubType,
  ShippingPromotionType,
} from '@/types/gen/shared/shared/common/enums';
import { parseProductPromotionHighlightsResponse } from '@/lib/helpers/productPromotionHighlightResponseHelper';
import {
  ProductPromotionHighlightsResponse,
  ShopPromotionServiceDefinition,
} from '@/types/gen/shop/shop/shop/shop';

describe('parseProductPromotionHighlightsResponse', () => {
  it('preserves proto-compatible numeric enums', () => {
    const result = parseProductPromotionHighlightsResponse({
      productId: 'product-1',
      shippingPromotions: [
        {
          promotionId: 'shipping-1',
          promotionName: 'Shipping offer',
          type: ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
          tiers: [],
          endTime: '2026-08-30T00:00:00.000Z',
        },
      ],
      orderDiscounts: [
        {
          promotionId: 'order-1',
          promotionName: 'Order offer',
          subType: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE,
          discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
          discountValue: 10,
          minimumOrderValue: 100000,
          notApplicableWithOtherPromotions: false,
          singleUsePerCustomer: false,
        },
      ],
      giftPromotions: [],
    });

    expect(result?.shippingPromotions[0].type).toBe(
      ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
    );
    expect(result?.shippingPromotions[0].endTime).toBeInstanceOf(Date);
    expect(result?.orderDiscounts[0].discountType).toBe(
      DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    );
  });

  it('normalizes legacy backend string enums defensively', () => {
    const result = parseProductPromotionHighlightsResponse({
      productId: 'product-1',
      shippingPromotions: [
        {
          promotionId: 'shipping-1',
          promotionName: 'Shipping offer',
          type: 'shipping_discount',
          tiers: [
            {
              minimumOrderValue: 200000,
              discountType: 'percentage',
              discountValue: 20,
            },
          ],
        },
      ],
      orderDiscounts: [
        {
          promotionId: 'order-1',
          promotionName: 'Order offer',
          subType: 'promo_code',
          discountType: 'fixed',
          discountValue: 50000,
          minimumOrderValue: 299000,
          notApplicableWithOtherPromotions: false,
          singleUsePerCustomer: false,
        },
      ],
      giftPromotions: [
        {
          promotionId: 'gift-1',
          promotionName: 'Gift offer',
          subType: 'buy_x_get_y',
          requiredProducts: [],
          giftProducts: [],
          tiers: [],
          notApplicableWithOtherPromotions: false,
        },
      ],
    });

    expect(result?.shippingPromotions[0].type).toBe(
      ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT,
    );
    expect(result?.shippingPromotions[0].tiers[0].discountType).toBe(
      DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    );
    expect(result?.orderDiscounts[0]).toMatchObject({
      subType: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE,
      discountType: DiscountType.DISCOUNT_TYPE_FIXED,
    });
    expect(result?.giftPromotions[0].subType).toBe(
      BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
    );
  });

  it('rejects malformed response envelopes', () => {
    expect(parseProductPromotionHighlightsResponse(null)).toBeNull();
    expect(
      parseProductPromotionHighlightsResponse({ productId: 'product-1' }),
    ).toBeNull();
  });

  it('drops malformed nested promotions without breaking valid highlights', () => {
    const result = parseProductPromotionHighlightsResponse({
      productId: 'product-1',
      shippingPromotions: [
        null,
        {
          promotionId: 'missing-tiers',
          promotionName: 'Malformed shipping offer',
          type: 'freeship',
        },
      ],
      orderDiscounts: [],
      giftPromotions: [
        {
          promotionId: 'missing-products',
          promotionName: 'Malformed gift offer',
          subType: 'buy_x_get_y',
          tiers: [],
          notApplicableWithOtherPromotions: false,
        },
      ],
    });

    expect(result).toEqual({
      productId: 'product-1',
      shippingPromotions: [],
      orderDiscounts: [],
      giftPromotions: [],
    });
  });

  it('keeps generated message functions and service metadata synchronized', () => {
    const message = ProductPromotionHighlightsResponse.create({
      productId: 'product-1',
      shippingPromotions: [],
      orderDiscounts: [],
      giftPromotions: [],
    });
    const decoded = ProductPromotionHighlightsResponse.decode(
      ProductPromotionHighlightsResponse.encode(message).finish(),
    );

    expect(decoded).toEqual(message);
    expect(
      ShopPromotionServiceDefinition.methods.getProductPromotionHighlights,
    ).toMatchObject({
      name: 'GetProductPromotionHighlights',
      requestStream: false,
      responseStream: false,
    });
  });
});
