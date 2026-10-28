'use client';

import { useEffect } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ReloadIcon, ArchiveIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchUserReviewsRequest } from '@/lib/store/slices/reviewSlice';
import { ReviewCard } from '@/components/review/ReviewCard';

export function MyReviewsSection() {
  const t = useTranslations('myReviews');
  const dispatch = useAppDispatch();

  const { userReviews, userReviewsLoading, userReviewsError } =
    useAppSelector((state) => state.review);

  useEffect(() => {
    dispatch(fetchUserReviewsRequest());
  }, [dispatch]);

  // Loading state
  if (userReviewsLoading) {
    return (
      <Flex justify="center" align="center" className="py-12">
        <ReloadIcon className="animate-spin" width={32} height={32} />
      </Flex>
    );
  }

  // Error state
  if (userReviewsError) {
    return (
      <Box className="py-8">
        <Text size="3" color="red" align="center">
          {userReviewsError}
        </Text>
      </Box>
    );
  }

  // Empty state
  if (userReviews.length === 0) {
    return (
      <Flex direction="column" align="center" gap="4" className="py-16">
        <ArchiveIcon width={64} height={64} color="gray" />
        <Text size="4" color="gray" align="center">
          {t('noReviews')}
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Flex direction="column" gap="4">
        {userReviews.map((review) => (
          <ReviewCard key={review.id} review={review} showProductInfo={true} />
        ))}
      </Flex>
    </Box>
  );
}
