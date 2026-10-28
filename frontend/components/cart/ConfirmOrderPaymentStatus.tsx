'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface ConfirmOrderPaymentStatusProps {
  isProcessing: boolean;
  onRetry: () => void;
}

export function ConfirmOrderPaymentStatus({
  isProcessing,
  onRetry,
}: ConfirmOrderPaymentStatusProps) {
  const tCart = useTranslations('cart');

  if (!isProcessing) return null;

  return (
    <Box className="m-4 p-4 bg-[#FEF3CD] border border-[#FFEEBA] rounded-lg">
      <Flex align="center" gap="3">
        <Box className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#FAA63E]" />
        <Text className="text-sm text-[#856404] font-medium flex-1">
          {tCart("processingPayment")}
        </Text>
        <button
          onClick={onRetry}
          className="cursor-pointer text-[#FAA63E] bg-white border border-[#FAA63E] rounded-full text-sm font-medium hover:bg-[#FEF8F1] px-4 py-2"
        >
          {tCart("cancelPayment")}
        </button>
      </Flex>
    </Box>
  );
}
