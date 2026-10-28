'use client';

import { FlashSale } from '@/components/product/FlashSale';
import { ProductGridSkeleton } from '@/components/skeleton/ProductGridSkeleton';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  getFlashSaleDataRequest,
  selectFlashSaleItems,
  selectFlashSaleLoading,
} from '@/lib/store/slices/flashSaleSlice';
import { convertCategoryCodesToIds } from '@/lib/utils/categoryFilters';
import { useIsDesktop } from '@/lib/hooks/useBreakpoint';
import { Box } from '@radix-ui/themes';
import React, { useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';

interface TopicFlashSaleContentProps {
  title: string;
  locale: string;
  topicId?: string;
  // Filters from TopicContent
  appliedCategories?: string[]; // Category codes
  appliedPriceRange?: [number, number];
  categories?: ProductCategory[];
}

export const TopicFlashSaleContent = React.memo(function TopicFlashSaleContent({
  title,
  locale,
  topicId,
  appliedCategories = [],
  appliedPriceRange = [50000, 1500000],
  categories = [],
}: TopicFlashSaleContentProps) {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectFlashSaleItems);

  const loading = useAppSelector(selectFlashSaleLoading);

  const isDesktop = useIsDesktop();

  // Convert category codes to category IDs
  const categoryIds = useMemo(() => {
    return convertCategoryCodesToIds(appliedCategories, categories, undefined);
  }, [appliedCategories, categories]);

  // Limit products to 12 on desktop to prevent excess space
  const displayProducts = useMemo(() => {
    if (!isDesktop) return products; // No limit on mobile/tablet
    return products.slice(0, 12); // Max 12 products on desktop (2 rows: 7 + 5)
  }, [products, isDesktop]);

  // Fetch flash sale products when filters change
  useEffect(() => {
    if (!topicId) return;

    dispatch(
      getFlashSaleDataRequest({
        topicId,
        categoryIds: !isEmpty(categoryIds) ? categoryIds : undefined,
        minPrice: appliedPriceRange[0],
        maxPrice: appliedPriceRange[1],
      })
    );
  }, [
    topicId,
    categoryIds,
    appliedPriceRange,
    dispatch,
  ]);

  if (loading && displayProducts.length === 0) {
    return (
      <Box className="px-4 md:px-8 mt-5">
        <ProductGridSkeleton count={6} />
      </Box>
    );
  }

  if (displayProducts.length === 0) {
        return <Box className='mt-5'></Box>;

  }

  return (
    <Box className="mb-6 mt-5">
      <FlashSale
        title={title}
        // seeAllText={tCommon('buttons.viewAll')}
        products={displayProducts}
        endTime={new Date()}
        locale={locale}
        showTimer={false}
      />
    </Box>
  );
});
