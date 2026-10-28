'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

export function FooterCopyright() {
  const t = useTranslations('footer');

  return (
    <>
      {/* Mobile */}
      <Box className="md:hidden py-4 text-center">
        <Flex direction="column" align="center" gap="3">
          {/* <a
            href="http://online.gov.vn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/assets/images/badge.png"
              alt="Đã thông báo Bộ Công Thương"
              width={150}
              height={50}
                          />
          </a> */}
          <Text className="text-sm text-gray-500">{t('copyright')}</Text>
        </Flex>
      </Box>

      {/* Desktop */}
      <Box className="hidden md:block">
        <Text className="text-xs leading-3 text-black">{t('copyright')}</Text>
      </Box>
    </>
  );
}
