'use client';

import { useLocale, useTranslations } from 'next-intl';
import { OrderDiscountSubType } from '@/types/gen/shared/shared/common/enums';
import type { ProductPromotionOrderDiscount } from '@/types/gen/shop/shop/shop/shop';
import { formatPromotionEndDate } from '@/lib/helpers/productPromotionHighlightHelper';
import { formatPrice } from '@/lib/utils/format';
import { PromotionDetailContent } from './PromotionDetailContent';

interface OrderDiscountDetailsProps {
  promotion: ProductPromotionOrderDiscount;
}

export function OrderDiscountDetails({
  promotion,
}: OrderDiscountDetailsProps) {
  const t = useTranslations('productDetail.promotions');
  const locale = useLocale();
  const conditions: string[] = [];

  if (promotion.minimumOrderValue > 0) {
    conditions.push(
      t('minimumOrder', { amount: formatPrice(promotion.minimumOrderValue) }),
    );
  }

  if (promotion.maxDiscountValue !== undefined) {
    conditions.push(
      t('maximumDiscount', {
        amount: formatPrice(promotion.maxDiscountValue),
      }),
    );
  }

  if (promotion.notApplicableWithOtherPromotions) {
    conditions.push(t('notStackable'));
  }

  if (promotion.singleUsePerCustomer) conditions.push(t('singleUse'));

  const endDate = formatPromotionEndDate(promotion.endTime, locale);
  if (endDate) conditions.push(t('promotionEnds', { date: endDate }));

  const promoCode =
    promotion.subType ===
    OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE
      ? promotion.promoCode
      : undefined;

  return (
    <PromotionDetailContent
      name={promotion.promotionName}
      conditions={conditions}
      promoCode={promoCode}
    />
  );
}
