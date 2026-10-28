import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export async function Section1() {
  const t = await getTranslations('returnPolicy.section1');

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
        {/* Number box */}
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="h-16 px-8 py-2 rounded-r-[32px]"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Text className="text-white text-[32px] leading-[48px] lg:text-[40px] lg:leading-[56px] font-semibold">
            {t('number')}
          </Text>
        </Flex>
        {/* Title */}
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold flex-1 px-4">
          {t('title')}
        </Text>
      </Flex>

      {/* Description */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {t('description')}
      </Text>

      {/* Order Info */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {t('storeOrder')}
        <br />
        {t('onlineOrder')}
      </Text>
    </Flex>
  );
}
