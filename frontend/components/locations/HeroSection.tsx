'use client';

import { Box, Text, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { STORE_STATS } from '@/lib/constants';
import { LocationPinIcon } from '@/components/common/icons';

export function HeroSection() {
  const t = useTranslations('locations');

  return (
    <Box>
      {/* Title Section */}
      <Flex
        direction="column"
        justify="center"
        align="start"
        className="py-6 gap-4 border-b border-[#F0F0F0] lg:pt-12"
      >
        {/* Title with Icon */}
        <Flex align="start" gap="4" className="w-full">
          {/* Title Text */}
          <Text className="flex-1 text-black font-semibold text-2xl leading-8 whitespace-pre-line lg:whitespace-nowrap lg:text-4xl">
            {t('title')}
          </Text>

          {/* Icon Container */}
          <Flex
            justify="center"
            align="center"
            className="w-12 h-12 bg-[#F0F0F0] rounded-full flex-shrink-0"
          >
            <LocationPinIcon className="w-6 h-[34px] text-black" />
          </Flex>
        </Flex>
      </Flex>

      {/* Stats Section */}
      <Box className="py-6 bg-[#FDF7F1] border-b border-[#F0F0F0] -mx-5 px-5 md:-mx-10 md:px-10 lg:-mx-[calc((100vw-800px)/2)] lg:px-[calc((100vw-800px)/2)]">
        <Box className="max-w-[800px] mx-auto">
          {/* Description */}
          <Box className="pb-6 border-b border-[#AFAFAF]">
            <Text className="text-black text-sm leading-5 block">
              {t('description')}
            </Text>
          </Box>

          {/* Stats Items */}
          <Flex direction="column" gap="2" className="pt-4">
            {/* Total Stores */}
            <Box className="h-[72px] flex flex-col justify-end">
              <Text className="font-semibold text-[32px] leading-[48px] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent">
                {String(STORE_STATS.totalStores).padStart(2, '0')}
              </Text>
              <Text className="text-black text-sm leading-6">
                {t('totalStores')}
              </Text>
            </Box>

            {/* Grand Opening */}
            <Box className="h-[72px] flex flex-col justify-end">
              <Text className="font-semibold text-[32px] leading-[48px] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent uppercase">
                {t('grandOpening')}
              </Text>
              <Text className="text-black text-sm leading-6">
                {t('alwaysPromotions')}
              </Text>
            </Box>

            {/* Customers Per Day */}
            <Box className="h-[72px] flex flex-col justify-end">
              <Text className="font-semibold text-[32px] leading-[48px] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent">
                {STORE_STATS.customersPerDay.toLocaleString()}
              </Text>
              <Text className="text-black text-sm leading-6">
                {t('customersPerDay')}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
