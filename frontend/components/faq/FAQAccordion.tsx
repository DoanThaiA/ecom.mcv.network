'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <Box className="border-b border-[#F0F0F0]">
      <Flex
        align="center"
        justify="between"
        className="py-4 cursor-pointer"
        onClick={onToggle}
      >
        <Text className="text-black text-sm lg:text-base font-medium flex-1 pr-4">
          {question}
        </Text>
        <Box
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDownIcon width={20} height={20} />
        </Box>
      </Flex>
      <Box
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] pb-4' : 'max-h-0'
        }`}
      >
        <Text className="text-gray-600 text-sm lg:text-base whitespace-pre-line">
          {answer}
        </Text>
      </Box>
    </Box>
  );
}

interface FAQCategoryProps {
  title: string;
  categoryKey: string;
}

function FAQCategory({ title, categoryKey }: FAQCategoryProps) {
  const t = useTranslations(`faqPage.categories.${categoryKey}.questions`);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = ['q1', 'q2', 'q3'];

  return (
    <Box className="mb-8">
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] mb-4 md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0"
      >
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="h-10 px-4 rounded-r-[20px]"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Box className="w-3 h-3 bg-white rounded-full" />
        </Flex>
        <Text className="text-black text-sm lg:text-base font-semibold flex-1 px-4">
          {title}
        </Text>
      </Flex>

      <Box className="pl-0 lg:pl-4">
        {questions.map((qKey, index) => (
          <FAQItem
            key={qKey}
            question={t(`${qKey}.question`)}
            answer={t(`${qKey}.answer`)}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </Box>
    </Box>
  );
}

export function FAQAccordion() {
  const t = useTranslations('faqPage.categories');

  const categories = [
    { key: 'ordering', title: t('ordering.title') },
    { key: 'payment', title: t('payment.title') },
    { key: 'shipping', title: t('shipping.title') },
    { key: 'returns', title: t('returns.title') },
    { key: 'products', title: t('products.title') },
    { key: 'account', title: t('account.title') },
  ];

  return (
    <Box className="py-6 lg:py-8">
      {categories.map((category) => (
        <FAQCategory
          key={category.key}
          categoryKey={category.key}
          title={category.title}
        />
      ))}
    </Box>
  );
}
