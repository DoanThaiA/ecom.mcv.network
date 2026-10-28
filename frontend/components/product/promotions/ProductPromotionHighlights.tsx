'use client';

import { Box, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { ProductPromotionHighlightsResponse } from '@/types/gen/shop/shop/shop/shop';
import {
  buildGiftProductHighlights,
  filterActivePromotionHighlights,
  filterGiftPromotionsForProduct,
  getNearestPromotionEndTime,
} from '@/lib/helpers/productPromotionHighlightHelper';
import { GiftPromotionSection } from './GiftPromotionSection';
import { OrderDiscountRow } from './OrderDiscountRow';
import { ShippingPromotionRow } from './ShippingPromotionRow';

interface ProductPromotionHighlightsProps {
  highlights: ProductPromotionHighlightsResponse;
  productId: string;
  evaluatedAt?: string;
}

const MAX_TIMER_DELAY_MS = 2_147_000_000;
const EXPIRATION_GRACE_MS = 50;

export function ProductPromotionHighlights({
  highlights,
  productId,
  evaluatedAt,
}: ProductPromotionHighlightsProps) {
  const t = useTranslations('productDetail.promotions');
  const [evaluationTime, setEvaluationTime] = useState(() =>
    evaluatedAt ? new Date(evaluatedAt) : new Date(),
  );

  useEffect(() => {
    const nearestEndTime = getNearestPromotionEndTime(
      [
        ...highlights.shippingPromotions,
        ...highlights.orderDiscounts,
        ...highlights.giftPromotions,
      ],
      evaluationTime,
    );
    if (nearestEndTime === null) return;

    const delay = Math.min(
      Math.max(nearestEndTime - Date.now() + EXPIRATION_GRACE_MS, 0),
      MAX_TIMER_DELAY_MS,
    );
    const timer = window.setTimeout(() => setEvaluationTime(new Date()), delay);
    return () => window.clearTimeout(timer);
  }, [evaluationTime, highlights]);

  const shippingPromotions = filterActivePromotionHighlights(
    highlights.shippingPromotions,
    evaluationTime,
  );
  const orderDiscounts = filterActivePromotionHighlights(
    highlights.orderDiscounts,
    evaluationTime,
  );
  const giftPromotions = filterGiftPromotionsForProduct(
    filterActivePromotionHighlights(highlights.giftPromotions, evaluationTime),
    productId,
  );
  const hasGiftHighlights = buildGiftProductHighlights(giftPromotions).length > 0;
  const hasHighlights =
    shippingPromotions.length > 0 ||
    orderDiscounts.length > 0 ||
    hasGiftHighlights;

  if (!hasHighlights) return null;

  return (
    <Box
      role="region"
      aria-label={t('title')}
      className="mb-3 mt-3 w-full min-w-0 max-w-full border-y border-gray-100 py-3"
    >
      <Flex direction="column" gap="3">
        <ShippingPromotionRow promotions={shippingPromotions} />
        <OrderDiscountRow promotions={orderDiscounts} />
        {hasGiftHighlights && <GiftPromotionSection promotions={giftPromotions} />}
      </Flex>
    </Box>
  );
}
