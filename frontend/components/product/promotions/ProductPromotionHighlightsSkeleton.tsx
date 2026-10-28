import { Box, Flex } from '@radix-ui/themes';

export function ProductPromotionHighlightsSkeleton() {
  return (
    <Box
      aria-hidden="true"
      className="mb-5 mt-3 min-h-[4.5rem] animate-pulse border-y border-gray-100 py-3"
    >
      <Flex direction="column" gap="3">
        <Flex gap="3" align="center">
          <Box className="h-4 w-28 rounded bg-gray-100" />
          <Box className="h-7 w-20 rounded-md bg-gray-100" />
        </Flex>
        <Flex gap="3" align="center">
          <Box className="h-4 w-28 rounded bg-gray-100" />
          <Box className="h-7 w-24 rounded-md bg-gray-100" />
        </Flex>
      </Flex>
    </Box>
  );
}
