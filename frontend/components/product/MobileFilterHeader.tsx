'use client';

import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { FilterTags, FilterTag } from './FilterTags';
import { ProductSortSelect } from './ProductSortSelect';

export type { FilterTag };

interface MobileFilterHeaderProps {
  title: string;
  subtitle?: string;
  productCount: number;
  sortValue: string;
  onSortChange: (_value: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterTags: FilterTag[];
  onClearAllFilters: () => void;
  onRemoveFilter: (_type: string, _value: string) => void;
  filterCount: number;
}

export function MobileFilterHeader({
  title,
  subtitle,
  productCount,
  sortValue,
  onSortChange,
  onOpenFilters,
  hasActiveFilters,
  activeFilterTags,
  onClearAllFilters,
  onRemoveFilter,
  filterCount,
}: MobileFilterHeaderProps) {
  const t = useTranslations('productListing');

  return (
    <>
      {/* Mobile Header - Title */}
      {title && subtitle && (
        <Box className="md:hidden flex flex-col">
          <Text className="text-2xl font-bold uppercase">
            {title || t('title')}
          </Text>
          {subtitle && (
            <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>
          )}
        </Box>
      )}

      {/* Mobile: Product Count + Sort + Filter Row */}
      <Flex className="md:hidden items-center justify-between flex flex-wrap">
        <Text className="text-sm text-[#AFAFAF]">
          {productCount} {t('productsCount')}
        </Text>
        <Flex gap="2" align="center">
          <ProductSortSelect value={sortValue} onValueChange={onSortChange} />
          <Button
            onClick={onOpenFilters}
            variant="outline"
            className="bg-white text-black text-sm font-semibold rounded-3xl cursor-pointer shadow-[inset_0_0_0_1px_var(--gray-a7)]"
          >
            <Flex align="center" gap="2">
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
          </Button>
        </Flex>
      </Flex>

      {/* Mobile: Quick Filter Tags */}
      {hasActiveFilters && (
        <FilterTags
          activeFilterTags={activeFilterTags}
          onClearAllFilters={onClearAllFilters}
          onRemoveFilter={onRemoveFilter}
          className="md:hidden mt-4 mb-4"
        />
      )}
    </>
  );
}
