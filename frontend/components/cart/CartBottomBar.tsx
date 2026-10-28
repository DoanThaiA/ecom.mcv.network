'use client';

import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';

interface CartBottomBarProps {
  total: number;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
}

export function CartBottomBar({
  total,
  isPlacingOrder,
  onPlaceOrder,
}: CartBottomBarProps) {
  const t = useTranslations('cart');
  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
      <Box className="container mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-16 max-w-[1920px]">
        <Flex justify="between" align="center" gap="3" className="sm:gap-4 lg:justify-end">
          <Box className="lg:hidden">
            <Text size="1" className="text-gray-600 mb-1 block sm:hidden">
              {t('totalAmount')}
            </Text>
            <Text
              size={{ initial: '5', sm: '6' }}
              weight="bold"
              className="text-black"
            >
              {formatPrice(total || 0)}
            </Text>
          </Box>
          <Flex align="center" gap="4" className="lg:gap-6">
            <Text size="6" weight="bold" className="text-black hidden lg:block">
              {formatPrice(total || 0)}
            </Text>
            <Button
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="cursor-pointer bg-black text-white px-6 py-2.5 sm:px-8 sm:py-3 lg:px-10 lg:py-4 rounded text-base sm:text-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? t('placingOrder') : t('placeOrder')}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
