'use client';

import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import {
  FileTextIcon,
  ImageIcon,
  PaperPlaneIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

interface ReturnStepsSectionProps {
  onRequestClick: () => void;
}

export function ReturnStepsSection({ onRequestClick }: ReturnStepsSectionProps) {
  const t = useTranslations('returnPolicy');

  const steps = [
    {
      icon: FileTextIcon,
      title: t('section.step1Title'),
      desc: t('section.step1Desc'),
      hasButton: true,
    },
    {
      icon: ImageIcon,
      title: t('section.step2Title'),
      desc: t('section.step2Desc'),
      hasButton: false,
    },
    {
      icon: PaperPlaneIcon,
      title: t('section.step3Title'),
      desc: t('section.step3Desc'),
      hasButton: false,
    },
    {
      icon: CheckCircledIcon,
      title: t('section.step4Title'),
      desc: t('section.step4Desc'),
      hasButton: false,
    },
  ];

  return (
    <Box className="bg-[#333333] py-6 sm:py-8 px-4 sm:px-8 lg:px-[60px] my-6 sm:my-8">
      <Heading
        as="h2"
        size="5"
        className="text-white text-center mb-2 uppercase font-bold"
      >
        {t('section.stepsTitle')}
      </Heading>
      <Text className="text-gray-300 text-center text-sm mb-8 block">
        {t('section.stepsNote')}
      </Text>

      <Flex
        className="flex-col md:flex-row gap-3 sm:gap-4"
        justify="center"
      >
        {steps.map((step, index) => (
          <Box
            key={index}
            className="bg-white rounded-lg p-4 sm:p-6 flex-1 w-full md:max-w-[280px] mx-auto md:mx-0"
          >
            <Flex direction="column" align="start" gap="3">
              <Box className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <step.icon width="24" height="24" className="text-gray-600" />
              </Box>
              <Text className="font-bold text-black">{step.title}</Text>
              <Text className="text-gray-600 text-sm">{step.desc}</Text>
              {step.hasButton && (
                <Button
                  onClick={onRequestClick}
                  className="mt-2 bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800"
                >
                  {t('requestButton')}
                </Button>
              )}
            </Flex>
          </Box>
        ))}
      </Flex>

      <Text className="text-yellow-400 text-center text-sm mt-6 block">
        {t('section.stepsWarning')}
      </Text>
    </Box>
  );
}
