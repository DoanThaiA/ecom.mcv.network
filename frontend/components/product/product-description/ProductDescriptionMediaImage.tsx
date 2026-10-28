'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProductDescriptionMediaImageProps {
  src: string;
  alt: string;
  testId: 'top-image' | 'bottom-image';
  mobileHorizontalScroll?: boolean;
}

export function ProductDescriptionMediaImage({
  src,
  alt,
  testId,
  mobileHorizontalScroll = false,
}: ProductDescriptionMediaImageProps) {
  const t = useTranslations('productDetail');
  const railRef = useRef<HTMLDivElement>(null);
  const previousButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocusDirectionRef = useRef<-1 | 1 | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const regionClassName = mobileHorizontalScroll
    ? 'w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible'
    : 'w-full';
  const imageClassName = mobileHorizontalScroll
    ? 'h-[420px] w-auto max-w-none rounded-lg object-contain sm:h-[480px] md:h-auto md:w-full md:max-w-full'
    : 'h-auto w-full rounded-lg object-contain';

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail || !mobileHorizontalScroll) return;

    const nextCanScrollLeft = rail.scrollLeft > 1;
    const nextCanScrollRight =
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1;

    if (
      document.activeElement === nextButtonRef.current &&
      !nextCanScrollRight &&
      nextCanScrollLeft
    ) {
      pendingFocusDirectionRef.current = -1;
    } else if (
      document.activeElement === previousButtonRef.current &&
      !nextCanScrollLeft &&
      nextCanScrollRight
    ) {
      pendingFocusDirectionRef.current = 1;
    }

    setCanScrollLeft(nextCanScrollLeft);
    setCanScrollRight(nextCanScrollRight);
  }, [mobileHorizontalScroll]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !mobileHorizontalScroll) return;

    updateScrollState();
    rail.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      rail.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [mobileHorizontalScroll, updateScrollState]);

  useEffect(() => {
    const direction = pendingFocusDirectionRef.current;
    if (direction === null) return;

    const target =
      direction === -1 ? previousButtonRef.current : nextButtonRef.current;
    target?.focus();
    pendingFocusDirectionRef.current = null;
  }, [canScrollLeft, canScrollRight]);

  const scrollByStep = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  const image = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={imageClassName}
      onLoad={mobileHorizontalScroll ? updateScrollState : undefined}
    />
  );

  if (!mobileHorizontalScroll) {
    return (
      <Box ref={railRef} data-description-block={testId} className={regionClassName}>
        {image}
      </Box>
    );
  }

  return (
    <Box className="relative w-full min-w-0 max-w-full">
      <Box ref={railRef} data-description-block={testId} className={regionClassName}>
        {image}
      </Box>
      {(canScrollLeft || canScrollRight) && (
        <Flex className="absolute bottom-3 left-3 z-10 gap-2 md:hidden">
          {canScrollLeft && (
            <Button
              ref={previousButtonRef}
              type="button"
              aria-label={t('previousImage')}
              onClick={() => scrollByStep(-1)}
              className="!h-10 !w-10 !min-w-0 !rounded-full !bg-black !p-0 !text-white shadow-md hover:!bg-gray-800"
            >
              <ArrowLeftIcon width="20" height="20" />
            </Button>
          )}
          {canScrollRight && (
            <Button
              ref={nextButtonRef}
              type="button"
              aria-label={t('nextImage')}
              onClick={() => scrollByStep(1)}
              className="!h-10 !w-10 !min-w-0 !rounded-full !bg-black !p-0 !text-white shadow-md hover:!bg-gray-800"
            >
              <ArrowRightIcon width="20" height="20" />
            </Button>
          )}
        </Flex>
      )}
    </Box>
  );
}
