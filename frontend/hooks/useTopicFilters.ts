import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import type { FilterTag } from '@/components/product/MobileFilterHeader';

interface UseTopicFiltersProps {
  topicId: string;
  topics: ShopTopicItem[];
  categories?: ProductCategory[];
}

/**
 * Parse comma-separated string from URL to array
 */
const parseArrayParam = (value: string | null): string[] => {
  if (!value) return [];
  return value.split(',').filter(Boolean);
};

/**
 * Parse price range from URL (format: "min-max")
 */
const parsePriceRange = (value: string | null): [number, number] => {
  if (!value) return [0, 10000000];
  const [min, max] = value.split('-').map(Number);
  if (isNaN(min) || isNaN(max)) return [0, 10000000];
  return [min, max];
};

export function useTopicFilters({ topicId, topics, categories }: UseTopicFiltersProps) {
  const pathname = usePathname();

  // Find topic from ID - this is the fixed filter
  const topicItem = useMemo(() => {
    return topics.find((t) => t.id === topicId);
  }, [topics, topicId]);

  const topicName = topicItem?.name || '';

  // Pending filter states (for UI) - initialize empty, sync from URL after mount
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  // Applied filter states (for API calls) - only update when user clicks Apply
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 10000000]);
  const [appliedSizes, setAppliedSizes] = useState<string[]>([]);
  const [appliedColors, setAppliedColors] = useState<string[]>([]);

  // Sync filter states from URL after mount (client-side only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Categories from URL (no default - topic is the main filter)
    const categoriesFromUrl = parseArrayParam(params.get('categories'));
    setSelectedCategories(categoriesFromUrl);
    setAppliedCategories(categoriesFromUrl);

    // Price range
    const priceFromUrl = params.get('price');
    const initialPrice = priceFromUrl ? parsePriceRange(priceFromUrl) : [0, 10000000] as [number, number];
    setPriceRange(initialPrice);
    setAppliedPriceRange(initialPrice);

    // Sizes
    const sizesFromUrl = parseArrayParam(params.get('sizes'));
    setSelectedSizes(sizesFromUrl);
    setAppliedSizes(sizesFromUrl);

    // Colors
    const colorsFromUrl = parseArrayParam(params.get('colors'));
    setSelectedColors(colorsFromUrl);
    setAppliedColors(colorsFromUrl);

    // Sort
    const sortFromUrl = params.get('sort');
    if (sortFromUrl) {
      setSortValue(sortFromUrl);
    }

    setIsInitialized(true);
  }, [topicId]);

  /**
   * Update URL without triggering RSC request (using replaceState)
   */
  const updateUrlSilently = useCallback(
    (updates: Record<string, string[] | [number, number] | null>) => {
      if (typeof window === 'undefined') return;

      const currentParams = new URLSearchParams(window.location.search);
      const paramsObj: Record<string, string> = {};

      currentParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          delete paramsObj[key];
        } else if (key === 'price' && Array.isArray(value)) {
          paramsObj[key] = `${value[0]}-${value[1]}`;
        } else if (Array.isArray(value)) {
          paramsObj[key] = value.join(',');
        }
      });

      const queryString = Object.entries(paramsObj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value).replace(/%2C/g, ',')}`)
        .join('&');

      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, '', newUrl);
    },
    [pathname]
  );

  // Handlers update only pending state (UI)
  const handleCategoriesChange = useCallback((newCategories: string[]) => {
    setSelectedCategories(newCategories);
  }, []);

  const handlePriceRangeChange = useCallback((newRange: [number, number]) => {
    setPriceRange(newRange);
  }, []);

  const handleSizesChange = useCallback((newSizes: string[]) => {
    setSelectedSizes(newSizes);
  }, []);

  const handleColorsChange = useCallback((newColors: string[]) => {
    setSelectedColors(newColors);
  }, []);

  // Apply filters: copy pending → applied and update URL
  const applyFilters = useCallback(() => {
    setAppliedCategories(selectedCategories);
    setAppliedPriceRange(priceRange);
    setAppliedSizes(selectedSizes);
    setAppliedColors(selectedColors);

    updateUrlSilently({
      categories: selectedCategories,
      price: priceRange,
      sizes: selectedSizes,
      colors: selectedColors,
    });
  }, [selectedCategories, priceRange, selectedSizes, selectedColors, updateUrlSilently]);

  // Remove a single filter tag
  const removeFilter = useCallback(
    (type: string, value: string) => {
      let newCategories = selectedCategories;
      let newSizes = selectedSizes;
      let newColors = selectedColors;

      switch (type) {
        case 'category':
          newCategories = selectedCategories.filter((c) => c !== value);
          setSelectedCategories(newCategories);
          setAppliedCategories(newCategories);
          break;
        case 'size':
          newSizes = selectedSizes.filter((s) => s !== value);
          setSelectedSizes(newSizes);
          setAppliedSizes(newSizes);
          break;
        case 'color':
          newColors = selectedColors.filter((c) => c !== value);
          setSelectedColors(newColors);
          setAppliedColors(newColors);
          break;
      }

      updateUrlSilently({
        categories: newCategories,
        price: priceRange,
        sizes: newSizes,
        colors: newColors,
      });
    },
    [selectedCategories, selectedSizes, selectedColors, priceRange, updateUrlSilently]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const defaultPrice: [number, number] = [0, 10000000];

    setSelectedCategories([]);
    setPriceRange(defaultPrice);
    setSelectedSizes([]);
    setSelectedColors([]);

    setAppliedCategories([]);
    setAppliedPriceRange(defaultPrice);
    setAppliedSizes([]);
    setAppliedColors([]);

    updateUrlSilently({
      categories: null,
      price: null,
      sizes: null,
      colors: null,
    });
  }, [updateUrlSilently]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0;
  }, [selectedCategories, selectedSizes, selectedColors]);

  // Get active filter tags for display
  const activeFilterTags = useMemo(() => {
    const tags: FilterTag[] = [];

    selectedCategories.forEach((id) => {
      const cat = categories?.find((c) => c.id === id);
      tags.push({ type: 'category', value: id, label: cat?.name || id });
    });

    selectedSizes.forEach((size) => {
      tags.push({ type: 'size', value: size, label: size });
    });

    selectedColors.forEach((color) => {
      tags.push({ type: 'color', value: color, label: color });
    });

    return tags;
  }, [selectedCategories, selectedSizes, selectedColors, categories]);

  // Calculate filter count for badge display
  // Counts ALL applied filters including price range
  // Note: topic is fixed from URL slug, so we don't count it here
  const filterCount = useMemo(() => {
    let count = 0;

    // Count all categories
    count += appliedCategories.length;

    // Count sizes, colors
    count += appliedSizes.length;
    count += appliedColors.length;

    // Count price if different from default
    if (appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 10000000) {
      count += 1;
    }

    return count;
  }, [appliedCategories, appliedSizes, appliedColors, appliedPriceRange]);

  return {
    // Topic info (fixed from ID)
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
    appliedSizes,
    appliedColors,

    // Setters
    setSortValue,

    // Handlers
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
  };
}
