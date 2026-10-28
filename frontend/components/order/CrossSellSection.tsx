'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useDelayedLoad } from '@/lib/hooks/useDelayedLoad';
import { useIsDesktop } from '@/lib/hooks/useBreakpoint';
import {
  getCrossSellRequest,
  selectCrossSellProducts,
  selectCrossSellLoading,
} from '@/lib/store/slices/recommendationSlice';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { TopProducts } from '../product/TopProducts';
import { TopicSectionSkeleton } from '../topic/TopicSectionSkeleton';
import { Box } from '@radix-ui/themes';

interface CrossSellSectionProps {
  productIds: string[];
  locale: string;
}

export function CrossSellSection({ productIds, locale }: CrossSellSectionProps) {
  const t = useTranslations('orderSuccess');
  const dispatch = useAppDispatch();

  // Track if API has been fetched to prevent re-fetching
  const hasFetchedRef = useRef(false);

  // Load after 100ms delay (or when browser is idle) to avoid jank during scroll
  const shouldLoad = useDelayedLoad({ delay: 100 });

  // Determine screen size for product limit (8 on desktop, 6 on mobile/tablet)
  const isDesktop = useIsDesktop();

  const products = useAppSelector(selectCrossSellProducts);
  const loading = useAppSelector(selectCrossSellLoading);

  // Fetch cross-sell recommendations after delay
  useEffect(() => {
    if (shouldLoad && !hasFetchedRef.current && productIds.length > 0) {
      hasFetchedRef.current = true;
      dispatch(getCrossSellRequest({ productIds, limit: isDesktop ? 8 : 6 }));
    }
  }, [shouldLoad, isDesktop, dispatch, productIds]);

  // Determine loading state - show skeleton before delay or while loading
  const showSkeleton = !shouldLoad || (loading && products.length === 0);

  // Don't render anything if no productIds
  if (!productIds || productIds.length === 0) {
    return null;
  }

  // Hide section if no products after loading
  if (!loading && products.length === 0 && !showSkeleton) {
    return null;
  }

  // Don't render anything before shouldLoad to prevent flash
  if (!shouldLoad && products.length === 0) {
    return null;
  }

  return (
    <Box className="w-full my-8">
      {showSkeleton ? (
        <TopicSectionSkeleton topicName={t('youMayAlsoLike')} />
      ) : (
        <TopProducts
          title={t('youMayAlsoLike')}
          products={products}
          locale={locale}
          showSeeAll={false}
        />
      )}
    </Box>
  );
}
