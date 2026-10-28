'use client';

import { Breakpoint, useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { extractSamePageHash, scrollToHash } from '@/lib/utils/dom';
import { BannerMediaType } from '@/types/gen/shared/shared/common/enums';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ResponsiveMedia {
  mobile: string;
  tablet: string;
  desktop: string;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  imageUrl?: string;
  responsiveImages?: ResponsiveMedia;
  responsiveMedia?: ResponsiveMedia;
  mediaType?: BannerMediaType;
  backgroundColor?: string;
  buttonText?: string;
  buttonLink?: string;
  posterUrl?: string;
  responsivePoster?: ResponsiveMedia;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const breakpoint = useBreakpoint();

  // Filter slides that have media for current breakpoint
  const visibleSlides = useMemo(() => {
    return slides.filter((slide) => {
      const media = slide.responsiveMedia ?? slide.responsiveImages;
      if (!media) return !!slide.imageUrl;

      const mediaSrc = media[breakpoint];
      // For video slides without source for this breakpoint, exclude
      if (slide.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO) {
        return !!mediaSrc;
      }
      // For image slides, include if has media source
      return !!mediaSrc;
    });
  }, [slides, breakpoint]);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 4000, stopOnInteraction: false }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: false,
    },
    [autoplayPlugin],
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const pointerDownScrollRef = useRef(0);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const prevBreakpointRef = useRef<Breakpoint | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => {
      pointerDownScrollRef.current = emblaApi.scrollProgress();
    };
    emblaApi.on('pointerDown', onPointerDown);
    return () => {
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reinitialize emblaApi when visibleSlides changes to sync plugin internal state
  useEffect(() => {
    if (!emblaApi) return;
    // reInit will recalculate scrollSnapList and reinitialize plugins
    emblaApi.reInit();
  }, [emblaApi, visibleSlides]);

  // Control autoplay and video playback based on current slide
  useEffect(() => {
    if (!emblaApi || visibleSlides.length === 0 || !slidesContainerRef.current)
      return;

    // Guard against currentSlide being out of bounds after visibleSlides changes
    // This can happen when breakpoint changes and visibleSlides shrinks
    const safeSlideIndex = Math.min(currentSlide, visibleSlides.length - 1);
    if (safeSlideIndex < 0) return;

    const currentSlideData = visibleSlides[safeSlideIndex];
    const isCurrentSlideVideo =
      currentSlideData?.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

    // Control carousel autoplay - check emblaApi state is in sync with visibleSlides
    // to prevent autoplay plugin from accessing out-of-bounds delay array
    const snapCount = emblaApi.scrollSnapList().length;

    if (isCurrentSlideVideo) {
      autoplayPlugin?.stop?.();
    } else if (snapCount === visibleSlides.length && snapCount > 0) {
      // Only play if emblaApi has reinitialized to match current visibleSlides
      autoplayPlugin?.play?.();
    }

    // Detect if breakpoint changed (video src changed, need to reload)
    const breakpointChanged =
      prevBreakpointRef.current !== null &&
      prevBreakpointRef.current !== breakpoint;
    prevBreakpointRef.current = breakpoint;

    // Control video playback - pause non-active videos, play current slide's videos
    const slideElements =
      slidesContainerRef.current.querySelectorAll('[data-slide-index]');

    slideElements.forEach((slideEl) => {
      const slideIndex = parseInt(
        slideEl.getAttribute('data-slide-index') || '-1',
        10,
      );
      const videos = slideEl.querySelectorAll('video');

      videos.forEach((video) => {
        if (slideIndex === safeSlideIndex) {
          // Reload video if breakpoint changed (src changed)
          if (breakpointChanged) {
            video.load();
          }
          // Play videos on current slide
          video.play().catch(() => {
            // Ignore autoplay errors (browser restrictions)
          });
        } else {
          // Pause videos on other slides (keep current position)
          video.pause();
        }
      });
    });
  }, [emblaApi, currentSlide, visibleSlides, autoplayPlugin, breakpoint]);

  const goToSlide = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const handleSlideClick = useCallback(
    (link: string) => {
      if (!emblaApi) return;
      const scrollDiff = Math.abs(
        emblaApi.scrollProgress() - pointerDownScrollRef.current,
      );
      if (scrollDiff > 0.01) return;

      const hash = extractSamePageHash(link);
      if (hash) {
        scrollToHash(hash);
      } else {
        window.location.href = link;
      }
    },
    [emblaApi],
  );

  return (
    <Box className="relative w-full">
      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex" ref={slidesContainerRef}>
          {visibleSlides.map((slide, index) => {
            const media = slide.responsiveMedia ?? slide.responsiveImages;
            const isVideo =
              slide.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

            const slideContent = (
              <Box
                className={`relative ${slide.buttonLink ? 'cursor-pointer' : ''}`}
                style={{
                  backgroundColor: slide.backgroundColor || '#D4C4B0',
                }}
              >
                {/* Responsive Media - Only render the variant for current breakpoint */}
                {media ? (
                  (() => {
                    // breakpoint is always valid (SSR-safe hook returns 'mobile' by default)
                    const mediaSrc = media[breakpoint];
                    const aspectRatio =
                      breakpoint === 'desktop'
                        ? 'aspect-[1920/788]'
                        : breakpoint === 'tablet'
                          ? 'aspect-[1274/523]'
                          : 'aspect-[672/982]';

                    if (isVideo) {
                      // Use responsive poster or fallback to brand color poster
                      const posterSrc =
                        slide.responsivePoster?.[breakpoint] ||
                        slide.posterUrl ||
                        '/assets/images/video-poster.webp';

                      return (
                        <Box
                          className={`relative w-full ${aspectRatio}`}
                          style={{
                            backgroundColor: slide.backgroundColor || '#D4C4B0',
                          }}
                        >
                          <video
                            src={mediaSrc}
                            muted
                            loop
                            playsInline
                            preload={index === 0 ? 'metadata' : 'none'}
                            poster={posterSrc}
                            className="w-full h-full object-cover"
                          />
                        </Box>
                      );
                    }

                    return (
                      <Box className={`relative w-full ${aspectRatio}`}>
                        <Image
                          src={mediaSrc}
                          alt={slide.title || 'Hero banner'}
                          fill
                          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 60vw, 65vw"
                          priority
                          className="object-cover"
                      />
                      </Box>
                    );
                  })()
                ) : slide.imageUrl ? (
                  <Box className="relative aspect-[672/982] md:aspect-[1274/523] lg:aspect-[1920/788]">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title || 'Hero banner'}
                      fill
                      sizes="(max-width: 640px) 30vw, (max-width: 1024px) 60vw, 65vw"
                      priority
                      className="object-cover"
                    />
                  </Box>
                ) : null}

                {/* Overlay Content */}
                {(slide.title || slide.subtitle) && (
                  <Box className="absolute inset-0 flex items-center justify-center">
                    <Box className="text-center px-5">
                      {slide.title && (
                        <Heading
                          size="9"
                          className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl"
                          style={{
                            color: 'white',
                            marginBottom: '16px',
                            fontWeight: 300,
                            letterSpacing: '0.1em',
                          }}
                        >
                          {slide.title}
                        </Heading>
                      )}
                      {slide.subtitle && (
                        <Text
                          className="text-sm sm:text-base md:text-lg"
                          style={{
                            color: 'white',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {slide.subtitle}
                        </Text>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            );

            if (slide.buttonLink) {
              return (
                <Box
                  key={index}
                  data-slide-index={index}
                  className="flex-[0_0_100%] min-w-0"
                  onClick={() => handleSlideClick(slide.buttonLink!)}
                >
                  {slideContent}
                </Box>
              );
            }

            return (
              <Box
                key={index}
                data-slide-index={index}
                className="flex-[0_0_100%] min-w-0"
              >
                {slideContent}
              </Box>
            );
          })}
        </div>
      </div>

      {/* Dots Navigation - Only show when more than 1 slide */}
      {visibleSlides.length > 1 ? (
        <Flex gap="2" justify="center" className="my-8">
          {visibleSlides.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                cursor-pointer transition-all duration-300
                w-2 h-2 rounded-full
                ${index === currentSlide ? 'bg-black' : 'bg-black/30'}
              `}
            />
          ))}
        </Flex>
      ) : (
        <Box className="my-8"> </Box>
      )}
    </Box>
  );
}
