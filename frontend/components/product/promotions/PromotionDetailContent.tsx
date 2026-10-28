'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ClipboardCopyIcon, DotFilledIcon } from '@radix-ui/react-icons';
import { Button, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface PromotionDetailContentProps {
  name: string;
  conditions: string[];
  promoCode?: string;
}

const COPIED_STATE_DURATION_MS = 1800;

export function PromotionDetailContent({
  name,
  conditions,
  promoCode,
}: PromotionDetailContentProps) {
  const t = useTranslations('productDetail.promotions');
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleCopyCode = async () => {
    if (!promoCode || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(
        () => setCopied(false),
        COPIED_STATE_DURATION_MS,
      );
    } catch {
      setCopied(false);
    }
  };

  return (
    <Flex direction="column" gap="2">
      <Text as="p" size="2" weight="bold" className="text-gray-950">
        {name}
      </Text>

      {conditions.map((condition, index) => (
        <Flex key={`${index}-${condition}`} gap="1" align="start">
          <DotFilledIcon className="mt-0.5 shrink-0 text-[#B65F1D]" />
          <Text as="p" size="2" className="leading-5 text-gray-700">
            {condition}
          </Text>
        </Flex>
      ))}

      {promoCode && (
        <Flex
          align="center"
          justify="between"
          gap="3"
          className="mt-1 rounded-md border border-dashed border-orange-300 bg-orange-50 px-3 py-2"
        >
          <Flex direction="column" gap="1" className="min-w-0">
            <Text size="1" className="text-gray-600">
              {t('promoCodeLabel')}
            </Text>
            <Text
              size="2"
              weight="bold"
              className="truncate tracking-wide text-[#9B5526]"
            >
              {promoCode}
            </Text>
          </Flex>
          <Button
            type="button"
            size="1"
            variant="ghost"
            aria-label={t('copyCode', { code: promoCode })}
            onClick={handleCopyCode}
            className="shrink-0 cursor-pointer text-[#9B5526]"
          >
            {copied ? <CheckIcon /> : <ClipboardCopyIcon />}
            <Text size="1" aria-live="polite" aria-atomic="true">
              {copied ? t('copied') : t('copy')}
            </Text>
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
