'use client';

import { Box, Flex, Text, Link } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function FooterDesktopContactRow() {
  const t = useTranslations('footer');

  return (
    <Flex align="start" className="py-8 gap-2.5 flex-wrap lg:flex-nowrap">
      {/* Left: Hotline + Email */}
      <Flex align="start" gap="4" className="flex-1 min-w-[300px] lg:gap-8">
        {/* Hotline */}
        <Link
          href={`tel:${t('phoneNumber')}`}
          className="flex items-center gap-2 lg:gap-3 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Box className="w-10 h-10 lg:w-14 lg:h-14 flex-shrink-0">
            <Image
              src="/assets/svg/footer/phone.svg"
              alt="Phone"
              width={56}
              height={56}
              className="w-full h-full"
            />
          </Box>
          <Flex direction="column" gap="0">
            <Text className="text-base lg:text-xl leading-5 lg:leading-6 text-[#222222]">{t('hotline')}</Text>
            <Text className="text-base lg:text-xl leading-5 lg:leading-6 text-[#222222]">{t('phoneNumber')}</Text>
          </Flex>
        </Link>

        {/* Email */}
        <Link
          href={`mailto:${t('emailAddress')}`}
          className="flex items-center gap-2 lg:gap-3 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Box className="w-10 h-10 lg:w-14 lg:h-14 flex-shrink-0">
            <Image
              src="/assets/svg/footer/email.svg"
              alt="Email"
              width={56}
              height={56}
              className="w-full h-full"
            />
          </Box>
          <Flex direction="column" gap="0">
            <Text className="text-base lg:text-xl leading-5 lg:leading-6 text-[#222222]">{t('emailLabel')}</Text>
            <Text className="text-base lg:text-xl leading-5 lg:leading-6 text-[#222222] whitespace-nowrap">{t('emailAddress')}</Text>
          </Flex>
        </Link>
      </Flex>

      {/* Right: Social Links (2x2 grid) */}
      <Box className="grid grid-cols-2 gap-x-4 lg:gap-x-8 gap-y-2 flex-1 min-w-[280px]">
        {/* Row 1 */}
        <Link
          href="https://s.shopee.vn/9pR6K7IBhE"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/svg/footer/shopee.svg"
            alt="Shopee"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
          <Text className="text-xs lg:text-sm leading-5 lg:leading-6 text-[#222222]">
            {t('shopeeShop')}
          </Text>
        </Link>
        <Link
          href="https://www.tiktok.com/@cchatclothes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/svg/footer/tiktok_shop.svg"
            alt="TiktokShop"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
          <Text className="text-xs lg:text-sm leading-5 lg:leading-6 text-[#222222]">
            {t('tiktokShop')}
          </Text>
        </Link>

        {/* Row 2 */}
        <Link
          href="https://www.tiktok.com/@cchatclothes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/svg/footer/titok.svg"
            alt="Tiktok"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
          <Text className="text-xs lg:text-sm leading-5 lg:leading-6 text-[#222222]">{t('tiktok')}</Text>
        </Link>
        <Link
          href="https://www.facebook.com/share/14W4gr2XzGb/?mibextid=wwXIfr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black no-underline hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/svg/footer/facebook.svg"
            alt="Facebook"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
          <Text className="text-xs lg:text-sm leading-5 lg:leading-6 text-[#222222]">
            {t('facebook')}
          </Text>
        </Link>
      </Box>
    </Flex>
  );
}
