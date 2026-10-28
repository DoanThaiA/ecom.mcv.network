import { Box, Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export async function StepsSection() {
  const t = await getTranslations('accountDeletion.steps');

  const steps = ['step1', 'step2', 'step3'] as const;

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-4 border-b border-[#F0F0F0] lg:py-8 lg:gap-6"
    >
      {/* Section Header */}
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Flex
          justify="center"
          align="center"
          className="px-8 py-2 rounded-r-[32px]"
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
          {t('title')} {t('subtitle')}
        </Text>
      </Flex>

      {/* Steps */}
      <Box className="self-stretch flex flex-col gap-4 lg:gap-6">
        {steps.map((step) => (
          <Flex
            key={step}
            align="start"
            gap="4"
            className="p-4 bg-[#FAFAFA] rounded-xl lg:p-6"
          >
            {/* Step Number */}
            <Flex
              justify="center"
              align="center"
              className="w-10 h-10 rounded-full flex-shrink-0 lg:w-12 lg:h-12"
              style={{
                background:
                  'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
              }}
            >
              <Text className="text-white text-base font-semibold lg:text-lg">
                {t(`${step}.number`)}
              </Text>
            </Flex>

            {/* Step Content */}
            <Flex direction="column" gap="1" className="flex-1">
              <Text className="text-black text-sm font-semibold leading-5 lg:text-base lg:leading-6">
                {t(`${step}.title`)}
              </Text>
              <Text className="text-[#666666] text-sm leading-5 lg:text-base lg:leading-6">
                {t(`${step}.description`)}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
}
