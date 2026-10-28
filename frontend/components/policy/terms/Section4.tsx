import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

const highlightText = (chunks: React.ReactNode) => (
  <span
    className="bg-clip-text text-transparent whitespace-nowrap"
    style={{
      backgroundImage:
        'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
    }}
  >
    {chunks}
  </span>
);

export async function Section4() {
  const t = await getTranslations('termsPolicy.section4');

  return (
    <Flex
      direction="column"
      className="py-6 gap-4 border-b border-[#F0F0F0] lg:py-8 lg:gap-6"
    >
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="h-12 px-4 rounded-r-[24px] lg:h-14 lg:px-6"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Text className="text-white font-bold text-sm lg:text-base">04</Text>
        </Flex>
        <Text className="text-black text-sm leading-5 lg:text-lg lg:leading-7 font-semibold flex-1 px-4">
          {t('title')}
        </Text>
      </Flex>

      <Flex direction="column" gap="3" className="pl-4">
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
          • {t.rich('content1', { highlight: highlightText })}
        </Text>
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
          • {t('content2')}
        </Text>
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
          • {t('content3')}
        </Text>
      </Flex>
    </Flex>
  );
}
