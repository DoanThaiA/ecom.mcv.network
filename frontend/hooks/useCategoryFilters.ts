import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import type { FilterTag } from '@/components/product/MobileFilterHeader';

interface UseCategoryFiltersProps {
  categoryId: string;
  categories?: ProductCategory[];
  topics?: ShopTopicItem[];
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

export function useCategoryFilters({ categoryId, categories, topics }: UseCategoryFiltersProps) {
  const pathname = usePathname();

  // Pending filter states (for UI) - initialize empty, sync from URL after mount
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  // Applied filter states (for API calls) - only update when user clicks Apply
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 10000000]);
  const [appliedSizes, setAppliedSizes] = useState<string[]>([]);
  const [appliedColors, setAppliedColors] = useState<string[]>([]);
  const [appliedTopics, setAppliedTopics] = useState<string[]>([]);

  // Sync filter states from URL after mount (client-side only)
  // Sets both pending and applied states for initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Categories: use URL params if available, otherwise use categoryId
    const categoriesFromUrl = parseArrayParam(params.get('categories'));
    const initialCategories = categoriesFromUrl.length > 0 ? categoriesFromUrl : categoryId ? [categoryId] : [];
    setSelectedCategories(initialCategories);
    setAppliedCategories(initialCategories);

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

    // Topics
    const topicsFromUrl = parseArrayParam(params.get('topics'));
    setSelectedTopics(topicsFromUrl);
    setAppliedTopics(topicsFromUrl);

    setIsInitialized(true);
  }, [categoryId]); // Re-run if categoryId changes


  /**
   * Update URL without triggering RSC request (using replaceState)
   * Build query string manually to avoid encoding commas (cleaner URL like YouTube)
   */
  const updateUrlSilently = useCallback(
    (updates: Record<string, string[] | [number, number] | null>) => {
      if (typeof window === 'undefined') return;

      // Parse current URL params
      const currentParams = new URLSearchParams(window.location.search);
      const paramsObj: Record<string, string> = {};

      // Keep existing params
      currentParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          delete paramsObj[key];
        } else if (key === 'price' && Array.isArray(value)) {
          paramsObj[key] = `${value[0]}-${value[1]}`;
        } else if (Array.isArray(value)) {
          paramsObj[key] = value.join(',');
        }
      });

      // Build query string manually (without encoding commas)
      const queryString = Object.entries(paramsObj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value).replace(/%2C/g, ',')}`)
        .join('&');

      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use replaceState to update URL without triggering navigation/RSC
      window.history.replaceState(null, '', newUrl);
    },
    [pathname]
  );

  // Handlers update only pending state (UI) - NOT triggering API
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

  const handleTopicsChange = useCallback((newTopics: string[]) => {
    setSelectedTopics(newTopics);
  }, []);

  // Apply filters: copy pending → applied and update URL
  const applyFilters = useCallback(() => {
    setAppliedCategories(selectedCategories);
    setAppliedPriceRange(priceRange);
    setAppliedSizes(selectedSizes);
    setAppliedColors(selectedColors);
    setAppliedTopics(selectedTopics);

    // Update URL with applied filters
    updateUrlSilently({
      categories: selectedCategories,
      price: priceRange,
      sizes: selectedSizes,
      colors: selectedColors,
      topics: selectedTopics,
    });
  }, [selectedCategories, priceRange, selectedSizes, selectedColors, selectedTopics, updateUrlSilently]);

  // Remove a single filter tag - updates both pending and applied (triggers API)
  const removeFilter = useCallback(
    (type: string, value: string) => {
      let newCategories = selectedCategories;
      let newSizes = selectedSizes;
      let newColors = selectedColors;
      let newTopics = selectedTopics;

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
        case 'topic':
          newTopics = selectedTopics.filter((t) => t !== value);
          setSelectedTopics(newTopics);
          setAppliedTopics(newTopics);
          break;
      }

      // Update URL
      updateUrlSilently({
        categories: newCategories,
        price: priceRange,
        sizes: newSizes,
        colors: newColors,
        topics: newTopics,
      });
    },
    [selectedCategories, selectedSizes, selectedColors, selectedTopics, priceRange, updateUrlSilently]
  );

  // Clear all filters - resets both pending and applied (triggers API immediately)
  const clearAllFilters = useCallback(() => {
    const defaultCategories = categoryId ? [categoryId] : [];
    const defaultPrice: [number, number] = [0, 10000000];

    // Reset pending
    setSelectedCategories(defaultCategories);
    setPriceRange(defaultPrice);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedTopics([]);

    // Reset applied (triggers API)
    setAppliedCategories(defaultCategories);
    setAppliedPriceRange(defaultPrice);
    setAppliedSizes([]);
    setAppliedColors([]);
    setAppliedTopics([]);

    // Clear URL params
    updateUrlSilently({
      categories: null,
      price: null,
      sizes: null,
      colors: null,
      topics: null,
    });
  }, [categoryId, updateUrlSilently]);

  // Check if any filters are active (beyond the default category)
  const hasActiveFilters = useMemo(() => {
    const hasExtraCategories =
      selectedCategories.length > 1 || (selectedCategories.length === 1 && selectedCategories[0] !== categoryId);
    return hasExtraCategories || selectedSizes.length > 0 || selectedColors.length > 0 || selectedTopics.length > 0;
  }, [selectedCategories, selectedSizes, selectedColors, selectedTopics, categoryId]);

  // Get active filter tags for display
  const activeFilterTags = useMemo(() => {
    const tags: FilterTag[] = [];

    // Categories (only show if different from current categoryId)
    selectedCategories.forEach((id) => {
      if (id !== categoryId) {
        const cat = categories?.find((c) => c.id === id);
        tags.push({ type: 'category', value: id, label: cat?.name || id });
      }
    });

    // Sizes
    selectedSizes.forEach((size) => {
      tags.push({ type: 'size', value: size, label: size });
    });

    // Colors
    selectedColors.forEach((color) => {
      tags.push({ type: 'color', value: color, label: color });
    });

    // Topics
    selectedTopics.forEach((topicId) => {
      const topic = topics?.find((t) => t.id === topicId);
      tags.push({ type: 'topic', value: topicId, label: topic?.name || topicId });
    });

    return tags;
  }, [selectedCategories, selectedSizes, selectedColors, selectedTopics, categoryId, categories, topics]);

  // Calculate filter count for badge display
  // Counts ALL applied filters including category from slug and price range
  const filterCount = useMemo(() => {
    let count = 0;

    // Count ALL categories (including slug)
    count += appliedCategories.length;

    // Count sizes, colors, topics
    count += appliedSizes.length;
    count += appliedColors.length;
    count += appliedTopics.length;

    // Count price if different from default
    if (appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 10000000) {
      count += 1;
    }

    return count;
  }, [appliedCategories, appliedSizes, appliedColors, appliedTopics, appliedPriceRange]);

  return {
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
    appliedSizes,
    appliedColors,
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
  };
}
