'use client';

import { Box, Flex, Heading, Link } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { ProductSlider } from './ProductSlider';
import type { Product } from '@/types/gen/shared/shared/products/product';

interface TopProductsProps {
  title: string;
  seeAllText?: string;
  products: Product[];
  seeAllLink?: string;
  locale?: string;
  showSeeAll?: boolean;
}

export function TopProducts({
  title,
  seeAllText,
  products,
  seeAllLink = '#',
  locale = 'vi',
  showSeeAll = true,
}: TopProductsProps) {
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
        {showSeeAll && seeAllText && (
          <Link
            href={seeAllLink}
            className="no-underline flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-[0.875rem] font-normal text-[#AFAFAF]">
              {seeAllText}
            </span>
          </Link>
        )}
      </Flex>

      {/* Scroll wrapper */}

      <ProductSlider
        products={products}
        locale={locale}
        displayMode="row"
        seeAllText={seeAllText}
        seeAllLink={seeAllLink}
      />
    </Box>
  );
}
