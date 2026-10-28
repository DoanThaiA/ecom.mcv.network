'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchOrderReviewRequest } from '@/lib/store/slices/reviewSlice';
import { ArrowLeftIcon, PlayIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLocale } from '@/lib/locale';

interface OrderReviewSectionProps {
  orderNumber: string;
  locale: AppLocale;
}

export function OrderReviewSection({
  orderNumber,
  locale,
}: OrderReviewSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tOrderHistory = useTranslations('orderHistory');
  const tReviews = useTranslations('reviews');

  const orderReview = useAppSelector((state) => state.review.orderReview);
  const orderReviewLoading = useAppSelector((state) => state.review.orderReviewLoading);

  useEffect(() => {
    if (orderNumber) {
      dispatch(fetchOrderReviewRequest(orderNumber));
    }
  }, [dispatch, orderNumber]);

  const handleBack = () => {
    router.back();
  };

  return (
    <Box className="flex-1 bg-white rounded-2xl border border-[#F0F0F0]">
      {/* Header */}
      <Box className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F0F0F0]">
        <Flex align="center" gap="2">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-black" />
          </button>
          <Heading className="text-base sm:text-lg font-bold text-black">
            {tOrderHistory('yourReview')}
          </Heading>
        </Flex>
      </Box>

      {/* Content */}
      <Box className="px-4 sm:px-6 py-6">
        {orderReviewLoading ? (
          <Flex justify="center" align="center" className="py-8">
            <Box className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#FAA63E]" />
          </Flex>
        ) : orderReview && orderReview.length > 0 ? (
          <Box className="space-y-6">
            {orderReview.map((review, index) => (
              <Box key={`${review.id}-${review.productId || index}`} className="border-b border-gray-200 pb-6 last:border-b-0">
                {/* Product Header */}
                <Flex gap="3" align="start" className="mb-4">
                  {/* Product Image */}
                  {review.productImage && (
                    <Box className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                      <Image
                        src={review.productImage}
                        alt={review.productName}
                        fill
                        className="object-cover"
                      />
                    </Box>
                  )}

                  <Box className="flex-1">
                    {/* Product Name */}
                    <Text className="text-base font-medium text-black">
                      {review.productName}
                    </Text>

                    {/* Quantity */}
                    {review.quantity && (
                      <Text className="text-sm text-gray-500">X{review.quantity}</Text>
                    )}
                  </Box>
                </Flex>

                {/* Rating Section */}
                <Box className="mb-3">
                  <Text className="text-sm font-medium text-black mb-1">
                    {tReviews('productRating')}
                  </Text>
                  <Flex align="center" gap="1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
                      >
                        ★
                      </span>
                    ))}
                  </Flex>
                </Box>

                {/* Fit Level Section */}
                {review.productFit !== undefined && review.productFit !== 0 && (
                  <Box className="mb-3">
                    <Text className="text-sm font-medium text-black mb-1">
                      {tReviews('fitLevelLabel')}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      {tOrderHistory(`fitOptions.${
                        review.productFit === 1 ? 'perfect' :
                        review.productFit === 2 ? 'loose' :
                        review.productFit === 3 ? 'tight' : ''
                      }`)}
                    </Text>
                  </Box>
                )}

                {/* Review Content Section */}
                {review.comment && (
                  <Box className="mb-3">
                    <Text className="text-sm font-medium text-black mb-1">
                      {tReviews('reviewContent')}
                    </Text>
                    <Text className="text-sm text-gray-700">{review.comment}</Text>
                  </Box>
                )}

                {/* Images Section */}
                {review.images && review.images.length > 0 && (
                  <Box className="mb-3">
                    <Text className="text-sm font-medium text-black mb-2">
                      {tReviews('productImages')}
                    </Text>
                    <Flex gap="2" className="flex-wrap">
                      {review.images.map((media, imgIndex) => (
                        <Box
                          key={imgIndex}
                          className="w-28 h-28 relative rounded-lg overflow-hidden border border-gray-200"
                        >
                          <Image
                            src={media.url}
                            alt={`Review ${imgIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                          {media.type === 'video' && (
                            <Flex className="absolute inset-0 items-center justify-center bg-black/30">
                              <PlayIcon className="w-10 h-10 text-white" />
                            </Flex>
                          )}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Date Section */}
                {review.createdAt && (
                  <Text className="text-xs text-gray-500 mt-4">
                    {tReviews('submissionDate')} {new Date(review.createdAt).toLocaleString(locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="py-8 text-center">
            <Text className="text-gray-500">{tOrderHistory('noReviewFound')}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
