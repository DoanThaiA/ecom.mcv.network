import orderBy from 'lodash/orderBy';
import {
  BundleDealSubType,
  DiscountType,
} from '@/types/gen/shared/shared/common/enums';
import type {
  ProductPromotionGiftProduct,
  ProductPromotionGiftPromotion,
  ProductPromotionShippingPromotion,
  ProductPromotionShippingTier,
} from '@/types/gen/shop/shop/shop/shop';
import { formatDate, formatPercentage, formatPrice } from '@/lib/utils/format';

type PromotionWithEndTime = {
  endTime?: Date | string;
};

const PROMOTION_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export interface GiftProductHighlight {
  key: string;
  promotionId: string;
  promotionName: string;
  product: ProductPromotionGiftProduct;
  subType: BundleDealSubType;
  minimumOrderValue?: number;
  requiredQuantity?: number;
  giftQuantity?: number;
  notApplicableWithOtherPromotions: boolean;
  endTime?: Date | string;
}

const toTimestamp = (value?: Date | string): number => {
  if (!value) return Number.POSITIVE_INFINITY;

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export const formatPromotionDiscountValue = (
  discountType: DiscountType,
  discountValue: number,
): string => {
  if (discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE) {
    return formatPercentage(discountValue, 2).replace(/\.?0+%$/, '%');
  }

  return formatPrice(discountValue);
};

export const formatPromotionEndDate = (
  endTime: Date | string | undefined,
  locale: string,
): string | null => {
  if (!endTime) return null;
  return formatDate(endTime, 'short', PROMOTION_TIME_ZONE, locale) || null;
};

export const sortPromotionHighlights = <T extends PromotionWithEndTime>(
  promotions: T[],
): T[] => orderBy(promotions, [(promotion) => toTimestamp(promotion.endTime)], ['asc']);

export const filterActivePromotionHighlights = <T extends PromotionWithEndTime>(
  promotions: T[],
  now: Date = new Date(),
): T[] => {
  const nowTimestamp = now.getTime();

  return promotions.filter((promotion) => {
    if (!promotion.endTime) return true;
    return toTimestamp(promotion.endTime) > nowTimestamp;
  });
};

export const getNearestPromotionEndTime = <T extends PromotionWithEndTime>(
  promotions: T[],
  after: Date,
): number | null => {
  const afterTimestamp = after.getTime();
  const futureEndTimes = promotions
    .map((promotion) => toTimestamp(promotion.endTime))
    .filter(
      (timestamp) =>
        Number.isFinite(timestamp) && timestamp > afterTimestamp,
    );

  return futureEndTimes.length > 0 ? Math.min(...futureEndTimes) : null;
};

export const getHighestShippingTier = (
  promotion: ProductPromotionShippingPromotion,
): ProductPromotionShippingTier | null =>
  orderBy(promotion.tiers, ['minimumOrderValue'], ['desc'])[0] ?? null;

export const filterGiftPromotionsForProduct = (
  promotions: ProductPromotionGiftPromotion[],
  productId: string,
): ProductPromotionGiftPromotion[] =>
  sortPromotionHighlights(
    promotions.filter((promotion) => {
      if (
        promotion.subType !==
        BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y
      ) {
        return true;
      }

      return (promotion.requiredProducts ?? []).some(
        (product) => product.productId === productId,
      );
    }),
  );

export const buildGiftProductHighlights = (
  promotions: ProductPromotionGiftPromotion[],
): GiftProductHighlight[] =>
  promotions.flatMap<GiftProductHighlight>((promotion) => {
    const common = {
      promotionId: promotion.promotionId,
      promotionName: promotion.promotionName,
      subType: promotion.subType,
      notApplicableWithOtherPromotions:
        promotion.notApplicableWithOtherPromotions,
      endTime: promotion.endTime,
    };

    if (
      promotion.subType ===
      BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT
    ) {
      return (promotion.tiers ?? []).flatMap((tier, tierIndex) =>
        (tier.giftProducts ?? []).map((product) => ({
          ...common,
          key: `${promotion.promotionId}-${tierIndex}-${product.productId}`,
          product,
          minimumOrderValue: tier.minimumOrderValue,
        })),
      );
    }

    if (
      promotion.subType ===
      BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y
    ) {
      return (promotion.giftProducts ?? []).map((product) => ({
        ...common,
        key: `${promotion.promotionId}-${product.productId}`,
        product,
        minimumOrderValue: promotion.minimumOrderValue,
        requiredQuantity: promotion.requiredQuantity,
        giftQuantity: promotion.giftQuantity,
      }));
    }

    return [];
  });
