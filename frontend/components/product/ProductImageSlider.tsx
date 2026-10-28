'use client';

import { ProductImage } from '@/components/common/ProductImage';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants';
import { scrollElementHorizontallyIntoView } from '@/lib/utils/dom';
import { ProductBadge } from '@/types/gen/shared/shared/common/enums';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { Box, Dialog, Flex, IconButton } from '@radix-ui/themes';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductBadge as ProductBadgeComponent } from './ProductBadge';

interface ProductImageSliderProps {
  images: string[];
  productName: string;
  hasFlashSale?: boolean;
  productBanner?: {
    id: string;
    name: string;
    image: string;
    position: number;
    ratio?: number | null;
  };
  badge?: ProductBadge;
  /**
   * Slide the parent wants shown. Changing it scrolls the carousel, which is
   * how tapping a colour swatch jumps to that colour's first image.
   */
  targetIndex?: number;
  /** Fires whenever the visible slide changes, by swipe or programmatically. */
  onIndexChange?: (_index: number) => void;
  /**
   * Slice of the gallery the thumbnails and dots should represent - normally
   * the current colour's images. The main carousel still spans every image, so
   * the customer keeps swiping across colours; this only stops the navigation
   * strips from listing all of them at once. Omit to show the whole gallery.
   */
  visibleRange?: { start: number; count: number };
}

export function ProductImageSlider({
  images,
  productName,
  productBanner,
  badge,
  targetIndex,
  onIndexChange,
  visibleRange,
}: ProductImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [thumbnailErrors, setThumbnailErrors] = useState<Set<number>>(
    new Set(),
  );
  const t = useTranslations('common');

  // The thumbnails and dots cover only this slice; the main carousel and the
  // zoom dialog always span the full gallery.
  const stripStart = Math.min(
    Math.max(visibleRange?.start ?? 0, 0),
    Math.max(images.length - 1, 0),
  );
  const stripCount = Math.min(
    visibleRange?.count ?? images.length,
    images.length - stripStart,
  );
  const stripImages = useMemo(
    () => images.slice(stripStart, stripStart + stripCount),
    [images, stripStart, stripCount],
  );

  // Embla Carousel - Main image
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    align: 'start',
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // The thumbnail rails and dots are plain scroll containers, not carousels.
  // They only ever list one colour's images, so they usually fit without
  // scrolling at all - and a carousel here re-initialised every time a colour
  // change altered the slide count, which flickered.
  const desktopThumbsRef = useRef<HTMLDivElement>(null);
  const mobileThumbsRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Embla Carousel - Zoom Dialog
  const [emblaZoomRef, emblaZoomApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    align: 'start',
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setCurrentIndex(index);
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());

    // The zoom dialog mirrors the full gallery, so it shares this index as-is.
    // Thumbnails and dots track a slice and are synced in their own effect.
    if (emblaZoomApi && zoomDialogOpen) emblaZoomApi.scrollTo(index);

    onIndexChange?.(index);
  }, [emblaApi, emblaZoomApi, zoomDialogOpen, onIndexChange]);

  // Zoom dialog carousel select handler
  const onZoomSelect = useCallback(() => {
    if (!emblaZoomApi) return;
    const index = emblaZoomApi.selectedScrollSnap();
    setCurrentIndex(index);

    // Scrolling the main carousel makes its own onSelect report the change
    // upward, which in turn moves the thumbnails and dots.
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaZoomApi, emblaApi]);

  // Keep the current thumbnail and dot visible without scrolling the document.
  useEffect(() => {
    if (currentIndex < stripStart || currentIndex >= stripStart + stripCount) {
      return;
    }

    [desktopThumbsRef, mobileThumbsRef, dotsRef].forEach((containerRef) => {
      const container = containerRef.current;
      const active = container?.querySelector<HTMLElement>(
        `[data-index="${currentIndex}"]`,
      );
      if (!container || !active) return;

      scrollElementHorizontallyIntoView(container, active);
    });
  }, [currentIndex, stripStart, stripCount]);

  const onThumbnailClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
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

  // Zoom dialog carousel event listeners
  useEffect(() => {
    if (!emblaZoomApi) return;
    onZoomSelect();
    emblaZoomApi.on('select', onZoomSelect);
    emblaZoomApi.on('reInit', onZoomSelect);
    return () => {
      emblaZoomApi.off('select', onZoomSelect);
      emblaZoomApi.off('reInit', onZoomSelect);
    };
  }, [emblaZoomApi, onZoomSelect]);

  // Scroll zoom dialog to current index when dialog opens
  useEffect(() => {
    if (zoomDialogOpen && emblaZoomApi) {
      emblaZoomApi.scrollTo(currentIndex);
    }
  }, [zoomDialogOpen, emblaZoomApi, currentIndex]);

  // Follow the parent's requested slide (e.g. a colour swatch was tapped).
  // Skipping the scroll when we are already there keeps this from fighting the
  // onIndexChange callback that reports the user's own swipes back up.
  useEffect(() => {
    if (!emblaApi || targetIndex === undefined) return;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    if (emblaApi.selectedScrollSnap() === targetIndex) return;

    // Jump rather than animate: a colour swatch can be a dozen slides away, and
    // animating there flings every image in between across the screen. Swipes
    // and thumbnail taps still animate - they only ever move a slide or two.
    emblaApi.scrollTo(targetIndex, true);
  }, [emblaApi, targetIndex, images.length]);

  // Reset error states when images change
  useEffect(() => {
    setImageErrors(new Set());
    setThumbnailErrors(new Set());
  }, [images]);

  // Render thumbnail images - shared between mobile and desktop
  const renderThumbnails = () =>
    stripImages.map((image, offset) => {
      const index = stripStart + offset;
      const isSelected = currentIndex === index;
      return (
        // Keyed by position, not by absolute index, so switching colour swaps
        // the image sources instead of tearing the rail down and rebuilding it
        // - that teardown is what flashed.
        <Box
          key={offset}
          data-index={index}
          className="flex-shrink-0 cursor-pointer overflow-hidden transition-all relative bg-white"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '4px',
            border: isSelected ? '0.5px solid #AFAFAF' : 'none',
            opacity: isSelected ? 1 : 1,
          }}
          onClick={() => onThumbnailClick(index)}
        >
          <ProductImage
            src={image || DEFAULT_PRODUCT_IMAGE}
            alt={`${productName} thumbnail ${index + 1}`}
            width={48}
            height={48}
            loading="lazy"
            sizes="48px"
            className={
              thumbnailErrors.has(index) ? 'object-contain p-2' : 'object-cover'
            }
            onError={() => {
              setThumbnailErrors((prev) => new Set(prev).add(index));
            }}
          />
          {!isSelected && (
            <Box
              className="absolute inset-0 bg-black transition-opacity"
              style={{ opacity: 0.4 }}
            />
          )}
        </Box>
      );
    });

  if (images.length === 0) {
    return (
      <Box className="flex flex-col items-center">
        {/* Main Avatar */}
        <Box
          className="bg-gray-100 overflow-hidden flex items-center justify-center"
          style={{
            width: '338px',
            height: '450px',
            borderRadius: '16px',
          }}
        >
          <img
            src={DEFAULT_PRODUCT_IMAGE}
            alt={productName}
            className="w-full h-full object-contain p-8"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col items-center">
      {/* Image + Banner Wrapper */}
      <Box className="relative" style={{ width: '338px' }}>
        {/* Main Image Container with Thumbnails INSIDE */}
        <Box
          className="relative bg-gray-100"
          style={{
            width: '338px',
            height: '450px',
            borderRadius: '16px',
          }}
        >
          {/* Embla Viewport */}
          <div className="overflow-hidden h-full rounded-2xl" ref={emblaRef}>
            <div className="flex h-full ">
              {images.map((image, index) => {
                const hasError = imageErrors.has(index);
                return (
                  <Box
                    key={index}
                    className="flex-[0_0_100%] min-w-0 h-full relative cursor-pointer"
                    onClick={() => setZoomDialogOpen(true)}
                  >
                    <ProductImage
                      src={image || DEFAULT_PRODUCT_IMAGE}
                      alt={`${productName} ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={
                        hasError ? 'object-contain p-8' : 'object-cover'
                      }
                      onError={() => {
                        setImageErrors((prev) => new Set(prev).add(index));
                      }}
                    />
                  </Box>
                );
              })}
            </div>
          </div>

          {/* Product Banner - Position 1 (Top) */}
          {productBanner && productBanner.position === 1 && (
            <Box className="absolute top-0 left-0 right-0 z-[5]">
              <ProductImage
                src={productBanner.image}
                alt={productBanner.name}
                width={400}
                height={50}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-4 object-cover rounded-t-2xl"
                style={{ width: '100%', height: '32px', pointerEvents: 'none' }}
              />
            </Box>
          )}

          {/* Product Badge - Top Left (below flash sale if present) */}
          {badge && (
            <ProductBadgeComponent
              badge={badge}
              source={'detail'}
              className="absolute top-2 right-2 z-[8]"
            />
          )}

          {/* Arrow Navigation - Desktop only */}
          {canScrollLeft && (
            <Box className="hidden sm:flex absolute left-2 top-[50%] -translate-y-1/2 z-20">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollPrev();
                }}
                className="cursor-pointer"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
              >
                <ChevronLeftIcon width="24" height="24" color="white" />
              </IconButton>
            </Box>
          )}

          {canScrollRight && (
            <Box className="hidden sm:flex absolute right-2 top-[50%] -translate-y-1/2 z-20">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollNext();
                }}
                className="cursor-pointer"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
              >
                <ChevronRightIcon width="24" height="24" color="white" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Product Banner - Position 2 (Bottom) */}
        {productBanner && productBanner.position === 2 && (
          <Box className="absolute bottom-0 left-0 right-0 z-[5]">
            <ProductImage
              src={productBanner.image}
              alt={productBanner.name}
              width={400}
              height={50}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-4 object-cover rounded-b-2xl"
              style={{ width: '100%', height: '32px' }}
            />
          </Box>
        )}
      </Box>

      {/* Thumbnails Below Main Image - Mobile/Tablet only */}
      <Box className="lg:hidden mt-4" style={{ maxWidth: '338px' }}>
        <Box
          ref={mobileThumbsRef}
          className="overflow-x-auto overflow-y-hidden px-2 py-0.5"
        >
          <Flex gap="2" style={{ flexWrap: 'nowrap' }}>
            {renderThumbnails()}
          </Flex>
        </Box>
      </Box>

      {/* Thumbnails Below Main Image - Desktop only */}
      <Box className="hidden lg:block mt-4" style={{ maxWidth: '338px' }}>
        <Box
          ref={desktopThumbsRef}
          className="overflow-x-auto overflow-y-hidden py-0.5"
        >
          <Flex gap="2" style={{ flexWrap: 'nowrap' }}>
            {renderThumbnails()}
          </Flex>
        </Box>
      </Box>

      {/* Dots Below Main Image Container */}
      <Box
        className="mt-3"
        style={{ maxWidth: '200px', margin: '12px auto 0' }}
      >
        <Box ref={dotsRef} className="overflow-x-auto overflow-y-hidden py-1">
          {/* Centring lives on the inner row, not the scroll container: a
              centred flex container hides its leading items once it overflows */}
          <Flex gap="2" className="w-max mx-auto" style={{ flexWrap: 'nowrap' }}>
            {stripImages.map((_, offset) => {
              const index = stripStart + offset;
              const isActive = currentIndex === index;
              return (
                <button
                  key={offset}
                  data-index={index}
                  onClick={() => onThumbnailClick(index)}
                  className="transition-all rounded-full flex-shrink-0"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#000000',
                    opacity: isActive ? 1 : 0.3,
                    borderRadius: '50px',
                  }}
                />
              );
            })}
          </Flex>
        </Box>
      </Box>

      {/* Zoom Image Dialog */}
      <Dialog.Root open={zoomDialogOpen} onOpenChange={setZoomDialogOpen}>
        <Dialog.Content
          className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95"
          style={{ width: 'auto', height: 'auto' }}
        >
          <Dialog.Title className="sr-only">
            {productName} - {t('buttons.viewAll')}
          </Dialog.Title>

          {/* Close Button */}
          <Box className="absolute top-4 right-4 z-10">
            <Dialog.Close>
              <Box
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                }}
              >
                <Cross2Icon className="w-6 h-6 text-white" />
              </Box>
            </Dialog.Close>
          </Box>

          {/* Zoomed Image Carousel */}
          <Box
            className="relative"
            style={{ minHeight: '400px', maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <div className="overflow-hidden h-full" ref={emblaZoomRef}>
              <div className="flex h-full">
                {images.map((image, index) => (
                  <Box
                    key={index}
                    className="flex-[0_0_100%] min-w-0 flex items-center justify-center"
                    style={{ minHeight: '400px' }}
                  >
                    <ProductImage
                      src={image || DEFAULT_PRODUCT_IMAGE}
                      alt={`${productName} ${index + 1} - Zoomed`}
                      width={1200}
                      height={1200}
                      loading="lazy"
                      className="object-contain"
                      style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                    />
                  </Box>
                ))}
              </div>
            </div>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
