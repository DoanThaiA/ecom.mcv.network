'use client';

import { DEFAULT_PRODUCT_IMAGE, IMAGE_SIZES } from '@/lib/constants';
import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import type { AppLocale } from '@/lib/locale';
import { getCategoryUrl } from '@/lib/utils/seoUrl';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import { Box, Text } from '@radix-ui/themes';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useState } from 'react';

interface CategoryCardProps {
  category: ProductCategory;
  locale?: string;
}

export function CategoryCard({ category, locale = 'vi' }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = category.image && !imageError;
  const categoryName = getLocalizedName(category.name, category.nameLocalization, locale as AppLocale);

  return (
    <Link
      href={getCategoryUrl(category, locale)}
      className="no-underline text-inherit block w-full"
    >
      <Box className="relative p-0 cursor-pointer transition-transform duration-200 flex flex-col h-full bg-transparent">
        {/* Category Image */}
        <Box className="relative w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
          {hasValidImage ? (
            <ProductImage
              src={category.image!}
              alt={categoryName}
              fill
              sizes={IMAGE_SIZES.categoryCard}
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <ProductImage
              src={DEFAULT_PRODUCT_IMAGE}
              alt={categoryName}
              fill
              sizes={IMAGE_SIZES.categoryCard}
              className="object-contain opacity-50"
            />
          )}
        </Box>

        {/* Category Name - Centered */}
        <Box className="mt-2">
          <Text className="block text-black text-base text-center font-medium">
            {categoryName}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}
