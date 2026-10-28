'use client';

import { DotFilledIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useLocale, useTranslations } from 'next-intl';
import { BundleDealSubType } from '@/types/gen/shared/shared/common/enums';
import type { GiftProductHighlight } from '@/lib/helpers/productPromotionHighlightHelper';
import { formatPromotionEndDate } from '@/lib/helpers/productPromotionHighlightHelper';
import { formatPrice } from '@/lib/utils/format';
import { ProductImage } from '@/components/common/ProductImage';

interface GiftProductCardProps {
  gift: GiftProductHighlight;
}

export function GiftProductCard({ gift }: GiftProductCardProps) {
  const t = useTranslations('productDetail.promotions');
  const locale = useLocale();
  const conditions: string[] = [];

  if (
    gift.subType ===
      BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT &&
    gift.minimumOrderValue !== undefined
  ) {
    conditions.push(
      t('buyToGetGiftCondition', {
        amount: formatPrice(gift.minimumOrderValue),
      }),
    );
  }

  if (
    gift.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y
  ) {
    conditions.push(
      t('buyXGetYCondition', {
        requiredQuantity: gift.requiredQuantity ?? 1,
        giftQuantity: gift.giftQuantity ?? 1,
      }),
    );

    if (gift.minimumOrderValue && gift.minimumOrderValue > 0) {
      conditions.push(
        t('minimumOrder', { amount: formatPrice(gift.minimumOrderValue) }),
      );
    }
  }

  if (gift.notApplicableWithOtherPromotions) {
    conditions.push(t('notStackable'));
  }

  const endDate = formatPromotionEndDate(gift.endTime, locale);
  if (endDate) conditions.push(t('promotionEnds', { date: endDate }));

  return (
    <Flex
      gap="3"
      role="listitem"
      className="w-full max-w-full shrink-0 rounded-xl border border-orange-100 bg-white p-3 shadow-sm sm:w-[280px]"
    >
      <Box className="relative h-[104px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <ProductImage
          src={gift.product.image}
          alt={gift.product.name}
          fill
          sizes="82px"
          className="object-cover"
        />
      </Box>

      <Flex direction="column" gap="1" className="min-w-0 flex-1">
        <Text
          size="1"
          weight="medium"
          className="whitespace-normal break-words text-[#9B5526]"
        >
          {gift.promotionName}
        </Text>
        <Text
          size="2"
          weight="bold"
          className="whitespace-normal break-words text-gray-950"
        >
          {gift.product.name}
        </Text>
        {!gift.product.isAvailable && (
          <Text
            size="1"
            weight="medium"
            className="w-fit rounded bg-red-50 px-2 py-0.5 text-red-600"
          >
            {t('giftUnavailable')}
          </Text>
        )}
        <Flex align="center" gap="2" wrap="wrap">
          <Text
            size="2"
            weight="bold"
            aria-label={t('giftPriceValue', { amount: formatPrice(0) })}
            className="text-orange-800"
          >
            {formatPrice(0)}
          </Text>
          {gift.product.originalPrice > 0 && (
            <Text
              size="1"
              aria-label={t('originalPrice', {
                amount: formatPrice(gift.product.originalPrice),
              })}
              className="text-gray-400 line-through"
            >
              {formatPrice(gift.product.originalPrice)}
            </Text>
          )}
        </Flex>
        <Flex direction="column" gap="1" className="mt-1">
          {conditions.map((condition, index) => (
            <Flex key={`${index}-${condition}`} gap="1" align="start">
              <DotFilledIcon className="mt-0.5 shrink-0 text-[#B65F1D]" />
              <Text
                size="1"
                className="whitespace-normal break-words leading-4 text-gray-600"
              >
                {condition}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
