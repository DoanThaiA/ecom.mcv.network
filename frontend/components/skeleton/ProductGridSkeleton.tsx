'use client';

import { Box, Flex, Skeleton } from '@radix-ui/themes';
import times from 'lodash/times';

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <Box className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6">
      {times(count, (index) => (
        <Box key={index} className="flex flex-col gap-2">
          {/* Wrap Skeleton in Box because Skeleton renders as span (inline element) which doesn't support aspect-ratio */}
          <Box className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-200">
            <Skeleton className="w-full h-full" />
          </Box>
          <Flex gap="2">
            <Skeleton className="w-8 h-4 rounded-lg" />
            <Skeleton className="w-8 h-4 rounded-lg" />
            <Skeleton className="w-8 h-4 rounded-lg" />
          </Flex>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </Box>
      ))}
    </Box>
  );
}
