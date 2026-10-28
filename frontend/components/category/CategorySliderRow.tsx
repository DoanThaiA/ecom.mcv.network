'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import useEmblaCarousel from 'embla-carousel-react';
import { CategoryCard } from './CategoryCard';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

interface CategorySliderRowProps {
  categories: ProductCategory[];
  locale?: string;
}

export function CategorySliderRow({
  categories,
  locale = 'vi',
}: CategorySliderRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('scroll', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('scroll', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Box className="relative">
      {/* Embla Viewport */}
      <Box className="overflow-hidden" ref={emblaRef}>
        <Flex gap="1" align="start">
          {categories.map((category) => (
            <Box
              key={category.id}
              className="flex-[0_0_47%] md:flex-[0_0_23%] lg:flex-[0_0_15%] min-w-0 pr-3"
            >
              <CategoryCard category={category} locale={locale} />
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Left Arrow Button */}
      {canScrollLeft && (
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

      {/* Right Arrow Button */}
      {canScrollRight && (
        <Box className="absolute right-2 top-[45%] -translate-y-1/2 z-10">
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
    </Box>
  );
}
