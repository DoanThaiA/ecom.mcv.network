import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export async function HeroSection() {
  const t = await getTranslations('returnPolicy');

  return (
    <Flex
      direction="column"
      align="center"
      className="pt-12 pb-6 gap-4 border-b border-[#F0F0F0] lg:pt-20 lg:pb-8 lg:gap-6"
    >
      {/* Title */}
      <Text className="text-black font-semibold self-stretch text-2xl leading-7 lg:text-4xl lg:leading-[48px]">
        {t('pageTitle')}
      </Text>

      {/* Banner Card */}
      <Flex
        justify="center"
        align="center"
        gap="2.5"
        className="self-stretch py-8 px-4 rounded-3xl lg:rounded-3xl"
        style={{
          background:
            'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
        }}
      >
        {/* Icon */}
        <Flex align="center" justify="center" className="w-12 h-12 flex-shrink-0">
          <Image
            src="/assets/svg/policy/return-icon.svg"
            alt="Return icon"
            width={32}
            height={31}
          />
        </Flex>
        {/* Text */}
        <Flex direction="column" className="lg:flex-row lg:gap-1">
          <Text className="text-white text-xl leading-6 font-semibold lg:text-2xl lg:leading-8">
            {t('banner.line1')}
          </Text>
          <Text className="text-white text-xl leading-6 font-semibold lg:text-2xl lg:leading-8">
            {t('banner.line2')}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
