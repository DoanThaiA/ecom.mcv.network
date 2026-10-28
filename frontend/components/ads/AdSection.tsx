'use client';

import { Breakpoint, useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { extractSamePageHash, scrollToHash } from '@/lib/utils/dom';
import { BannerMediaType } from '@/types/gen/shared/shared/common/enums';
import { Box, Flex } from '@radix-ui/themes';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ResponsiveMedia {
  mobile: string;
  tablet: string;
  desktop: string;
}

interface AdItem {
  imageUrl?: string;
  responsiveImages?: ResponsiveMedia;
  responsiveMedia?: ResponsiveMedia;
  mediaType?: BannerMediaType;
  href?: string;
  alt?: string;
  posterUrl?: string;
  responsivePoster?: ResponsiveMedia;
}

interface AdSectionProps extends AdItem {
  ads?: AdItem[];
  autoplayDelay?: number;
}

export function AdSection({
  imageUrl,
  responsiveImages,
  responsiveMedia,
  mediaType,
  href,
  alt = 'Advertisement',
  posterUrl,
  responsivePoster,
  ads,
  autoplayDelay = 4000,
}: AdSectionProps) {
  const breakpoint = useBreakpoint();

  // Normalize to ads array (backward compatible)
  const normalizedAds = useMemo<AdItem[]>(() => {
    if (ads && ads.length > 0) {
      return ads;
    }
    // Convert single props to array with one item
    return [
      {
        imageUrl,
        responsiveImages,
        responsiveMedia,
        mediaType,
        href,
        alt,
        posterUrl,
        responsivePoster,
      },
    ];
  }, [
    ads,
    imageUrl,
    responsiveImages,
    responsiveMedia,
    mediaType,
    href,
    alt,
    posterUrl,
    responsivePoster,
  ]);

  // Filter ads that have media for current breakpoint
  const visibleAds = useMemo(() => {
    return normalizedAds.filter((ad) => {
      const media = ad.responsiveMedia ?? ad.responsiveImages;
      if (!media) return !!ad.imageUrl;

      const mediaSrc = media[breakpoint];
      return !!mediaSrc;
    });
  }, [normalizedAds, breakpoint]);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: autoplayDelay, stopOnInteraction: false }),
    [autoplayDelay],
  );

  // Only use carousel when multiple visible ads
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false },
    visibleAds.length > 1 ? [autoplayPlugin] : [],
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const pointerDownScrollRef = useRef(0);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const prevBreakpointRef = useRef<Breakpoint | null>(null);

  // Track pointer down for drag detection
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

  // Track current slide
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

  // Navigate to specific slide (for dots navigation)
  const goToSlide = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  // Control autoplay and video playback based on current slide
  useEffect(() => {
    if (!emblaApi || visibleAds.length === 0 || !slidesContainerRef.current)
      return;

    const currentAdData = visibleAds[currentSlide];
    const isCurrentSlideVideo =
      currentAdData?.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

    // Control carousel autoplay
    if (isCurrentSlideVideo) {
      autoplayPlugin.stop();
    } else {
      autoplayPlugin.play();
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
        if (slideIndex === currentSlide) {
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
  }, [emblaApi, currentSlide, visibleAds, autoplayPlugin, breakpoint]);

  // Handle click with drag detection
  const handleAdClick = useCallback(
    (adHref: string | undefined) => {
      if (!adHref) return;

      // For carousel, check if user was dragging
      if (emblaApi) {
        const scrollDiff = Math.abs(
          emblaApi.scrollProgress() - pointerDownScrollRef.current,
        );
        if (scrollDiff > 0.01) return;
      }

      const hash = extractSamePageHash(adHref);
      if (hash) {
        scrollToHash(hash);
      } else {
        window.location.href = adHref;
      }
    },
    [emblaApi],
  );

  // Render single ad content
  const renderAdContent = (ad: AdItem, index: number) => {
    const media = ad.responsiveMedia ?? ad.responsiveImages;
    const isVideo = ad.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

    return (
      <Box className="w-full">
        {media ? (
          (() => {
            const mediaSrc = media[breakpoint];

            if (!mediaSrc) {
              return null;
            }

            if (isVideo) {
              const posterSrc =
                ad.responsivePoster?.[breakpoint] ||
                ad.posterUrl ||
                '/assets/images/video-poster.webp';

              return (
                <video
                  src={mediaSrc}
                  autoPlay={visibleAds.length === 1}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? 'metadata' : 'none'}
                  poster={posterSrc}
                  className="w-full h-auto"
                />
              );
            }

            return (
              <Box className="relative">
                <Image
                  src={mediaSrc}
                  alt={ad.alt || 'Advertisement'}
                  width={0}
                  height={0}
                  sizes="80vw"
                  priority
                  className="w-full h-auto"
                />
              </Box>
            );
          })()
        ) : ad.imageUrl ? (
          <Box className="relative">
            <Image
              src={ad.imageUrl}
              alt={ad.alt || 'Advertisement'}
              width={0}
              height={0}
              sizes="80vw"
              priority
              className="w-full h-auto"
            />
          </Box>
        ) : null}
      </Box>
    );
  };

  // No visible ads
  if (visibleAds.length === 0) {
    return null;
  }

  // Single ad - render without carousel
  if (visibleAds.length === 1) {
    const singleAd = visibleAds[0];
    const content = renderAdContent(singleAd, 0);

    if (singleAd.href) {
      return (
        <Box
          className={`block no-underline ${singleAd.href ? 'cursor-pointer' : ''}`}
          onClick={() => handleAdClick(singleAd.href)}
        >
          {content}
        </Box>
      );
    }

    return content;
  }

  // Multiple ads - render carousel
  return (
    <Box className="relative w-full overflow-hidden" ref={emblaRef}>
      <div className="flex" ref={slidesContainerRef}>
        {visibleAds.map((ad, index) => {
          const content = renderAdContent(ad, index);

          return (
            <Box
              key={index}
              data-slide-index={index}
              className={`flex-[0_0_100%] min-w-0 ${ad.href ? 'cursor-pointer' : ''}`}
              onClick={() => handleAdClick(ad.href)}
            >
              {content}
            </Box>
          );
        })}
      </div>
      {/* Dots navigation */}
      <Flex gap="2" justify="center" className="mt-3">
        {visibleAds.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${
              currentSlide === index ? 'bg-black' : 'bg-black/30'
            }`}
          />
        ))}
      </Flex>
    </Box>
  );
}
