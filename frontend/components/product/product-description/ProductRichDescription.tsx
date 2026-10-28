'use client';

import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ProductRichDescriptionProps {
  description?: string;
}

export function ProductRichDescription({ description }: ProductRichDescriptionProps) {
  const t = useTranslations('productDetail');
  const [isExpanded, setIsExpanded] = useState(false);
  if (!description?.trim()) return null;

  return (
    <Box data-description-block="rich-description" className="w-full">
      <Box className={`relative w-full overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-[240px] opacity-100'}`}>
        <div className="prose prose-sm max-w-none text-base leading-6 text-black" dangerouslySetInnerHTML={{ __html: description }} />
        {!isExpanded && (
          <Box
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent"
          />
        )}
      </Box>
      <Flex align="center" justify="center" className={`transition-all duration-300 ${isExpanded ? 'mt-6' : 'mt-0'}`}>
        <Button aria-expanded={isExpanded} variant="outline" className="cursor-pointer rounded-full border border-[#f0f0f0] px-6 py-2 hover:bg-gray-50" onClick={() => setIsExpanded((expanded) => !expanded)}>
          <Text weight="medium" className="text-sm text-black">{isExpanded ? t('collapse') : t('expand')}</Text>
        </Button>
      </Flex>
    </Box>
  );
}
