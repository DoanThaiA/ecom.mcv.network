'use client';

import { useRef } from "react";
import { Box, Text } from "@radix-ui/themes";
import { useTranslations } from 'next-intl';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { ReviewList } from '@/components/review/ReviewList';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const t = useTranslations('reviews');
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      className="xl:w-[65%] xl:mx-auto lg:w-[80%] lg:mx-auto lg:px-0 bg-[#EAEAEA]"
      ref={containerRef}
    >
      {/* Container with max width for desktop */}
      <Box className="my-8  p-6 mx-auto">
        {/* Title */}
        <Text className="text-[20px] font-bold text-black mb-6 block">
          {t("title")}
        </Text>

        {/* Rating summary */}
        <ReviewSummary productId={productId} />

        {/* Reviews list with filters and pagination */}
        <ReviewList productId={productId} containerRef={containerRef} />
      </Box>
    </Box>
  );
}
