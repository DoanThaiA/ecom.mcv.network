import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export async function HeroSection() {
  const t = await getTranslations('accountDeletion');

  return (
    <Flex
      direction="column"
      align="center"
      className="pt-12 pb-6 gap-4 border-b border-[#F0F0F0] lg:pt-20 lg:pb-8 lg:gap-6"
    >
      {/* Title */}
      <Text className="text-black font-semibold self-stretch text-2xl leading-8 lg:text-4xl lg:leading-[48px]">
        {t('pageTitle')}
      </Text>

      {/* Subtitle Card */}
      <Flex
        justify="center"
        align="center"
        className="w-[calc(100%+40px)] -mx-5 py-4 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch lg:py-5"
      >
        <Text className="text-black text-sm leading-6 text-center lg:text-base lg:leading-7">
          {t('subtitle')}
        </Text>
      </Flex>
    </Flex>
  );
}
