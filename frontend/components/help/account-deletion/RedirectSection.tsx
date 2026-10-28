'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';

export function RedirectSection() {
  const t = useTranslations('accountDeletion.form');
  const locale = useLocale();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-4 lg:py-8 lg:gap-6"
    >
      {/* Section Header */}
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Flex
          justify="center"
          align="center"
          className="px-8 py-2 rounded-r-[32px] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526]"
        >
          <Text className="text-white text-[32px] leading-[48px] lg:text-[40px] lg:leading-[56px] font-semibold">
            {t('number')}
          </Text>
        </Flex>
        {/* Title */}
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold flex-1 px-4">
          {t('title')} {t('subtitle')}
        </Text>
      </Flex>

      {/* Loading skeleton while checking auth */}
      {!isMounted ? (
        <Box className="self-stretch h-[100px] bg-gray-100 rounded-lg animate-pulse" />
      ) : isAuthenticated ? (
        <>
          {/* Description */}
          <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
            {t('redirectDescription')}
          </Text>

          {/* Redirect Button */}
          <Link href={`/${locale}/account`} className="self-stretch">
            <PrimaryButton fullWidth>
              {t('goToAccount')}
            </PrimaryButton>
          </Link>
        </>
      ) : (
        /* Not logged in warning */
        <Box className="self-stretch p-4 bg-[#FFF8E6] border border-[#FFD666] rounded-lg">
          <Flex align="center" gap="3">
            <ExclamationTriangleIcon className="w-5 h-5 text-[#D48806] shrink-0" />
            <Flex direction="column" gap="1">
              <Text className="text-sm font-semibold text-[#D48806]">
                {t('loginRequired')}
              </Text>
              <Text className="text-sm text-[#8C6A00]">
                {t('loginRequiredDescription')}
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Contact Note */}
      <Text className="text-[#666666] text-sm leading-5 text-center">
        {t('contactNote')}
      </Text>
    </Flex>
  );
}
