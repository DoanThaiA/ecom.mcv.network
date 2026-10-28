'use client';

import { useState } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ThumbUpIcon, ThumbDownIcon } from '@/components/common/icons';
import { useTranslations } from 'next-intl';

type FeedbackType = 'like' | 'dislike' | null;

interface FeedbackSectionProps {
  showBorder?: boolean;
}

export function FeedbackSection({ showBorder = true }: FeedbackSectionProps) {
  const t = useTranslations('common');
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const email = "cskh@cchat.vn";
  const phone = '0868 506 800';

  const handleFeedback = (type: FeedbackType) => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <Box
      className={`flex flex-col justify-center items-center py-6 gap-4 lg:py-8 lg:gap-6 ${showBorder ? 'border-b border-[#F0F0F0]' : ''}`}
    >
      {/* Question */}
      <Text className="text-black text-sm leading-6 lg:text-base lg:leading-7">
        {t('feedback.question')}
      </Text>

      {/* Feedback Buttons */}
      <Flex align="center" gap="6" className="lg:gap-8">
        <button
          onClick={() => handleFeedback('like')}
          className="transition-all duration-200 rounded-lg hover:scale-105 active:scale-95"
        >
          <ThumbUpIcon
            selected={feedback === 'like'}
            className="w-[82px] h-[56px] lg:w-[100px] lg:h-[68px]"
          />
        </button>
        <button
          onClick={() => handleFeedback('dislike')}
          className="transition-all duration-200 rounded-lg hover:scale-105 active:scale-95"
        >
          <ThumbDownIcon
            selected={feedback === 'dislike'}
            className="w-[82px] h-[56px] lg:w-[100px] lg:h-[68px]"
          />
        </button>
      </Flex>

      {/* Contact Info */}
      <Text className="text-black text-sm leading-6 lg:text-base lg:leading-7 self-stretch">
        {t('feedback.contactInfo')}{' '}
        <a
          href={`mailto:${email}`}
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          {email}
        </a>{' '}
        {t('feedback.orCall')}{' '}
        <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          {phone}
        </a>{' '}
        {t('feedback.thankYou')}
      </Text>
    </Box>
  );
}
