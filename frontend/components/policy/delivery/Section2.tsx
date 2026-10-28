import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import React from 'react';

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

interface NumberBadgeProps {
  number: string;
}

function NumberBadge({ number }: NumberBadgeProps) {
  return (
    <Flex
      justify="center"
      align="center"
      className="w-6 h-6 rounded-full flex-shrink-0"
      style={{
        background:
          'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 97.77%)',
      }}
    >
      <Text className="text-white text-sm leading-6 font-semibold">
        {number}
      </Text>
    </Flex>
  );
}

interface ReasonItemProps {
  number: string;
  text: React.ReactNode;
}

function ReasonItem({ number, text }: ReasonItemProps) {
  return (
    <Flex align="start" gap="2" className="self-stretch">
      <NumberBadge number={number} />
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 flex-1">
        {text}
      </Text>
    </Flex>
  );
}

export async function Section2() {
  const t = await getTranslations('deliveryPolicy.section2');

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-6 border-b border-[#F0F0F0] lg:py-8 lg:gap-8"
    >
      {/* Delay Intro Card - full width with negative margin */}
      <Flex
        direction="row"
        justify="center"
        align="center"
        className="w-[calc(100%+40px)] -mx-5 py-8 px-4 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch lg:py-10 lg:px-6"
      >
        <Text className="text-black text-sm leading-6 lg:text-base lg:leading-7 text-start">
          {t('delayIntro')}
        </Text>
      </Flex>

      {/* Delay Reasons List with numbered badges */}
      <Flex direction="column" gap="4" className="self-stretch lg:gap-6">
        <ReasonItem
          number="01"
          text={t.rich('delayReasons.reason1', { highlight: highlightText })}
        />
        <ReasonItem
          number="02"
          text={t.rich('delayReasons.reason2', { highlight: highlightText })}
        />
        <ReasonItem
          number="03"
          text={t.rich('delayReasons.reason3', { highlight: highlightText })}
        />
        <ReasonItem
          number="04"
          text={t.rich('delayReasons.reason4', { highlight: highlightText })}
        />
      </Flex>

      {/* Delivery Attempts */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {t.rich('deliveryAttempts', { highlight: highlightText })}
      </Text>

      {/* Check Order Card - full width with negative margin */}
      <Flex
        direction="row"
        justify="center"
        align="center"
        className="w-[calc(100%+40px)] -mx-5 py-8 px-4 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch lg:py-10 lg:px-6"
      >
        <Text className="text-black text-sm leading-6 lg:text-base lg:leading-7 text-start">
          {t.rich('checkOrder', { highlight: highlightText })}
        </Text>
      </Flex>

      {/* Check Product */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {t.rich('checkProduct', { highlight: highlightText })}
      </Text>
    </Flex>
  );
}
