import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { FilterTag } from '@/components/product/MobileFilterHeader';

interface UseSearchFiltersProps {
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
  if (!value) return [50000, 1500000];
  const [min, max] = value.split('-').map(Number);
  if (isNaN(min) || isNaN(max)) return [50000, 1500000];
  return [min, max];
};

export function useSearchFilters({ categories }: UseSearchFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get search query from URL
  const searchQuery = searchParams.get('q') || '';

  // Pending filter states (for UI) - initialize empty, sync from URL after mount
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([50000, 1500000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  // Applied filter states (for API calls) - only update when user clicks Apply
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number] | null>(null);
  const [appliedSizes, setAppliedSizes] = useState<string[]>([]);
  const [appliedColors, setAppliedColors] = useState<string[]>([]);
  const [appliedProductTypes, setAppliedProductTypes] = useState<string[]>([]);

  // Sync filter states from URL after mount (client-side only)
  // Sets both pending and applied states for initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Categories: use URL params (no default slug like category page)
    const categoriesFromUrl = parseArrayParam(params.get('categories'));
    setSelectedCategories(categoriesFromUrl);
    setAppliedCategories(categoriesFromUrl);

    // Price range - only apply filter if explicitly set in URL
    const priceFromUrl = params.get('price');
    if (priceFromUrl) {
      const initialPrice = parsePriceRange(priceFromUrl);
      setPriceRange(initialPrice);
      setAppliedPriceRange(initialPrice);
    } else {
      // No price param - use default for UI but don't apply filter
      setPriceRange([50000, 1500000]);
      setAppliedPriceRange(null);
    }

    // Sizes
    const sizesFromUrl = parseArrayParam(params.get('sizes'));
    setSelectedSizes(sizesFromUrl);
    setAppliedSizes(sizesFromUrl);

    // Colors
    const colorsFromUrl = parseArrayParam(params.get('colors'));
    setSelectedColors(colorsFromUrl);
    setAppliedColors(colorsFromUrl);

    // Product types
    const typesFromUrl = parseArrayParam(params.get('types'));
    setSelectedProductTypes(typesFromUrl);
    setAppliedProductTypes(typesFromUrl);

    setIsInitialized(true);
  }, [searchQuery]); // Re-run if search query changes


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

      // Keep existing params (including 'q' search query)
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

  const handleProductTypesChange = useCallback((newTypes: string[]) => {
    setSelectedProductTypes(newTypes);
  }, []);

  // Apply filters: copy pending → applied and update URL
  const applyFilters = useCallback(() => {
    setAppliedCategories(selectedCategories);
    setAppliedPriceRange(priceRange);
    setAppliedSizes(selectedSizes);
    setAppliedColors(selectedColors);
    setAppliedProductTypes(selectedProductTypes);

    // Update URL with applied filters
    updateUrlSilently({
      categories: selectedCategories,
      price: priceRange,
      sizes: selectedSizes,
      colors: selectedColors,
      types: selectedProductTypes,
    });
  }, [selectedCategories, priceRange, selectedSizes, selectedColors, selectedProductTypes, updateUrlSilently]);

  // Remove a single filter tag - updates both pending and applied (triggers API)
  const removeFilter = useCallback(
    (type: string, value: string) => {
      let newCategories = selectedCategories;
      let newSizes = selectedSizes;
      let newColors = selectedColors;
      let newTypes = selectedProductTypes;

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
        case 'productType':
          newTypes = selectedProductTypes.filter((t) => t !== value);
          setSelectedProductTypes(newTypes);
          setAppliedProductTypes(newTypes);
          break;
      }

      // Update URL
      updateUrlSilently({
        categories: newCategories,
        price: priceRange,
        sizes: newSizes,
        colors: newColors,
        types: newTypes,
      });
    },
    [selectedCategories, selectedSizes, selectedColors, selectedProductTypes, priceRange, updateUrlSilently]
  );

  // Clear all filters - resets both pending and applied (triggers API immediately)
  const clearAllFilters = useCallback(() => {
    const defaultPrice: [number, number] = [50000, 1500000];

    // Reset pending
    setSelectedCategories([]);
    setPriceRange(defaultPrice);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedProductTypes([]);

    // Reset applied (triggers API) - null means no price filter
    setAppliedCategories([]);
    setAppliedPriceRange(null);
    setAppliedSizes([]);
    setAppliedColors([]);
    setAppliedProductTypes([]);

    // Clear URL params (keep search query 'q')
    updateUrlSilently({
      categories: null,
      price: null,
      sizes: null,
      colors: null,
      types: null,
    });
  }, [updateUrlSilently]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || selectedProductTypes.length > 0;
  }, [selectedCategories, selectedSizes, selectedColors, selectedProductTypes]);

  // Get active filter tags for display
  const activeFilterTags = useMemo(() => {
    const tags: FilterTag[] = [];

    // Categories
    selectedCategories.forEach((code) => {
      const cat = categories?.find((c) => c.code === code);
      tags.push({ type: 'category', value: code, label: cat?.name || code });
    });

    // Sizes
    selectedSizes.forEach((size) => {
      tags.push({ type: 'size', value: size, label: size });
    });

    // Colors
    selectedColors.forEach((color) => {
      tags.push({ type: 'color', value: color, label: color });
    });

    // Product types
    selectedProductTypes.forEach((type) => {
      tags.push({ type: 'productType', value: type, label: type });
    });

    return tags;
  }, [selectedCategories, selectedSizes, selectedColors, selectedProductTypes, categories]);

  // Calculate filter count for badge display
  // Counts ALL applied filters including price range
  const filterCount = useMemo(() => {
    let count = 0;

    // Count all categories
    count += appliedCategories.length;

    // Count sizes, colors, productTypes
    count += appliedSizes.length;
    count += appliedColors.length;
    count += appliedProductTypes.length;

    // Count price if explicitly set
    if (appliedPriceRange !== null) {
      count += 1;
    }

    return count;
  }, [appliedCategories, appliedSizes, appliedColors, appliedProductTypes, appliedPriceRange]);

  return {
    // Search query
    searchQuery,

    // Pending states (for UI)
    selectedCategories,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedProductTypes,
    sortValue,
    isInitialized,

    // Applied states (for API calls)
    appliedCategories,
    appliedPriceRange,
    appliedSizes,
    appliedColors,
    appliedProductTypes,

    // Setters
    setSortValue,

    // Handlers (update pending only)
    handleCategoriesChange,
    handlePriceRangeChange,
    handleSizesChange,
    handleColorsChange,
    handleProductTypesChange,

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
