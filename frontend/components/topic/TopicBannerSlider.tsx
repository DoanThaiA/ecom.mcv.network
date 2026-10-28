"use client";

import { useBreakpoint } from "@/lib/hooks/useBreakpoint";
import { BannerMediaType } from "@/types/gen/shared/shared/common/enums";
import { Box } from "@radix-ui/themes";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface TopicBannerMedia {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

interface TopicBannerSlide {
  id: string;
  mediaType: BannerMediaType;
  media: TopicBannerMedia;
  link?: string | null;
  order: number;
}

interface TopicBannerSliderProps {
  banners: TopicBannerSlide[];
}

export function TopicBannerSlider({ banners }: TopicBannerSliderProps) {
  const breakpoint = useBreakpoint();

  const visibleBanners = useMemo(() => {
    return [...banners]
      .sort((a, b) => a.order - b.order)
      .filter((b) => {
        const mediaSrc = b.media[breakpoint];
        return !!mediaSrc;
      });
  }, [banners, breakpoint]);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 4000, stopOnInteraction: false }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: visibleBanners.length > 1, dragFree: false },
    visibleBanners.length > 1 ? [autoplayPlugin] : [],
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, visibleBanners]);

  if (visibleBanners.length === 0) return null;

  return (
    <Box className="relative w-full overflow-hidden">
      <Box ref={emblaRef} className="overflow-hidden">
        <Box className="flex">
          {visibleBanners.map((banner) => {
            const mediaSrc = banner.media[breakpoint] || "";
            const isVideo =
              banner.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

            const content = isVideo ? (
              <video
                src={mediaSrc}
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
              />
            ) : (
              <img src={mediaSrc} alt="" className="w-full" />
            );

            return (
              <Box key={banner.id} className="min-w-0 flex-[0_0_100%]">
                {banner.link ? (
                  <Link href={banner.link} className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Dots */}
      {visibleBanners.length > 1 && (
        <Box className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {visibleBanners.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentSlide ? "bg-white w-4" : "bg-white/50"
              }`}
              onClick={() => emblaApi?.scrollTo(idx)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
