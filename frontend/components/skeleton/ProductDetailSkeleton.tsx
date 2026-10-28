import { Box, Flex, Skeleton } from '@radix-ui/themes';

export function ProductDetailSkeleton() {
  return (
    <>
      {/* Breadcrumb Skeleton */}
      <Box className="mb-6 mt-[60px] ml-[60px]">
        <Flex gap="2" align="center" className="text-sm">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="14px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="14px" height="14px" />
          <Skeleton width="100px" height="14px" />
        </Flex>
      </Box>

      {/* Product Detail Section */}
      <Box className="mb-16 xl:w-[65%] xl:mx-auto lg:w-[80%] lg:mx-auto px-4 lg:px-0">
        <Flex gap="5" className="flex-col lg:flex-row">
          {/* Left: Image Gallery Skeleton */}
          <Flex
            gap="3"
            className="flex-col-reverse xl:flex-row w-full lg:w-auto"
          >
            {/* Thumbnail Images - Vertical on desktop, horizontal on mobile */}
            <Flex
              gap="2"
              className="flex-row xl:flex-col overflow-x-auto md:overflow-visible"
            >
              <Skeleton className="w-[70px] h-[84px] flex-shrink-0 rounded-lg" />
              <Skeleton className="w-[70px] h-[84px] flex-shrink-0 rounded-lg" />
              <Skeleton className="w-[70px] h-[84px] flex-shrink-0 rounded-lg" />
              <Skeleton className="w-[70px] h-[84px] flex-shrink-0 rounded-lg" />
            </Flex>

            {/* Main Image */}
            <Skeleton className="w-full h-full aspect-[5/6] lg:max-w-[600px] max-h-[600px] rounded-lg">
              <Box className="lg:w-[400px]"></Box>
            </Skeleton>
          </Flex>

          {/* Right: Product Info Skeleton */}
          <Box className="flex-1 w-full">
            {/* Product Name */}
            <Skeleton
              width="80%"
              height="34px"
              className="mb-3"
              style={{ maxWidth: '400px' }}
            />

            {/* Price Section */}
            <Flex align="center" gap="3" className="mb-5">
              <Skeleton width="150px" height="28px" />
              <Skeleton width="100px" height="20px" />
              <Skeleton width="60px" height="24px" />
            </Flex>

            {/* Color Selection */}
            <Box className="mb-4">
              <Skeleton width="120px" height="20px" className="mb-3" />
              <Flex gap="2">
                <Skeleton className="w-[47px] h-[30px] rounded" />
                <Skeleton className="w-[47px] h-[30px] rounded" />
                <Skeleton className="w-[47px] h-[30px] rounded" />
              </Flex>
            </Box>

            {/* Size Selection */}
            <Box className="mb-5">
              <Flex justify="between" align="center" className="mb-3">
                <Skeleton width="100px" height="20px" />
                <Skeleton width="80px" height="20px" />
              </Flex>
              <Flex gap="4">
                <Skeleton className="w-[55px] h-[30px] rounded-lg" />
                <Skeleton className="w-[55px] h-[30px] rounded-lg" />
                <Skeleton className="w-[55px] h-[30px] rounded-lg" />
                <Skeleton className="w-[55px] h-[30px] rounded-lg" />
              </Flex>
            </Box>

            {/* Quantity Selector & Action Buttons */}
            <Flex gap="4" className="mb-4">
              <Skeleton className="w-[102px] h-[50px] rounded" />
              <Skeleton className="flex-1 h-[50px] rounded" />
              <Skeleton className="flex-1 h-[50px] rounded" />
            </Flex>

            {/* Product Features Section */}
            <Box className="bg-[#D9D9D9] rounded-lg p-4">
              <Flex className="gap-4 flex-wrap lg:flex-nowrap justify-between mb-4">
                <Flex gap="3" align="start" className="flex-1 min-w-[200px]">
                  <Skeleton className="w-7 h-7 flex-shrink-0" />
                  <Box className="flex-1">
                    <Skeleton width="120px" height="24px" className="mb-2" />
                    <Skeleton width="100%" height="20px" />
                  </Box>
                </Flex>
                <Flex gap="3" align="start" className="flex-1 min-w-[200px]">
                  <Skeleton className="w-7 h-7 flex-shrink-0" />
                  <Box className="flex-1">
                    <Skeleton width="120px" height="24px" className="mb-2" />
                    <Skeleton width="100%" height="20px" />
                  </Box>
                </Flex>
              </Flex>
              <Flex className="gap-4 flex-wrap lg:flex-nowrap justify-between">
                <Flex gap="3" align="start" className="flex-1 min-w-[200px]">
                  <Skeleton className="w-7 h-7 flex-shrink-0" />
                  <Box className="flex-1">
                    <Skeleton width="120px" height="24px" className="mb-2" />
                    <Skeleton width="100%" height="20px" />
                  </Box>
                </Flex>
                <Flex gap="3" align="start" className="flex-1 min-w-[200px]">
                  <Skeleton className="w-7 h-7 flex-shrink-0" />
                  <Box className="flex-1">
                    <Skeleton width="120px" height="24px" className="mb-2" />
                    <Skeleton width="100%" height="20px" />
                  </Box>
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Flex>

        {/* Product Description Skeleton */}
        <Box className="mt-8">
          <Skeleton width="200px" height="28px" className="mb-4" />
          <Skeleton width="100%" height="150px" className="rounded-lg" />
        </Box>
      </Box>
    </>
  );
}
