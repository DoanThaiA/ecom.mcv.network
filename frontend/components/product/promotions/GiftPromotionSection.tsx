'use client';

import { Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import type { ProductPromotionGiftPromotion } from '@/types/gen/shop/shop/shop/shop';
import { buildGiftProductHighlights } from '@/lib/helpers/productPromotionHighlightHelper';
import { GiftProductCard } from './GiftProductCard';

interface GiftPromotionSectionProps {
  promotions: ProductPromotionGiftPromotion[];
}

export function GiftPromotionSection({
  promotions,
}: GiftPromotionSectionProps) {
  const t = useTranslations('productDetail.promotions');
  const gifts = buildGiftProductHighlights(promotions);

  if (gifts.length === 0) return null;

  return (
    <Flex
      direction="column"
      gap="2"
      align="stretch"
      className="w-full min-w-0 max-w-full"
    >
      <Text
        size="2"
        weight="medium"
        className="w-full text-gray-900"
      >
        {t('giftLabel')}
      </Text>
      <Flex
        gap="3"
        role="list"
        tabIndex={0}
        aria-label={t('giftListLabel')}
        className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {gifts.map((gift) => (
          <GiftProductCard key={gift.key} gift={gift} />
        ))}
      </Flex>
    </Flex>
  );
}
