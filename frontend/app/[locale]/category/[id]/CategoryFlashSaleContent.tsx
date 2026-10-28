'use client';

import { FlashSale } from '@/components/product/FlashSale';
import { ProductGridSkeleton } from '@/components/skeleton/ProductGridSkeleton';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  getFlashSaleDataRequest,
  selectFlashSaleItems,
  selectFlashSaleLoading,
} from '@/lib/store/slices/flashSaleSlice';
import {
  convertCategoryCodesToIds,
  getFirstTopicId,
} from '@/lib/utils/categoryFilters';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import { Box } from '@radix-ui/themes';
import isEmpty from 'lodash/isEmpty';
import React, { useEffect, useMemo } from 'react';

interface FlashSaleContentProps {
  title: string;
  locale: string;
  categoryId?: string;
  // Filters from CategoryContent
  appliedCategories?: string[]; // Category codes
  appliedPriceRange?: [number, number];
  appliedTopics?: string[];
  categories?: ProductCategory[];
}

export const CategoryFlashSaleContent = React.memo(function CategoryFlashSaleContent({
  title,
  locale,
  categoryId,
  appliedCategories = [],
  appliedPriceRange = [50000, 1500000],
  appliedTopics = [],
  categories = [],
}: FlashSaleContentProps) {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectFlashSaleItems);

  const loading = useAppSelector(selectFlashSaleLoading);

  // Convert category codes to category IDs
  const categoryIds = useMemo(() => {
    return convertCategoryCodesToIds(appliedCategories, categories, categoryId);
  }, [appliedCategories, categories, categoryId]);

  // Get the first applied topic ID (if any)
  const topicId = useMemo(() => {
    return getFirstTopicId(appliedTopics);
  }, [appliedTopics]);

  // Fetch flash sale products when filters change
  useEffect(() => {
    if (isEmpty(categoryIds)) return;

    dispatch(
      getFlashSaleDataRequest({
        categoryIds,
        topicId,
        minPrice: appliedPriceRange[0],
        maxPrice: appliedPriceRange[1],
      })
    );
  }, [
    categoryIds,
    topicId,
    appliedPriceRange,
    dispatch,
  ]);

  if (loading && products.length === 0) {
    return (
      <Box className="px-4 md:px-8 mt-5">
        <ProductGridSkeleton count={6} />
      </Box>
    );
  }

  if (products.length === 0) {
    return <Box className='mt-5'></Box>;
  }

  return (
    <Box className="mb-6 mt-5">
      <FlashSale
        title={title}
        // seeAllText={tCommon('buttons.viewAll')}
        products={products}
        endTime={new Date()}
        locale={locale}
        showTimer={false}
      />
    </Box>
  );
});
