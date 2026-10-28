'use client';

import { useEffect } from 'react';
import { Flex, Text, Badge } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchReviewStatsRequest } from '@/lib/store/slices/reviewSlice';
import { StarRating } from './StarRating';

interface ReviewSummaryProps {
  productId: string;
}

export function ReviewSummary({ productId }: ReviewSummaryProps) {
  const t = useTranslations('reviews');
  const dispatch = useAppDispatch();

  const { reviewStats, reviewStatsLoading } = useAppSelector(
    (state) => state.review
  );

  useEffect(() => {
    dispatch(fetchReviewStatsRequest(productId));
  }, [dispatch, productId]);

  if (reviewStatsLoading || !reviewStats) {
    return null;
  }

  if (reviewStats.reviewCount === 0) {
    return null;
  }

  return (
    <Flex align="center" gap="4" className="mb-6">
      {/* Large rating number */}
      <Text className="text-[56px] font-bold text-black leading-none">
        {reviewStats.averageRating.toFixed(1)}
      </Text>

      {/* Stars and review count */}
      <Flex direction="row" gap="2">
        <StarRating
          value={Math.round(reviewStats.averageRating) as 1 | 2 | 3 | 4 | 5}
          readOnly
          size="small"
        />
        <Badge
          size="2"
          className="bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white font-medium"
        >
          {t('reviewCount', { count: reviewStats.reviewCount })}
        </Badge>
      </Flex>
    </Flex>
  );
}
