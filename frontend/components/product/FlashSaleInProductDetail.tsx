"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Box, Flex, Text } from "@radix-ui/themes";
import { ProductSlider } from "./ProductSlider";
import { formatCountdown } from "@/lib/utils/format";
import { useScrollToHash } from "@/lib/hooks/useScrollToHash";
import { useIsDesktop } from "@/lib/hooks/useBreakpoint";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import type { Product } from "@/types/gen/shared/shared/products/product";

interface FlashSaleInProductDetailProps {
  title: string;
  seeAllText: string;
  endsInText?: string;
  endTime: Date | string;
  seeAllLink?: string;
  locale?: string;
  showTimer?: boolean;
}

export function FlashSaleInProductDetail({
  seeAllText: _seeAllText,
  endsInText = "Kết thúc sau",
  endTime,
  seeAllLink: _seeAllLink = "#",
  locale = "vi",
  showTimer = true,
}: FlashSaleInProductDetailProps) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const isDesktop = useIsDesktop();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Intersection Observer for lazy loading video - trigger when section is 200px from viewport
  const { ref: sectionRef, isIntersecting } =
    useIntersectionObserver<HTMLDivElement>({
      rootMargin: "200px",
    });

  // Play/pause video based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isIntersecting) {
      video.play().catch(() => {
        // Ignore autoplay errors (browser restrictions)
      });
    } else {
      video.pause();
    }
  }, [isIntersecting]);

  // Scroll to flashsale section if URL has #flashsale
  // Dùng elementId khác với hash để tránh browser auto-scroll
  useScrollToHash("flashsale", "flashsale-section");

  useEffect(() => {
    if (!showTimer) return;

    // Convert endTime to Date if it's a string
    const endTimeDate =
      typeof endTime === "string" ? new Date(endTime) : endTime;

    // Check if we have a valid timestamp (more reliable than instanceof)
    const timestamp = endTimeDate?.getTime?.();
    if (!timestamp || isNaN(timestamp)) {
      return;
    }

    // Tính toán ngay lập tức để tránh hiển thị 00:00:00 trong 1 giây đầu
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = timestamp - now;
      return distance < 0 ? 0 : Math.floor(distance / 1000);
    };

    // Set giá trị ban đầu ngay lập tức
    setTotalSeconds(calculateTimeLeft());

    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      if (timeLeft <= 0) {
        clearInterval(timer);
        setTotalSeconds(0);
      } else {
        setTotalSeconds(timeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, showTimer]);
  const timeLeft = formatCountdown(totalSeconds);

  return (
    <Box ref={sectionRef} className="relative px-8 lg:px-12 h-[100px]">
      {/* Background Video Layer - Use poster for instant LCP, lazy load video */}
      <Box className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          preload="none"
          poster={
            "/assets/images/flash-sale-background-product-detail.webp"
          }
        >
          <source
            src={"/assets/video/flash-sale-background-product-detail.mp4"}
            type="video/mp4"
          />
        </video>
      </Box>

      {/* Foreground Content - Title, Countdown, Products */}
      <Flex
        direction="column"
        justify="center"
        className="relative z-20 h-full"
      >
        {/* Title + Countdown */}
        <Flex justify="between" align="center" className="gap-4">
          <Image
            src="/assets/svg/flash-sale.svg"
            alt="Flash Sale Content Overlay"
            width={300}
            height={30}
            className="h-[30px] w-auto object-contain"
            priority
          />
          {showTimer && (
            <Flex align="center" gap="2" className="flex-shrink-0">
              <Text className="text-xs lg:text-sm text-white">
                {endsInText}:
              </Text>
              <Flex align="center" className="gap-[2px] flex-shrink-0">
                <Box className="bg-gradient-to-r bg-[#fff] text-black w-6 h-6 lg:w-8 lg:h-8 rounded flex items-center justify-center font-medium text-sm lg:text-base">
                  {timeLeft.hours}
                </Box>
                <Text className="text-white font-medium text-sm lg:text-base">
                  :
                </Text>
                <Box className="bg-gradient-to-r bg-[#fff] text-black w-6 h-6 lg:w-8 lg:h-8 rounded flex items-center justify-center font-medium text-sm lg:text-base">
                  {timeLeft.minutes}
                </Box>
                <Text className="text-white font-medium text-sm lg:text-base">
                  :
                </Text>
                <Box className="bg-gradient-to-r bg-[#fff] text-black w-6 h-6 lg:w-8 lg:h-8 rounded flex items-center justify-center font-medium text-sm lg:text-base">
                  {timeLeft.seconds}
                </Box>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
