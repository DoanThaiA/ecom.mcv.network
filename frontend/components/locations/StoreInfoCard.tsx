'use client';

import { Box, Text, Flex } from '@radix-ui/themes';
import { Store } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface StoreInfoCardProps {
  store: Store;
}

export function StoreInfoCard({ store }: StoreInfoCardProps) {
  const t = useTranslations('locations');

  return (
    <Flex direction="column" gap="4" className="lg:mt-4">
      {/* Store Info Container */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        className="p-4 gap-4 bg-[#F2F2F2] rounded-2xl lg:bg-[#FDF7F1] lg:px-8 lg:py-4"
      >
        {/* Opening Hours Row */}
        <Flex
          align="center"
          className="w-full pb-4 border-b border-[#AFAFAF] gap-2.5"
        >
          <Text className="font-semibold text-sm leading-6 text-black">
            {t('openingHours')}
          </Text>

          {/* Vertical Line */}
          <Box className="w-[1px] h-4 bg-black" />

          {/* Time */}
          <Text className="font-semibold text-sm leading-6 bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent">
            {store.openTime} - {store.closeTime} {t('daily')}
          </Text>
        </Flex>

        {/* Address & Phone */}
        <Box className="w-full text-sm leading-6 text-black">
          <Text className="block">
            {t('address')}:{' '}
            <span className="underline decoration-[#C0752F] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent">
              {store.address}
            </span>
          </Text>
          <Text className="block">
            {t('phone')}:{' '}
            <a
              href={`tel:${store.phone.replace(/\s/g, '')}`}
              className="underline decoration-[#C0752F] bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent"
            >
              {store.phone}
            </a>
          </Text>
        </Box>
      </Flex>

      {/* Google Map - Hidden on desktop inside this component */}
      <a
        href={store.googleMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden block w-full h-[246px] rounded-2xl overflow-hidden cursor-pointer"
      >
        <iframe
          src={store.googleMapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none"
        />
      </a>
    </Flex>
  );
}
