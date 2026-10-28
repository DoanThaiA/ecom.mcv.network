'use client';

import { MobileFilterHeader } from '@/components/product/MobileFilterHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSortSelect } from '@/components/product/ProductSortSelect';
import { ProductGridSkeleton } from '@/components/skeleton';
import { useCategoryFilters } from '@/hooks/useCategoryFilters';
import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchProductsByCategoryRequest,
  selectProductsByCategoryItems,
  selectProductsByCategoryLoading,
  selectProductsByCategoryPagination,
} from '@/lib/store/slices/productsByCategorySlice';
import {
  getFirstTopicId,
  getValidCategoryIds,
} from '@/lib/utils/categoryFilters';
import { getSortFromValue } from '@/lib/utils/sort';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { FilterTags } from '@/components/product/FilterTags';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryFlashSaleContent } from './CategoryFlashSaleContent';

interface CategoryContentProps {
  locale: AppLocale;
  categoryId: string;
  categories?: ProductCategory[];
  topics?: ShopTopicItem[];
}

export function CategoryContent({
  locale,
  categoryId,
  categories,
  topics,
}: CategoryContentProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('productListing');
  const tCommon = useTranslations('common');
  const tProduct = useTranslations('product');

  // Redux selectors
  const products = useAppSelector(selectProductsByCategoryItems);
  const isLoading = useAppSelector(selectProductsByCategoryLoading);
  const pagination = useAppSelector(selectProductsByCategoryPagination);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Use custom hook for filter management
  const {
    // Pending states (for UI)
    selectedCategories,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedTopics,
    sortValue,
    isInitialized,

    // Applied states (for API calls)
    appliedCategories,
    appliedPriceRange,
    appliedTopics,

    // Setters
    setSortValue,

    // Handlers (update pending only)
    handleCategoriesChange,
    handlePriceRangeChange,
    handleSizesChange,
    handleColorsChange,
    handleTopicsChange,

    // Actions
    applyFilters,
    clearAllFilters,
    removeFilter,

    // Derived
    hasActiveFilters,
    activeFilterTags,
    filterCount,
  } = useCategoryFilters({ categoryId, categories, topics });

  // Find category from ID, code, or slug
  const currentCategory = useMemo(() => {
    if (!categories) return null;
    return (
      find(categories, (cat) => cat.id === categoryId) ||
      find(categories, (cat) => cat.code === categoryId) ||
      find(categories, (cat) => cat.slug === categoryId)
    );
  }, [categories, categoryId]);

  // Get localized category name
  const localizedCategoryName = currentCategory
    ? getLocalizedName(
        currentCategory.name,
        currentCategory.nameLocalization,
        locale
      )
    : null;

  // Convert applied category codes to category IDs (for API calls)
  const categoryIdsToFetch = useMemo(() => {
    if (!isInitialized) return [];

    return getValidCategoryIds(
      appliedCategories,
      categories,
      currentCategory?.id
    );
  }, [isInitialized, appliedCategories, categories, currentCategory?.id]);

  // Fetch products when applied filters change
  // Note: sortValue is still real-time (triggers API immediately)
  useEffect(() => {
    if (isEmpty(categoryIdsToFetch)) return;

    setCurrentPage(1);

    // Get the first applied topic ID (if any) to send to API
    const topicId = getFirstTopicId(appliedTopics);

    dispatch(
      fetchProductsByCategoryRequest({
        page: 1,
        limit: 14,
        filters: {
          categoryIds: categoryIdsToFetch,
          minPrice: appliedPriceRange[0],
          maxPrice: appliedPriceRange[1],
          topicId,
        },
        sort: getSortFromValue(sortValue),
        append: false,
      })
    );
  }, [
    categoryIdsToFetch,
    appliedPriceRange,
    appliedTopics,
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

    // Get the first applied topic ID (if any) to send to API
    const topicId = getFirstTopicId(appliedTopics);

    dispatch(
      fetchProductsByCategoryRequest({
        page: nextPage,
        limit: 14,
        filters: {
          categoryIds: categoryIdsToFetch,
          minPrice: appliedPriceRange[0],
          maxPrice: appliedPriceRange[1],
          topicId,
        },
        sort: getSortFromValue(sortValue),
        append: true,
      })
    );
  }, [
    hasMoreProducts,
    isLoading,
    currentPage,
    categoryIdsToFetch,
    appliedPriceRange,
    appliedTopics,
    sortValue,
    dispatch,
  ]);

  return (
    <Box className="mt-4 lg:mt-16 mb-14">
      <Box className="px-8">
        <Text className="text-xl font-semibold uppercase">
          {localizedCategoryName || t('title')}
        </Text>

        {/* Mobile Header, Sort, and Filter Tags */}
        <MobileFilterHeader
          title={localizedCategoryName || t('title')}
          productCount={pagination.total}
          sortValue={sortValue}
          onSortChange={setSortValue}
          onOpenFilters={() => setFiltersOpen(true)}
          hasActiveFilters={hasActiveFilters}
          activeFilterTags={activeFilterTags}
          onClearAllFilters={clearAllFilters}
          onRemoveFilter={removeFilter}
          filterCount={filterCount}
        />
      </Box>

      {/* Tablet+ Header - Shows on md and above */}
      <Flex justify="between" align="end" className="hidden md:flex px-8">
        <Flex align="center" gap="4">
          <Text className="text-sm text-gray-600">
            {pagination.total} {t('productsCount')}
          </Text>

          {/* Sort Dropdown for Tablet+ */}
          <ProductSortSelect value={sortValue} onValueChange={setSortValue} />

          {/* Filter Popover for Tablet+ */}
          <ProductFilters
            locale={locale}
            variant="popover"
            trigger={
              <Flex
                align="center"
                gap="2"
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Text>{t('filters')}</Text>
                <Box className="relative">
                  <MixerHorizontalIcon width="16" height="16" />
                  {filterCount > 0 && (
                    <Flex
                      align="center"
                      justify="center"
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[0.625rem] min-w-4 h-4 px-1 rounded-full font-medium"
                    >
                      {filterCount}
                    </Flex>
                  )}
                </Box>
              </Flex>
            }
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoriesChange={handleCategoriesChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            selectedSizes={selectedSizes}
            onSizesChange={handleSizesChange}
            selectedColors={selectedColors}
            onColorsChange={handleColorsChange}
            topics={topics}
            selectedTopics={selectedTopics}
            onTopicsChange={handleTopicsChange}
            onApply={applyFilters}
          />
        </Flex>
      </Flex>

      {/* Desktop: Quick Filter Tags */}
      {hasActiveFilters && (
        <FilterTags
          activeFilterTags={activeFilterTags}
          onClearAllFilters={clearAllFilters}
          onRemoveFilter={removeFilter}
          className="hidden md:flex px-8 mt-4"
        />
      )}

      {/* Flash Sale Section */}
      <CategoryFlashSaleContent
        title="FLASH SALE"
        locale={locale}
        categoryId={currentCategory?.id}
        appliedCategories={appliedCategories}
        appliedPriceRange={appliedPriceRange}
        appliedTopics={appliedTopics}
        categories={categories}
      />

      {/* Main Content */}
      <Box className="px-4 md:px-8 ">
        <Box>
          {/* Mobile Filter Drawer */}
          <ProductFilters
            locale={locale}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoriesChange={handleCategoriesChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            selectedSizes={selectedSizes}
            onSizesChange={handleSizesChange}
            selectedColors={selectedColors}
            onColorsChange={handleColorsChange}
            topics={topics}
            selectedTopics={selectedTopics}
            onTopicsChange={handleTopicsChange}
            onApply={applyFilters}
          />

          {/* Products */}
          <Box className="w-full">
            {/* Products Grid */}
            {!isInitialized || (isLoading && currentPage === 1) ? (
              <ProductGridSkeleton count={8} />
            ) : !isEmpty(products) ? (
              <>
                <Box className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6">
                  {map(products, (product) => (
                    <ProductCard
                      key={product.id}
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
                <Text className="text-lg text-gray-500">{t('noProducts')}</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile: Categories Section */}
      {/* {categories && categories.length > 0 && (
        <Box className="mt-8">
          <CategorySection
            categories={categories}
            locale={locale}
            showArrow={false}
          />
        </Box>
      )} */}
    </Box>
  );
}
