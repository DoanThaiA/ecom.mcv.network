'use client';

import { useIsMobile } from '@/lib/hooks/useBreakpoint';
import { AppLocale } from '@/lib/locale';
import { productRepository } from '@/lib/repositories/product.repository';
import { storageService } from '@/lib/services/storage.service';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import type { Product } from '@/types/gen/shared/shared/products/product';
import {
  ChevronLeftIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Text,
  TextField,
  VisuallyHidden,
} from '@radix-ui/themes';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from '../product/ProductCard';

interface SearchOverlayProps {
  locale: AppLocale;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onBack?: () => void;
  initialQuery?: string;
}

export function SearchOverlay({
  locale,
  open,
  onOpenChange,
  initialQuery,
}: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [topKeywords, setTopKeywords] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const t = useTranslations('search');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const isMobileHook = useIsMobile();

  // Embla Carousel for product slider
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset carousel when switching between recommended and search results
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0);
      setSelectedIndex(0);
    }
  }, [hasSearched, emblaApi]);

  // Lock viewport mode when overlay opens to prevent layout shift during hydration
  const [lockedIsMobile, setLockedIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (open && lockedIsMobile === null) {
      setLockedIsMobile(isMobileHook);
    }
    if (!open) {
      setLockedIsMobile(null);
    }
  }, [open, isMobileHook, lockedIsMobile]);

  const isMobile = lockedIsMobile ?? isMobileHook;

  // Group products into slides (4 products per slide - 2x2 grid)
  const ITEMS_PER_SLIDE = 4;
  const groupProductsIntoSlides = (productList: Product[]): Product[][] => {
    return productList.reduce<Product[][]>((acc, product, index) => {
      const slideIndex = Math.floor(index / ITEMS_PER_SLIDE);
      if (!acc[slideIndex]) acc[slideIndex] = [];
      acc[slideIndex].push(product);
      return acc;
    }, []);
  };

  // Determine which products to show in slider
  const displayProducts = hasSearched ? products : recentlyViewedProducts;
  const displayTitle = hasSearched ? t('searchResults') : t('recentlyViewed');
  const groupedProducts = groupProductsIntoSlides(displayProducts);

  // Load recently viewed products from storage (full product data already stored)
  // Returns true if has recently viewed, false otherwise
  const loadRecentlyViewed = useCallback((): boolean => {
    const products = storageService.getRecentlyViewedProducts();
    setRecentlyViewedProducts(products);
    return products.length > 0;
  }, []);

  // Fetch top keywords (cached in repository, returns empty on error)
  const fetchTopKeywords = useCallback(async () => {
    const keywords = await productRepository.getTopKeywords();
    setTopKeywords(keywords);
  }, []);

  // Load recently viewed and top keywords when overlay opens
  useEffect(() => {
    if (open && !hasSearched) {
      loadRecentlyViewed();
      fetchTopKeywords();
    }
  }, [open, hasSearched, loadRecentlyViewed, fetchTopKeywords]);

  // Clear debounce timer
  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Perform search function
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await productRepository.getShopProducts({
        page: 1,
        limit: 20,
        filters: {
          search: query.trim(),
          categoryIds: [],
        },
      });
      setProducts(response.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change - auto-search with debounce
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedKeyword(null); // Clear keyword selection when typing manually

    // Debounce auto-search for both mobile and desktop
    if (value.trim()) {
      clearDebounce();
      debounceTimerRef.current = setTimeout(() => {
        performSearch(value);
      }, 500);
    }
  };

  // Search function - only called on form submit (Enter key)
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearDebounce(); // Cancel debounce if waiting
    await performSearch(searchQuery);
  };

  // Auto-search when opened with initialQuery (from desktop search bar)
  useEffect(() => {
    if (open && initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [open, initialQuery]);

  // Clear search
  const handleClear = () => {
    clearDebounce();
    setSearchQuery('');
    setProducts([]);
    setHasSearched(false);
    setSelectedKeyword(null);
    inputRef.current?.focus();
  };

  // Auto focus input when overlay opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    // Reset state when closing
    if (!open) {
      clearDebounce();
      setSearchQuery('');
      setProducts([]);
      setHasSearched(false);
      setSelectedKeyword(null);
    }
  }, [open, clearDebounce]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      router.push(
        `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`,
      );
    } else {
      router.push(`/${locale}/search`);
    }
    handleClose();
  };

  // Handle keyword click - toggle selection and search
  const handleKeywordClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      // Toggle off - clear selection and reset search
      setSelectedKeyword(null);
      setSearchQuery('');
      setProducts([]);
      setHasSearched(false);
    } else {
      // Select keyword and search
      setSelectedKeyword(keyword);
      setSearchQuery(keyword);
      performSearch(keyword);
    }
  };

  // Mobile dialog content
  const mobileContent = (
    <Flex direction="column" >
      {/* Header: back button + search input */}
      <Flex align="center" gap="3" className="px-4 py-3 flex-shrink-0">
        <Box className="cursor-pointer" onClick={handleClose}>
          <ChevronLeftIcon width={24} height={24} className="text-black" />
        </Box>
        <form onSubmit={handleSearch} className="flex-1">
          <Box className="relative">
            <TextField.Root
              ref={inputRef}
              placeholder={tNav('search')}
              size="3"
              className="w-full pl-10 pr-10 bg-white border border-[#e0e0e0] rounded-full"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <MagnifyingGlassIcon
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            {searchQuery && (
              <Box
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={handleClear}
              >
                <Cross2Icon width={20} height={20} className="text-black" />
              </Box>
            )}
          </Box>
        </form>
      </Flex>

      {/* Content */}
      <Flex direction="column" className="px-4">
        {/* Trending keywords - always show */}
        {topKeywords.length > 0 && (
          <Box className="mb-4 flex-shrink-0">
            <Text className="text-lg font-semibold text-black mb-3 block">
              {t('trendingKeywords')}
            </Text>
            <Flex wrap="wrap" gap="2">
              {topKeywords.map((keyword, index) => {
                const isSelected = selectedKeyword === keyword;
                return (
                  <Box
                    key={index}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    <Text
                      className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}
                    >
                      {keyword}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Section title - shown for search results or recently viewed */}
        {displayTitle && (
          <Text className="text-xl font-semibold text-black mb-3 block flex-shrink-0">
            {displayTitle}
          </Text>
        )}

        {/* Loading state */}
        {hasSearched && loading && (
          <Flex justify="center" align="center" className="py-8">
            <Spinner size="3" />
          </Flex>
        )}

        {/* Products horizontal scroll */}
        {!loading && displayProducts.length > 0 && (
          <Flex gap="3" className="overflow-x-auto pb-2">
            {displayProducts.map((product) => (
              <Box key={product.id} className="flex-shrink-0 w-[140px]">
                <ProductCard product={product} locale={locale} />
              </Box>
            ))}
          </Flex>
        )}

        {/* No results - only shown after search */}
        {hasSearched && !loading && products.length === 0 && (
          <Flex justify="center" align="center" className="py-8">
            <Text className="text-gray-500">{t('noResults')}</Text>
          </Flex>
        )}

        {/* No recently viewed - only shown when not searching */}
        {!hasSearched && !loading && recentlyViewedProducts.length === 0 && (
          <Flex justify="center" align="center" className="py-8">
            <Text className="text-gray-500">{t('noRecentlyViewed')}</Text>
          </Flex>
        )}
      </Flex>

      {/* View All Button - only shown after search with results */}
      {hasSearched && !loading && products.length > 0 && (
        <Flex justify="center" className="px-4 py-3 border-t border-gray-100">
          <Box
            className="px-6 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background:
                'linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
            }}
            onClick={handleViewAll}
          >
            <Text className="text-sm font-medium text-white uppercase">
              {tCommon('buttons.viewAll')}
            </Text>
          </Box>
        </Flex>
      )}
    </Flex>
  );

  // Desktop dialog content
  const desktopContent = (
    <Flex direction="column" className="h-full overflow-hidden">
      {/* Search Section */}
      <Flex
        direction="column"
        gap="4"
        className="px-8 py-4 bg-white flex-shrink-0"
      >
        {/* Title with close button */}
        <Flex justify="between" align="center">
          <Text className="text-2xl font-semibold text-black">
            {tNav('search')}
          </Text>
          <Box className="cursor-pointer p-1" onClick={handleClose}>
            <Cross2Icon width={24} height={24} className="text-black" />
          </Box>
        </Flex>

        {/* Search input */}
        <form onSubmit={handleSearch} className="w-full">
          <Box className="relative">
            <TextField.Root
              ref={inputRef}
              placeholder={tNav('search')}
              size="3"
              className="w-full pl-10 pr-10 bg-white border border-[#f0f0f0] rounded-full"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <MagnifyingGlassIcon
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
            />
            {searchQuery && (
              <Box
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={handleClear}
              >
                <Cross2Icon width={20} height={20} className="text-black" />
              </Box>
            )}
          </Box>
        </form>
      </Flex>

      {/* Content area */}
      <Box className="border-t border-[#f0f0f0] py-4 flex-1 min-h-0 overflow-y-auto px-8">
        {/* Trending keywords - always visible */}
        {topKeywords.length > 0 && (
          <Box className="mb-4">
            <Text className="text-lg font-semibold text-black mb-3 block">
              {t('trendingKeywords')}
            </Text>
            <Flex wrap="wrap" gap="2">
              {topKeywords.map((keyword, index) => {
                const isSelected = selectedKeyword === keyword;
                return (
                  <Box
                    key={index}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    <Text
                      className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}
                    >
                      {keyword}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Section title - shown for search results or recently viewed */}
        {displayTitle && (
          <Text className="text-lg font-semibold text-black mb-4 block">
            {displayTitle}
          </Text>
        )}

        {/* Loading state */}
        {hasSearched && loading && (
          <Flex justify="center" align="center" className="py-8">
            <Spinner size="3" />
          </Flex>
        )}

        {/* Products slider with 1 row grid */}
        {!loading && displayProducts.length > 0 && (
          <>
            <Box className="overflow-hidden" ref={emblaRef}>
              <Flex gap="3" align="start">
                {groupedProducts.map((group, slideIndex) => (
                  <Box key={slideIndex} className="flex-shrink-0 w-full">
                    <Grid columns="4" gap="4">
                      {group.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          locale={locale}
                        />
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* Dots pagination */}
            {groupedProducts.length > 1 && (
              <Flex gap="2" justify="center" className="mt-4">
                {groupedProducts.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      index === selectedIndex ? 'bg-black' : 'bg-black/30'
                    }`}
                  />
                ))}
              </Flex>
            )}
          </>
        )}

        {/* No results - only shown after search */}
        {hasSearched && !loading && products.length === 0 && (
          <Flex justify="center" align="center" className="py-8">
            <Text className="text-gray-500">{t('noResults')}</Text>
          </Flex>
        )}

        {/* No recently viewed - only shown when not searching */}
        {!hasSearched && !loading && recentlyViewedProducts.length === 0 && (
          <Flex justify="center" align="center" className="py-8">
            <Text className="text-gray-500">{t('noRecentlyViewed')}</Text>
          </Flex>
        )}
      </Box>

      {/* View All Button - fixed at bottom, only shown after search with results */}
      {hasSearched && !loading && products.length > 0 && (
        <Flex
          justify="center"
          className="flex-shrink-0 px-8 py-4 border-t border-gray-100 bg-white"
        >
          <Box
            className="px-6 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background:
                'linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
            }}
            onClick={handleViewAll}
          >
            <Text className="text-sm font-medium text-white uppercase">
              {tCommon('buttons.viewAll')}
            </Text>
          </Box>
        </Flex>
      )}
    </Flex>
  );

  // Both mobile and desktop use Dialog
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        maxWidth={isMobile ? '100%' : '900px'}
        className={
          isMobile
            ? '!fixed !top-0 !left-0 !right-0 !w-full !max-w-full !m-0 !p-0 !pb-4 !rounded-none !transform-none bg-white'
            : 'w-auto h-auto min-h-[80vh] !m-auto !p-0 !rounded-2xl bg-white overflow-hidden'
        }
      >
        <VisuallyHidden>
          <Dialog.Title>{tNav('search')}</Dialog.Title>
        </VisuallyHidden>
        {isMobile ? mobileContent : desktopContent}
      </Dialog.Content>
    </Dialog.Root>
  );
}
