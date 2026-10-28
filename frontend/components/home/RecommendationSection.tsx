'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useDelayedLoad } from '@/lib/hooks/useDelayedLoad';
import { useIsDesktop } from '@/lib/hooks/useBreakpoint';
import {
  getRecommendationsRequest,
  selectRecommendedProducts,
  selectRecommendationsLoading,
  selectRecommendationsHasLoaded,
} from '@/lib/store/slices/recommendationSlice';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { TopProducts } from '../product/TopProducts';
import { TopicSectionSkeleton } from '../topic/TopicSectionSkeleton';
import { Box } from '@radix-ui/themes';

interface RecommendationSectionProps {
  locale: string;
}

export function RecommendationSection({ locale }: RecommendationSectionProps) {
  const t = useTranslations('productDetail');
  const dispatch = useAppDispatch();

  // Track if API has been fetched to prevent re-fetching
  const hasFetchedRef = useRef(false);

  // Load after 100ms delay (or when browser is idle) to avoid jank during scroll
  const shouldLoad = useDelayedLoad({ delay: 100 });

  // Determine screen size for product limit (8 on desktop, 6 on mobile/tablet)
  const isDesktop = useIsDesktop();

  const products = useAppSelector(selectRecommendedProducts);
  const loading = useAppSelector(selectRecommendationsLoading);
  const hasLoaded = useAppSelector(selectRecommendationsHasLoaded);

  // Fetch recommendations after delay
  useEffect(() => {
    if (shouldLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getRecommendationsRequest({ limit: isDesktop ? 8 : 6 }));
    }
  }, [shouldLoad, isDesktop, dispatch]);

  // Determine loading state - show skeleton before delay or while loading
  const showSkeleton = !shouldLoad || (loading && products.length === 0);

  // Hide section if no products after loading
  if (hasLoaded && !loading && products.length === 0) {
    return null;
  }

  // Don't render anything before shouldLoad to prevent flash
  if (!shouldLoad && !hasLoaded) {
    return null;
  }

  return (
    <Box>
      {showSkeleton ? (
        <TopicSectionSkeleton topicName={t('relatedProducts')} />
      ) : (
        <TopProducts
          title={t('relatedProducts')}
          products={products}
          locale={locale}
          showSeeAll={false}
        />
      )}
    </Box>
  );
}
