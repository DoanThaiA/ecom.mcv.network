'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useDelayedLoad } from '@/lib/hooks/useDelayedLoad';
import { useIsDesktop } from '@/lib/hooks/useBreakpoint';
import {
  getTopicProductsRequest,
  selectTopicProducts,
  selectTopicProductsLoading,
  getTopicCategoriesRequest,
  selectTopicCategories,
  selectTopicCategoriesLoading,
  getTopicBannersRequest,
  selectTopicBanners,
  selectTopicBannersLoading,
} from '@/lib/store/slices/topicSlice';
import { TopicType } from '@/types/gen/shared/shared/common/enums';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { TopProducts } from '../product/TopProducts';
import { TopicSectionSkeleton } from './TopicSectionSkeleton';
import { TopCategories } from '../category/TopCategories';
import { TopicBannerSlider } from './TopicBannerSlider';
import { Box } from '@radix-ui/themes';

interface TopicSectionClientProps {
  topicName: string;
  topicSlug: string;
  topicType: TopicType;
  seeAllLink: string;
  locale: string;
}

export function TopicSectionClient({
  topicName,
  topicSlug,
  topicType,
  seeAllLink,
  locale,
}: TopicSectionClientProps) {
  const t = useTranslations('home');
  const dispatch = useAppDispatch();

  // Track if API has been fetched to prevent re-fetching
  const hasFetchedRef = useRef(false);

  // Load after 100ms delay (or when browser is idle) to avoid jank during scroll
  const shouldLoad = useDelayedLoad({ delay: 100 });

  // Determine screen size for product limit (8 on desktop, 6 on mobile/tablet)
  const isDesktop = useIsDesktop();

  const products = useAppSelector((state) =>
    selectTopicProducts(state, topicSlug)
  );
  const loading = useAppSelector((state) =>
    selectTopicProductsLoading(state, topicSlug)
  );

  const categories = useAppSelector((state) =>
    selectTopicCategories(state, topicSlug)
  );
  const categoriesLoading = useAppSelector((state) =>
    selectTopicCategoriesLoading(state, topicSlug)
  );

  const banners = useAppSelector((state) =>
    selectTopicBanners(state, topicSlug)
  );
  const bannersLoading = useAppSelector((state) =>
    selectTopicBannersLoading(state, topicSlug)
  );

  const isCategoryTopic = topicType === TopicType.TOPIC_TYPE_CATEGORY;
  const isBannerTopic = topicType === TopicType.TOPIC_TYPE_BANNER;

  // Fetch products after delay
  useEffect(() => {
    if (!isCategoryTopic && !isBannerTopic && shouldLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getTopicProductsRequest({ slug: topicSlug, limit: isDesktop ? 8 : 6 }));
    }
  }, [topicSlug, isCategoryTopic, isBannerTopic, shouldLoad, isDesktop]);

  // Fetch categories after delay
  useEffect(() => {
    if (isCategoryTopic && shouldLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getTopicCategoriesRequest({ slug: topicSlug }));
    }
  }, [dispatch, topicSlug, isCategoryTopic, shouldLoad]);

  // Fetch banners after delay
  useEffect(() => {
    if (isBannerTopic && shouldLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(getTopicBannersRequest({ slug: topicSlug }));
    }
  }, [dispatch, topicSlug, isBannerTopic, shouldLoad]);

  // Determine loading state
  const showSkeleton = !shouldLoad || (
    isBannerTopic ? bannersLoading :
    isCategoryTopic ? categoriesLoading :
    loading && products.length === 0
  );

  // For product topics: check if we have data to show
  if (!isCategoryTopic && !isBannerTopic && shouldLoad && !loading && products.length === 0) {
    return null;
  }

  // For category topics: check if we have data to show
  if (isCategoryTopic && shouldLoad && !categoriesLoading && categories.length === 0) {
    return null;
  }

  // For banner topics: check if we have data to show
  if (isBannerTopic && shouldLoad && !bannersLoading && banners.length === 0) {
    return null;
  }

  // Convert ShopTopicCategory to ProductCategory format for CategoryCard
  const formattedCategories = isCategoryTopic
    ? categories.map((cat, index) => ({
        id: cat.id,
        businessId: '',
        source: 'nhanh',
        code: '',
        name: cat.name,
        image: cat.image ?? undefined,
        slug: cat.slug ?? undefined,
        parentId: undefined,
        order: index,
        status: 1, // Active
        createdAt: undefined,
        updatedAt: undefined,
      }))
    : [];

  // Render banner topic content (no title, full-width)
  if (isBannerTopic) {
    if (showSkeleton) return null; // No skeleton for banners
    return <TopicBannerSlider banners={banners} />;
  }

  // Render product topic content
  if (!isCategoryTopic) {
    return (
      <Box>
        {showSkeleton ? (
          <TopicSectionSkeleton topicName={topicName} />
        ) : (
          <TopProducts
            title={topicName}
            seeAllText={t('seeAll')}
            products={products}
            seeAllLink={seeAllLink}
            locale={locale}
          />
        )}
      </Box>
    );
  }

  // Render category topic content
  return (
    <Box>
      {showSkeleton ? (
        <TopicSectionSkeleton topicName={topicName} />
      ) : (
        <TopCategories
          title={topicName}
          seeAllText={t('seeAll')}
          categories={formattedCategories}
          seeAllLink={seeAllLink}
          locale={locale}
        />
      )}
    </Box>
  );
}
