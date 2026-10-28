'use client';

import { Box, Flex, Heading, Link } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CategorySlider } from './CategorySlider';
import { CategoryCard } from './CategoryCard';
import { filterTopLevelCategories } from '@/lib/utils/categoryFilters';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

interface CategorySectionProps {
  categories: ProductCategory[];
  locale?: string;
  showArrow?: boolean;
}

export function CategorySection({
  categories,
  locale = 'vi',
  showArrow = true,
}: CategorySectionProps) {
  const t = useTranslations('home');

  // Filter to show only top-level categories (level 1)
  const topLevelCategories = useMemo(
    () => filterTopLevelCategories(categories),
    [categories]
  );

  if (!topLevelCategories || topLevelCategories.length === 0) {
    return null;
  }

  return (
    <Box className="px-6 sm:px-8 ">
      {/* Header */}
      <Flex align="center" justify="between" mb="4">
        {/* Title + Icon */}
        <Flex align="center" gap="1">
          <Heading className="font-semibold text-lg sm:text-xl md:text-2xl">
            {t('categories')}
          </Heading>
          {showArrow && (
            <ChevronRightIcon
              width={20}
              height={20}
              color="#000000"
            />
          )}
        </Flex>

        {/* See All */}
        {showArrow && (
          <Link
            href={`/${locale}/categories`}
            className="no-underline flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-[0.875rem] font-normal text-[#AFAFAF]">
              {t('seeAll')}
            </span>
          </Link>
        )}
      </Flex>

      {/* Mobile: Slider */}
      <Box className="md:hidden">
        <CategorySlider categories={topLevelCategories} locale={locale} />
      </Box>

      {/* Tablet+: Grid */}
      <Box className="hidden md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6">
        {topLevelCategories.map((category) => (
          <CategoryCard key={category.id} category={category} locale={locale} />
        ))}
      </Box>
    </Box>
  );
}
