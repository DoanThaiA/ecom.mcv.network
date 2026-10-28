'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { Box, Flex, IconButton, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface MemberPromoPopupProps {
  onClose: () => void;
  className?: string;
}

export function MemberPromoPopup({
  onClose,
  className = '',
}: MemberPromoPopupProps) {
  const t = useTranslations('promo');

  return (
    <Box className={`absolute top-full right-0 mt-2 z-[100] ${className}`}>
      <Box className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] max-w-[240px] border border-gray-200">
        <Flex justify="between" align="start" gap="2">
          <Flex direction="column" gap="1">
            <img
              src="/assets/images/logo.webp"
              alt="CCHAT"
              width={60}
              height={20}
            />
            <Text size="1" className="leading-tight font-semibold text-xs">
              {t('newOrderDiscount')}
            </Text>
          </Flex>
          <IconButton
            size="1"
            variant="ghost"
            className="cursor-pointer text-black hover:text-gray-600 hover:bg-gray-100 rounded-full flex-shrink-0 -mt-1 -mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <Cross1Icon width="14" height="14" />
          </IconButton>
        </Flex>
      </Box>
      {/* Arrow pointing up */}
      <Box className="absolute -top-1 right-3 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45" />
    </Box>
  );
}
