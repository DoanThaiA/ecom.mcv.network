import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export async function HeroSection() {
  const t = await getTranslations('deliveryPolicy');

  return (
    <Flex
      direction="column"
      align="center"
      className="pt-12 pb-4 gap-4 lg:pt-20 lg:pb-8 lg:gap-6"
    >
      {/* Title only */}
      <Text className="text-black font-semibold self-stretch text-2xl leading-7 lg:text-4xl lg:leading-[48px]">
        {t('pageTitle')}
      </Text>
    </Flex>
  );
}
