'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/gen/shared/shared/products/product';

type DisplayMode = 'grid' | 'row';

interface ProductSliderProps {
  products: Product[];
  locale?: string;
  displayMode?: DisplayMode;
  gridCols?: string;
  itemsPerSlide?: number;
  fromFlashSale?: boolean;
  /** When set, shows a "View all" slide at the end (row mode only). */
  seeAllText?: string;
  seeAllLink?: string;
}

export function ProductSlider({
  products,
  locale = 'vi',
  displayMode = 'row',
  gridCols,
  itemsPerSlide: itemsPerSlideProp,
  fromFlashSale = false,
  seeAllText,
  seeAllLink,
}: ProductSliderProps) {
  const isGridMode = displayMode === 'grid';

  // All hooks must be called before any early returns (Rules of Hooks)
  const [responsiveItemsPerSlide, setResponsiveItemsPerSlide] = useState(4);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  // Responsive itemsPerSlide for grid mode (2 rows × number of columns per breakpoint)
  useEffect(() => {
    if (!isGridMode || itemsPerSlideProp !== undefined) return;

    const updateItemsPerSlide = () => {
      // 2 rows × columns based on breakpoint
      if (window.innerWidth >= 1024) {
        // lg: 7 cols × 2 rows (matching lg:grid-cols-7)
        setResponsiveItemsPerSlide(14);
      } else if (window.innerWidth >= 768) {
        // md: 4 cols × 2 rows
        setResponsiveItemsPerSlide(8);
      } else {
        // mobile: 2 cols × 2 rows
        setResponsiveItemsPerSlide(4);
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, [isGridMode, itemsPerSlideProp]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('scroll', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('scroll', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Safety check: handle undefined/null products - AFTER all hooks
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  const itemsPerSlide =
    itemsPerSlideProp ?? (isGridMode ? responsiveItemsPerSlide : 1);

  // Group products for grid mode (4 items per slide: 2 rows x 2 columns)
  const groupedProducts = isGridMode
    ? products.reduce<Product[][]>((acc, product, index) => {
        const slideIndex = Math.floor(index / itemsPerSlide);
        if (!acc[slideIndex]) acc[slideIndex] = [];
        acc[slideIndex].push(product);
        return acc;
      }, [])
    : [];

  // Grid mode: show "Xem tất cả" as a card in the last slide only (next to last product)
  const hasSeeAllCardInGrid =
    isGridMode && fromFlashSale && Boolean(seeAllText) && Boolean(seeAllLink);

  // For dots in grid mode, use total number of slides
  const dotsCount = isGridMode ? groupedProducts.length : scrollSnaps.length;

  const renderProductCard = (product: Product) => {
    return (
      <ProductCard
        key={product.id}
        product={product}
        locale={locale}
        fromFlashSale={fromFlashSale}
      />
    );
  };

  return (
    <Box className="relative">
      {/* Embla Viewport */}
      <Box className={`overflow-hidden`} ref={emblaRef}>
        <Flex gap="1" align="start">
          {isGridMode
            ? // Grid mode: product grid; last slide only gets +1 "Xem tất cả" card in same grid
              groupedProducts.map((group, slideIndex) => (
                <Box key={slideIndex} className="flex-shrink-0 w-full">
                  <Box className={`grid ${gridCols || 'grid-cols-2'} gap-3`}>
                    {group.map((product) => (
                      <Box key={product.id}>{renderProductCard(product)}</Box>
                    ))}
                    {slideIndex === groupedProducts.length - 1 &&
                      hasSeeAllCardInGrid && (
                        <Box
                          key="see-all"
                          className="flex items-center justify-center w-full aspect-[3/4] self-start rounded bg-gradient-to-b from-[#FEF8F1] to-[#F4C891]"
                        >
                          <Link
                            href={seeAllLink!}
                            className="no-underline flex items-center justify-center text-[1.75rem] sm:text-[2.75rem] md:text-[2.75rem] lg:text-[1.75rem] xl:text-[2.75rem]  font-bold text-[#9B5526] hover:opacity-90 transition-opacity w-full h-full"
                          >
                            <Flex direction="column" align="center" gap="0">
                              {seeAllText!
                                .split(/\s+/)
                                .slice(0, 3)
                                .map((word, i) =>
                                  i === 2 ? (
                                    <Box
                                      key={i}
                                      className="relative inline-block"
                                    >
                                      <span className="block">{word}</span>
                                      <ChevronRightIcon
                                        width={32}
                                        height={32}
                                        className="text-[#9B5526] absolute top-1/2 -translate-y-1/2 left-full"
                                      />
                                    </Box>
                                  ) : (
                                    <span key={i}>{word}</span>
                                  ),
                                )}
                            </Flex>
                          </Link>
                        </Box>
                      )}
                  </Box>
                </Box>
              ))
            : // Row mode: mỗi product 1 slide, responsive width
              products.map((product) => (
                <Box
                  key={product.id}
                  className="flex-[0_0_47%] md:flex-[0_0_23%] lg:flex-[0_0_15%] min-w-0 pr-3"
                >
                  {renderProductCard(product)}
                </Box>
              ))}
        </Flex>
      </Box>
      {/* Left Arrow Button - Only shown in row mode */}
      {!isGridMode && canScrollLeft && (
        <Box className="absolute -left-2 top-[45%] -translate-y-1/2 z-10">
          <IconButton
            onClick={scrollPrev}
            className="bg-transparent cursor-pointer p-0"
          >
            <Image
              src="/assets/svg/arrow-left-circle.svg"
              alt="Previous"
              width={32}
              height={32}
            />
          </IconButton>
        </Box>
      )}

      {/* Right Arrow Button - Only shown in row mode */}
      {!isGridMode && canScrollRight && (
        <Box className="absolute  right-2 top-[45%] -translate-y-1/2 z-10">
          <IconButton
            onClick={scrollNext}
            className="bg-transparent cursor-pointer p-0"
          >
            <Image
              src="/assets/svg/arrow-right-circle.svg"
              alt="Next"
              width={32}
              height={32}
            />
          </IconButton>
        </Box>
      )}

      {/* Dots Pagination - Only shown in grid mode */}
      {isGridMode && dotsCount > 1 && (
        <Flex gap="2" justify="center" className="my-6">
          {Array.from({ length: dotsCount }).map((_, index) => (
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
    </Box>
  );
}
