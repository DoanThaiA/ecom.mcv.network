'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeleton';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchProductsByCategoryRequest,
  selectProductsByCategoryItems,
  selectProductsByCategoryLoading,
  selectProductsByCategoryPagination,
} from '@/lib/store/slices/productsByCategorySlice';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopSortProduct } from '@/types/gen/shop/shop/products/product';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import compact from 'lodash/compact';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface SearchContentProps {
  locale: AppLocale;
  categories?: ProductCategory[];
}

/**
 * Convert sort select value to ShopSortProduct
 */
const getSortFromValue = (value: string): ShopSortProduct | undefined => {
  switch (value) {
    case 'price-asc':
      return { orderBy: 'price', order: 'asc' };
    case 'price-desc':
      return { orderBy: 'price', order: 'desc' };
    case 'newest':
      return { orderBy: 'createdAt', order: 'desc' };
    default:
      return undefined;
  }
};

export function SearchContent({ locale, categories }: SearchContentProps) {
  const dispatch = useAppDispatch();

  // Redux selectors
  const products = useAppSelector(selectProductsByCategoryItems);
  const isLoading = useAppSelector(selectProductsByCategoryLoading);
  const pagination = useAppSelector(selectProductsByCategoryPagination);

  const [currentPage, setCurrentPage] = useState(1);

  // Use custom hook for filter management
  const {
    // Search query
    searchQuery,

    sortValue,
    isInitialized,

    // Applied states (for API calls)
    appliedCategories,
    appliedPriceRange,
  } = useSearchFilters({ categories });

  const t = useTranslations('search');
  const tListing = useTranslations('productListing');
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');

  // Convert applied category codes to category IDs (for API calls)
  const categoryIdsToFetch = useMemo(() => {
    if (!isInitialized) return [];

    if (!isEmpty(appliedCategories) && categories) {
      // Map applied codes to category IDs
      const ids = compact(
        map(appliedCategories, (code) => {
          const cat = find(categories, (c) => c.code === code);
          return cat?.id;
        })
      );
      return ids;
    }

    return [];
  }, [isInitialized, appliedCategories, categories]);

  // Fetch products when applied filters or search query change
  useEffect(() => {
    if (!isInitialized) return;

    setCurrentPage(1);

    dispatch(
      fetchProductsByCategoryRequest({
        page: 1,
        limit: 14,
        filters: {
          search: searchQuery || undefined,
          categoryIds: categoryIdsToFetch,
          minPrice: appliedPriceRange?.[0],
          maxPrice: appliedPriceRange?.[1],
        },
        sort: getSortFromValue(sortValue),
        append: false,
      })
    );
  }, [
    isInitialized,
    searchQuery,
    categoryIdsToFetch,
    appliedPriceRange,
    sortValue,
    dispatch,
  ]);

  // Check if there are more products to load
  const hasMoreProducts = pagination.page < pagination.totalPages;

  // Load more products handler
  const handleLoadMore = useCallback(() => {
    if (!hasMoreProducts || isLoading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    dispatch(
      fetchProductsByCategoryRequest({
        page: nextPage,
        limit: 14,
        filters: {
          search: searchQuery || undefined,
          categoryIds: categoryIdsToFetch,
          minPrice: appliedPriceRange?.[0],
          maxPrice: appliedPriceRange?.[1],
        },
        sort: getSortFromValue(sortValue),
        append: true,
      })
    );
  }, [
    hasMoreProducts,
    isLoading,
    currentPage,
    searchQuery,
    categoryIdsToFetch,
    appliedPriceRange,
    sortValue,
    dispatch,
  ]);

  return (
    <Box className="mt-4 lg:mt-16 mb-14">
      {/* Tablet+ Header - Shows on md and above */}
      <Flex
        justify="between"
        align="start"
        className="px-8 lg:px-12 mb-4 flex flex-col"
      >
        <Box className='flex flex-col'>
          <Text className="text-2xl font-bold uppercase">{t('title')}</Text>
          {searchQuery && (
            <Text className="text-sm text-gray-600 mt-1">
              {t('searchingFor')}: &quot;{searchQuery}&quot;
            </Text>
          )}
        </Box>
        <Flex align="center" gap="4">
          <Text className="text-sm text-gray-600">
            {pagination.total} {tListing('productsCount')}
          </Text>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Box className="px-4 mt-4 md:px-8 lg:px-12">
        <Box>
          {/* Products */}
          <Box className="w-full">
            {/* Products Grid */}
            {isLoading && currentPage === 1 ? (
              <ProductGridSkeleton count={8} />
            ) : !isEmpty(products) ? (
              <>
                <Box className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6">
                  {map(products, (product, index) => (
                    <ProductCard
                      key={`${product.id}${index}`}
                      product={product}
                      locale={locale}
                      translations={{
                        addToCart: tProduct('addToCart'),
                      }}
                    />
                  ))}
                </Box>

                {/* Load More Button */}
                {hasMoreProducts && (
                  <Flex justify="center" className="mt-8">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-8 py-2 rounded-full border-gray-400 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {isLoading ? '...' : tCommon('buttons.loadMore')}
                    </Button>
                  </Flex>
                )}
              </>
            ) : (
              <Box className="text-center py-20">
                <Text className="text-lg text-gray-500">
                  {searchQuery ? t('noResultsForKeyword') : t('noResults')}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
