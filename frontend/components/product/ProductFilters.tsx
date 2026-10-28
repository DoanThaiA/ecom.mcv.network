'use client';

import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import { AppLocale } from '@/lib/locale';
import { filterTopLevelCategories } from '@/lib/utils/categoryFilters';
import { formatPriceRange } from '@/lib/utils/format';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import { CheckIcon, MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Box, Flex, Text, Popover } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Slider } from 'radix-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Drawer } from 'vaul';

interface FilterCategory {
  key: string;
  label: string;
}

interface ProductFiltersProps {
  locale: AppLocale;
  variant?: 'drawer' | 'popover';
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onApply?: () => void;
  categories?: ProductCategory[];
  selectedCategories?: string[];
  onCategoriesChange?: (_categories: string[]) => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (_range: [number, number]) => void;
  selectedSizes?: string[];
  onSizesChange?: (_sizes: string[]) => void;
  selectedColors?: string[];
  onColorsChange?: (_colors: string[]) => void;
  selectedTrends?: string[];
  onTrendsChange?: (_trends: string[]) => void;
  topics?: ShopTopicItem[];
  selectedTopics?: string[];
  onTopicsChange?: (_topicIds: string[]) => void;
}

export function ProductFilters({
  locale,
  variant = 'drawer',
  trigger,
  isOpen,
  onClose,
  onApply,
  categories: categoriesProp,
  selectedCategories = [],
  onCategoriesChange,
  priceRange = [0, 10000000],
  onPriceRangeChange,
  selectedSizes = [],
  onSizesChange,
  selectedColors = [],
  onColorsChange,
  topics = [],
  selectedTopics = [],
  onTopicsChange,
}: ProductFiltersProps) {
  const t = useTranslations('productListing');
  
  // State for popover open/close
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleCategory = (category: string) => {
    if (onCategoriesChange) {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];
      onCategoriesChange(newCategories);
    }
  };

  const toggleSize = (size: string) => {
    if (onSizesChange) {
      const newSizes = selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size];
      onSizesChange(newSizes);
    }
  };

  const toggleColor = (color: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onColorsChange) {
      const newColors = selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color];
      onColorsChange(newColors);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (onTopicsChange) {
      const newTopics = selectedTopics.includes(topicId)
        ? selectedTopics.filter((id) => id !== topicId)
        : [...selectedTopics, topicId];
      onTopicsChange(newTopics);
    }
  };

  // Reset all filters
  const handleReset = useCallback(() => {
    onCategoriesChange?.([]);
    onPriceRangeChange?.([0, 10000000]);
    onSizesChange?.([]);
    onColorsChange?.([]);
    onTopicsChange?.([]);
  }, [
    onCategoriesChange,
    onPriceRangeChange,
    onSizesChange,
    onColorsChange,
    onTopicsChange,
  ]);

  // Apply filters and close
  const handleApply = useCallback(() => {
    onApply?.();
    onClose?.();
    setPopoverOpen(false); // Close popover
  }, [onApply, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Filter to show only top-level categories (level 1) and map to filter format
  const topLevelCategories = useMemo(
    () => filterTopLevelCategories(categoriesProp || []),
    [categoriesProp]
  );

  // Map API categories to filter format, or fallback to static categories
  const categories: FilterCategory[] =
    topLevelCategories.length > 0
      ? topLevelCategories.map((cat) => ({
          key: cat.id,
          label: getLocalizedName(cat.name, cat.nameLocalization, locale),
        }))
      : [
          { key: 'custom', label: t('categories.custom') },
          { key: 'shirts', label: t('categories.shirts') },
          { key: 'blouses', label: t('categories.blouses') },
          { key: 'tshirts', label: t('categories.tshirts') },
          { key: 'jackets', label: t('categories.jackets') },
          { key: 'sleeveless', label: t('categories.sleeveless') },
          { key: 'sets', label: t('categories.sets') },
          { key: 'skirts', label: t('categories.skirts') },
          { key: 'dresses', label: t('categories.dresses') },
        ];

  // Updated sizes per Figma design
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', 'FS'];

  // Updated colors with rounded rectangle style (matching Figma)
  const colors = [
    {
      key: 'blue-white',
      label: t('colors.blueWhite'),
      hex: 'linear-gradient(90deg, #4A90D9 50%, #FFFFFF 50%)',
    },
    { key: 'burgundy', label: t('colors.burgundy'), hex: '#6B1B29' },
    { key: 'teal', label: t('colors.teal'), hex: '#4A6B6B' },
    { key: 'beige', label: t('colors.beige'), hex: '#C4B49A' },
    { key: 'taupe', label: t('colors.taupe'), hex: '#8B8B7A' },
    { key: 'light-gray', label: t('colors.lightGray'), hex: '#D4D4C4' },
    { key: 'olive', label: t('colors.olive'), hex: '#9A8B6B' },
    { key: 'black', label: t('colors.black'), hex: '#000000' },
    { key: 'dark-gray', label: t('colors.darkGray'), hex: '#2D2D2D' },
  ];



  // Filter Content - shared between drawer and popover
  const filterContent = (
    <>
      {/* Price Range - Khoảng giá */}
      <Box className="mb-4 flex gap-4 flex-col">
        <Text className="font-semibold text-sm">{t('priceRangeLabel')}</Text>
        <Slider.Root
          value={priceRange}
          onValueChange={(val) => onPriceRangeChange?.(val as [number, number])}
          min={0}
          max={10000000}
          step={10000}
          minStepsBetweenThumbs={1}
          className="relative flex items-center h-5 select-none touch-pan-y"
        >
          <Slider.Track className="bg-gray-300 relative flex-grow h-1.5 rounded-full">
            <Slider.Range className="absolute bg-[#2E7D32] h-full rounded-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#2E7D32] rounded-full shadow-md focus:outline-none touch-pan-y" />
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#2E7D32] rounded-full shadow-md focus:outline-none touch-pan-y" />
        </Slider.Root>
        <Text className="block text-xs text-black">
          {t('priceRangeLabel')}:{' '}
          <Text className="font-bold ">
            {formatPriceRange(priceRange[0], priceRange[1])}
          </Text>
        </Text>
      </Box>

      {/* Color - Chọn màu */}
      <Box className="mb-4 pt-4 flex gap-4 flex-col border-t border-[#F0F0F0]">
        <Text className="font-semibold text-sm ">{t('selectColor')}</Text>
        <Flex className="flex flex-row gap-2" wrap="wrap">
          {colors.map((color) => (
            <button
              key={color.key}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleColor(color.key);
              }}
              className={`w-12 h-6 rounded-lg cursor-pointer transition-all ${
                selectedColors.includes(color.key)
                  ? 'ring-2 ring-offset-2 ring-[#2E7D32]'
                  : 'border border-gray-200'
              }`}
              style={{ background: color.hex }}
              title={color.label}
              aria-label={color.label}
            />
          ))}
        </Flex>
      </Box>

      {/* Size - Chọn kích cỡ */}
      <Box className="mb-4 pt-4 flex gap-4 flex-col border-t border-[#F0F0F0]">
        <Text className="font-semibold text-sm">{t('selectSize')}</Text>
        <Flex className="flex flex-row gap-2" wrap="wrap">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`min-w-[2.5rem] px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-[#FAA63E] text-black '
                  : 'bg-[#fff] text-gray-700 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </Flex>
      </Box>

      {/* Categories - Danh mục */}
      <Box className="mb-4 pt-4 flex gap-4 flex-col border-t border-[#F0F0F0]">
        <Text className="font-semibold text-sm">{t('productCategories')}</Text>
        <Box className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.key);
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => toggleCategory(category.key)}
                className="flex items-center gap-2 cursor-pointer text-left"
              >
                <Flex
                  align="center"
                  justify="center"
                  className={`w-5 h-5 rounded-full flex-shrink-0 transition-all ${
                    isSelected ? 'bg-[#D97706]' : 'border border-gray-300'
                  }`}
                >
                  {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                </Flex>
                <Text className="text-sm">{category.label}</Text>
              </button>
            );
          })}
        </Box>
      </Box>

      {/* Product Type - Loại hàng (Topics) */}
      {topics && topics.length > 0 && (
        <Box className="mb-4 pt-4 flex gap-4 flex-col border-t border-[#F0F0F0]">
          <Text className="font-semibold text-sm">{t('productType')}</Text>
          <Box className="grid grid-cols-2 gap-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className={`px-5 py-2.5 rounded-full cursor-pointer text-base font-normal transition-all ${
                  selectedTopics.includes(topic.id)
                    ? 'bg-[#D97706] text-white'
                    : 'bg-[#FFDBBB] text-gray-800 hover:bg-[#FFC794]'
                }`}
              >
                {getLocalizedName(topic.name, topic.localization, locale)}
              </button>
            ))}
          </Box>
        </Box>
      )}
    </>
  );

  // Popover variant for tablet+
  if (variant === 'popover') {
    return (
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger>
          {trigger}
        </Popover.Trigger>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="p-0"
        >
          <Box
            className="bg-[#FEF8F1] rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <Flex justify="between" align="center" className="px-4 py-3 border-b border-gray-200">
              <Flex align="center" gap="2">
                <Text className="font-semibold text-sm">{t('filters')}</Text>
                <MixerHorizontalIcon width="16" height="16" />
              </Flex>
              <Popover.Close>
                <Cross2Icon width="20" height="20" className="cursor-pointer text-gray-500 hover:text-gray-700" />
              </Popover.Close>
            </Flex>

            {/* Scrollable Content */}
            <Box className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              {filterContent}
            </Box>

            {/* Footer */}
            <Flex className="px-4 py-3 border-t border-gray-200 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-full border border-gray-300 bg-white font-medium cursor-pointer uppercase text-sm hover:bg-gray-50 transition-colors"
              >
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-full bg-[#D97706] text-white font-medium cursor-pointer uppercase text-sm hover:bg-[#B45309] transition-colors"
              >
                {t('apply')}
              </button>
            </Flex>
          </Box>
        </Popover.Content>
      </Popover.Root>
    );
  }

  // Default: Drawer variant for mobile
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <Drawer.Portal>
        <Drawer.Content aria-describedby={undefined} className="m-3 rounded-xl fixed top-[60px] left-0 right-0 bottom-0 z-50 bg-[#FEF8F1] flex flex-col outline-none">
          {/* Header */}
          <Flex
            justify="between"
            align="center"
            className="px-4 py-4 border-b border-[#F0F0F0] flex-shrink-0"
          >
            <Flex align="center" gap="2" direction="row">
              <Drawer.Title className="font-semibold text-sm mr-2">
                {t('filters')}
              </Drawer.Title>
              <MixerHorizontalIcon width="18" height="18" />
            </Flex>
            <Drawer.Close asChild>
              <button
                type="button"
                className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image
                  src="/assets/svg/close.svg"
                  alt="close"
                  width={24}
                  height={24}
                />
              </button>
            </Drawer.Close>
          </Flex>

          {/* Scrollable Content */}
          <Box className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4">
            {filterContent}
          </Box>

          {/* Bottom Buttons */}
          <Flex className="px-4 py-4  gap-3 flex-shrink-0 bg-[#fff]">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 rounded-full border border-[#F0F0F0] bg-white font-semibold cursor-pointer uppercase text-base hover:bg-gray-50 transition-colors"
            >
              {t('reset')}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 rounded-full bg-[#D97706] text-white font-medium cursor-pointer uppercase text-base hover:bg-[#B45309] transition-colors"
            >
              {t('apply')}
            </button>
          </Flex>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
