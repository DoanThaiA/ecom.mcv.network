'use client';

import { MobileFilterHeader } from '@/components/product/MobileFilterHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSortSelect } from '@/components/product/ProductSortSelect';
import { ProductGridSkeleton } from '@/components/skeleton';
import { useTopicFilters } from '@/hooks/useTopicFilters';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchProductsByTopicRequest,
  selectProductsByTopicItems,
  selectProductsByTopicLoading,
  selectProductsByTopicPagination,
} from '@/lib/store/slices/productsByTopicSlice';
import {
  getTopicCategoriesRequest,
  selectTopicCategories,
  selectTopicCategoriesLoading,
} from '@/lib/store/slices/topicSlice';
import { getValidCategoryIds } from '@/lib/utils/categoryFilters';
import { getSortFromValue } from '@/lib/utils/sort';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import { TopicType } from '@/types/gen/shared/shared/common/enums';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { FilterTags } from '@/components/product/FilterTags';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopicFlashSaleContent } from './TopicFlashSaleContent';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategorySlider } from '@/components/category/CategorySlider';

interface TopicContentProps {
  locale: AppLocale;
  topicId: string;
  topics: ShopTopicItem[];
  categories?: ProductCategory[];
}

export function TopicContent({
  locale,
  topicId: topicIdProp,
  topics,
  categories,
}: TopicContentProps) {
  const dispatch = useAppDispatch();

  // Redux selectors
  const products = useAppSelector(selectProductsByTopicItems);
  const isLoading = useAppSelector(selectProductsByTopicLoading);
  const pagination = useAppSelector(selectProductsByTopicPagination);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Topic type detection - find by ID or slug
  const currentTopic = useMemo(
    () =>
      topics.find((t) => t.id === topicIdProp) ||
      topics.find((t) => t.slug === topicIdProp),
    [topics, topicIdProp]
  );
  const isCategoryTopic = currentTopic?.type === TopicType.TOPIC_TYPE_CATEGORY;

  // Category topic selectors
  const topicCategories = useAppSelector((state) =>
    selectTopicCategories(state, currentTopic?.slug || '')
  );
  const categoriesLoading = useAppSelector((state) =>
    selectTopicCategoriesLoading(state, currentTopic?.slug || '')
  );

  // Use useTopicFilters hook - topic is fixed from URL slug
  const {
    // Topic info
    topicId,
    topicName,

    // Pending states (for UI)
    selectedCategories,
    priceRange,
    selectedSizes,
    selectedColors,
    sortValue,
    isInitialized,

    // Applied states (for API calls)
    appliedCategories,
    appliedPriceRange,

    // Setters
    setSortValue,

    // Handlers (update pending only)
    handleCategoriesChange,
    handlePriceRangeChange,
    handleSizesChange,
    handleColorsChange,

    // Actions
    applyFilters,
    clearAllFilters,
    removeFilter,

    // Derived
    hasActiveFilters,
    activeFilterTags,
    filterCount,
  } = useTopicFilters({ topicId: topicIdProp, topics, categories });

  // Fetch topic categories for category topics
  useEffect(() => {
    if (isCategoryTopic && currentTopic?.slug) {
      dispatch(getTopicCategoriesRequest({ slug: currentTopic.slug }));
    }
  }, [dispatch, isCategoryTopic, currentTopic?.slug]);

  // Convert applied category codes to category IDs (for API calls)
  const categoryIdsToFetch = useMemo(() => {
    if (!isInitialized) return [];
    if (isEmpty(appliedCategories)) return [];

    return getValidCategoryIds(appliedCategories, categories, undefined);
  }, [isInitialized, appliedCategories, categories]);

  // Fetch products when applied filters change (only for product topics)
  useEffect(() => {
    if (isCategoryTopic) return; // Skip for category topics
    if (!isInitialized || !topicId) return;

    setCurrentPage(1);

    dispatch(
      fetchProductsByTopicRequest({
        page: 1,
        limit: 14,
        filters: {
          categoryIds: categoryIdsToFetch,
          minPrice: appliedPriceRange[0],
          maxPrice: appliedPriceRange[1],
          topicId, // Topic is the main fixed filter from URL slug
        },
        sort: getSortFromValue(sortValue),
        append: false,
      })
    );
  }, [
    isCategoryTopic,
    categoryIdsToFetch,
    appliedPriceRange,
    topicId,
    sortValue,
    isInitialized,
    dispatch,
  ]);

  const t = useTranslations('productListing');
  const tCommon = useTranslations('common');
  const tProduct = useTranslations('product');

  // Check if there are more products to load
  const hasMoreProducts = pagination.page < pagination.totalPages;

  // Load more products handler
  const handleLoadMore = useCallback(() => {
    if (!hasMoreProducts || isLoading || !topicId) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    dispatch(
      fetchProductsByTopicRequest({
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
    topicId,
    sortValue,
    dispatch,
  ]);

  // Early return for category topics
  if (isCategoryTopic) {
    // Format categories for CategoryCard
    const formattedCategories = topicCategories.map((cat, index) => ({
      id: cat.id,
      businessId: '',
      source: 'nhanh',
      code: '',
      name: cat.name,
      image: cat.image ?? undefined,
      slug: cat.slug ?? undefined,
      parentId: undefined,
      order: index,
      status: 1,
      createdAt: undefined,
      updatedAt: undefined,
    }));

    return (
      <Box className="mt-4 lg:mt-16 mb-14">
        <Box className="px-8 mb-8">
          <Text className="text-xl font-semibold uppercase">{topicName}</Text>
        </Box>

        {categoriesLoading ? (
          <ProductGridSkeleton count={8} />
        ) : topicCategories.length > 0 ? (
          <Box className="px-8">
            {/* Mobile: Slider */}
            <Box className="md:hidden">
              <CategorySlider categories={formattedCategories} locale={locale} />
            </Box>

            {/* Tablet+: Grid */}
            <Box className="hidden md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6">
              {formattedCategories.map((category) => (
                <CategoryCard key={category.id} category={category} locale={locale} />
              ))}
            </Box>
          </Box>
        ) : (
          <Box className="text-center py-20 px-8">
            <Text className="text-lg text-gray-500">{t('noProducts')}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Product topic rendering
  return (
    <Box className="mt-4 lg:mt-16 mb-14">
      <Box className="px-8">
        <Text className="text-xl font-semibold uppercase">{topicName}</Text>
        {/* Mobile Header, Sort, and Filter Tags */}
        <MobileFilterHeader
          title={topicName}
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
      <TopicFlashSaleContent
        title="FLASH SALE"
        locale={locale}
        topicId={topicId}
        appliedCategories={appliedCategories}
        appliedPriceRange={appliedPriceRange}
        categories={categories}
      />

      {/* Main Content */}
      <Box className="px-4 md:px-8">
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
            onApply={applyFilters}
          />

          {/* Products */}
          <Box className="w-full">
            {/* Products Grid */}
            {isLoading && currentPage === 1 ? (
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
