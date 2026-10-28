import { Box, Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export async function ContactSection() {
  const t = await getTranslations('faqPage.contact');

  return (
    <Box className="py-6 lg:py-8 border-t border-[#F0F0F0]">
      <Flex
        direction="column"
        align="center"
        className="p-6 bg-[#FDF7F1] rounded-2xl gap-4"
      >
        <Text className="text-black text-lg lg:text-xl font-semibold text-center">
          {t('title')}
        </Text>
        <Text className="text-gray-600 text-sm lg:text-base text-center">
          {t('description')}
        </Text>
        <Flex direction="column" align="center" gap="2">
          <Text
            className="text-sm lg:text-base font-medium"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {t('hotline')}
          </Text>
          <Text className="text-gray-500 text-xs lg:text-sm">
            {t('hotlineTime')}
          </Text>
          <Text className="text-black text-sm lg:text-base">
            {t('email')}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
