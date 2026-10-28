'use client';

import { Box, Flex, Heading, Link } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { CategorySliderRow } from './CategorySliderRow';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

interface TopCategoriesProps {
  title: string;
  seeAllText: string;
  categories: ProductCategory[];
  seeAllLink?: string;
  locale?: string;
}

export function TopCategories({
  title,
  seeAllText,
  categories,
  seeAllLink = '#',
  locale = 'vi',
}: TopCategoriesProps) {
  return (
    <Box className="pl-6 sm:px-8 lg:px-12">
      {/* Header */}
      <Flex align="center" justify="between" mb="4" className="pr-6 sm:pr-0">
        {/* Title + Icon */}
        <Link
          href={seeAllLink}
          className="no-underline hover:opacity-80 transition-opacity"
        >
          <Flex align="center" gap="1">
            <Heading className="font-semibold text-lg sm:text-xl md:text-2xl text-black">
              {title}
            </Heading>
            <ChevronRightIcon width={20} height={20} color="#000000" />
          </Flex>
        </Link>

        {/* See All */}
        <Link
          href={seeAllLink}
          className="no-underline flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <span className="text-[0.875rem] font-normal text-[#AFAFAF]">
            {seeAllText}
          </span>
        </Link>
      </Flex>

      {/* Category Slider */}
      <CategorySliderRow categories={categories} locale={locale} />
    </Box>
  );
}
