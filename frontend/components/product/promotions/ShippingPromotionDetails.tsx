'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ShippingPromotionType } from '@/types/gen/shared/shared/common/enums';
import type { ProductPromotionShippingPromotion } from '@/types/gen/shop/shop/shop/shop';
import {
  formatPromotionDiscountValue,
  formatPromotionEndDate,
} from '@/lib/helpers/productPromotionHighlightHelper';
import { formatPrice } from '@/lib/utils/format';
import { PromotionDetailContent } from './PromotionDetailContent';

interface ShippingPromotionDetailsProps {
  promotion: ProductPromotionShippingPromotion;
}

export function ShippingPromotionDetails({
  promotion,
}: ShippingPromotionDetailsProps) {
  const t = useTranslations('productDetail.promotions');
  const locale = useLocale();
  const conditions: string[] = [];

  if (
    promotion.type ===
      ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP &&
    promotion.minimumOrderValue !== undefined
  ) {
    conditions.push(
      t('minimumOrder', { amount: formatPrice(promotion.minimumOrderValue) }),
    );
  }

  if (
    promotion.type ===
    ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT
  ) {
    promotion.tiers.forEach((tier) => {
      conditions.push(
        t('shippingTierCondition', {
          amount: formatPrice(tier.minimumOrderValue),
          value: formatPromotionDiscountValue(
            tier.discountType,
            tier.discountValue,
          ),
        }),
      );
    });
  }

  const endDate = formatPromotionEndDate(promotion.endTime, locale);
  if (endDate) conditions.push(t('promotionEnds', { date: endDate }));

  return (
    <PromotionDetailContent
      name={promotion.promotionName}
      conditions={conditions}
    />
  );
}
