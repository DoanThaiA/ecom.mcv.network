'use client';

import { Box, Flex, Heading, Skeleton } from '@radix-ui/themes';
import times from 'lodash/times';

interface TopicSectionSkeletonProps {
  topicName: string;
  count?: number;
}

export function TopicSectionSkeleton({
  topicName,
  count = 6,
}: TopicSectionSkeletonProps) {
  return (
    <Box className="pl-6 sm:px-8 lg:px-12">
      {/* Header */}
      <Flex align="center" mb="4" className="gap-2">
        <Heading className="font-semibold text-lg sm:text-xl md:text-2xl">
          {topicName}
        </Heading>
      </Flex>

      {/* Product Slider Skeleton */}
      <Box className="overflow-hidden">
        <Flex gap="1" align="start">
          {times(count, (index) => (
            <Box
              key={index}
              className="flex-[0_0_47%] md:flex-[0_0_23%] lg:flex-[0_0_12%] min-w-0 pr-3"
            >
              {/* Product Card Skeleton */}
              <Box className="flex flex-col">
                {/* Image */}
                <Skeleton className="w-full h-[215px] lg:h-[255px] rounded-lg" />

                {/* Color pills */}
                <Flex gap="2" className="mt-2 mb-2">
                  {times(3, (i) => (
                    <Skeleton key={i} className="w-8 h-4 rounded-lg" />
                  ))}
                </Flex>

                {/* Name */}
                <Skeleton className="h-4 w-3/4 mb-1" />

                {/* Price */}
                <Skeleton className="h-4 w-2/5" />
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
