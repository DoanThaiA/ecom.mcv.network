'use client';

import { Flex, Separator, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { ShippingPromotionType } from '@/types/gen/shared/shared/common/enums';
import type { ProductPromotionShippingPromotion } from '@/types/gen/shop/shop/shop/shop';
import {
  formatPromotionDiscountValue,
  getHighestShippingTier,
  sortPromotionHighlights,
} from '@/lib/helpers/productPromotionHighlightHelper';
import { PromotionTagPopover } from './PromotionTagPopover';
import { ShippingPromotionDetails } from './ShippingPromotionDetails';

interface ShippingPromotionRowProps {
  promotions: ProductPromotionShippingPromotion[];
}

const MAX_VISIBLE_TAGS = 3;

export function ShippingPromotionRow({
  promotions,
}: ShippingPromotionRowProps) {
  const t = useTranslations('productDetail.promotions');
  const sortedPromotions = sortPromotionHighlights(promotions);
  const visiblePromotions = sortedPromotions.slice(0, MAX_VISIBLE_TAGS);
  const hiddenPromotions = sortedPromotions.slice(MAX_VISIBLE_TAGS);

  if (sortedPromotions.length === 0) return null;

  return (
    <Flex
      direction={{ initial: 'column', sm: 'row' }}
      gap="3"
      align={{ initial: 'stretch', sm: 'start' }}
      className="w-full"
    >
      <Text
        size="2"
        weight="medium"
        className="w-full shrink-0 text-gray-900 sm:w-[132px] sm:pt-1"
      >
        {t('shippingLabel')}
      </Text>
      <Flex gap="2" wrap="wrap" className="min-w-0 flex-1">
        {visiblePromotions.map((promotion) => {
          const highestTier = getHighestShippingTier(promotion);
          let label = promotion.promotionName;
          if (
            promotion.type ===
            ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP
          ) {
            label = t('freeShipping');
          } else if (highestTier) {
            label = t('shippingDiscount', {
              value: formatPromotionDiscountValue(
                highestTier.discountType,
                highestTier.discountValue,
              ),
            });
          }

          return (
            <PromotionTagPopover
              key={promotion.promotionId}
              label={label}
              ariaLabel={t('viewPromotionDetails', {
                promotion: promotion.promotionName,
              })}
            >
              <ShippingPromotionDetails promotion={promotion} />
            </PromotionTagPopover>
          );
        })}

        {hiddenPromotions.length > 0 && (
          <PromotionTagPopover
            label={t('morePromotions', { count: hiddenPromotions.length })}
            ariaLabel={t('viewMorePromotions', {
              count: hiddenPromotions.length,
            })}
            emphasis="more"
          >
            <Flex direction="column" gap="3">
              {hiddenPromotions.map((promotion, index) => (
                <Flex key={promotion.promotionId} direction="column" gap="3">
                  {index > 0 && <Separator size="4" />}
                  <ShippingPromotionDetails promotion={promotion} />
                </Flex>
              ))}
            </Flex>
          </PromotionTagPopover>
        )}
      </Flex>
    </Flex>
  );
}
