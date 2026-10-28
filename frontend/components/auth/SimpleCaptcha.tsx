'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import { Flex, IconButton, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { LabeledTextField } from '../common/LabeledTextField';

interface SimpleCaptchaProps {
  onValidate: (_isValid: boolean) => void;
  error?: string;
  disabled?: boolean;
}

interface CaptchaData {
  num1: number;
  num2: number;
  answer: number;
}

/**
 * Generate a random math captcha
 */
const generateCaptcha = (): CaptchaData => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  return {
    num1,
    num2,
    answer: num1 + num2,
  };
};

/**
 * SimpleCaptcha - Math captcha component
 * Layout: Input (placeholder) - Captcha Question - Reload Button
 * Gap: 8px (0.5rem) between elements
 */
export function SimpleCaptcha({
  onValidate,
  error,
  disabled,
}: SimpleCaptchaProps) {
  const t = useTranslations('signin.captcha');
  const [captcha, setCaptcha] = useState<CaptchaData>(() => generateCaptcha());
  const [userAnswer, setUserAnswer] = useState('');

  // Refresh captcha
  const handleRefresh = useCallback(() => {
    setCaptcha(generateCaptcha());
    setUserAnswer('');
    onValidate(false);
  }, [onValidate]);

  // Validate answer when user types
  useEffect(() => {
    if (userAnswer.trim() === '') {
      onValidate(false);
      return;
    }

    const numAnswer = parseInt(userAnswer, 10);
    const isValid = !isNaN(numAnswer) && numAnswer === captcha.answer;
    onValidate(isValid);
  }, [userAnswer, captcha.answer, onValidate]);

  // Handle input change - only allow numbers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value.replace(/[^0-9]/g, ''));
  };

  return (
    <Flex direction="column" gap="1">
      {/* Layout: Input - Captcha - Reload, gap 8px */}
      <Flex gap="2" align="center">
        {/* Answer input with placeholder label */}
        <div className="flex-1">
          <LabeledTextField
            label={t('placeholder')}
            labelPosition="placeholder"
            value={userAnswer}
            onChange={handleInputChange}
            inputMode="numeric"
            disabled={disabled}
            className={error ? 'field-error' : ''}
          />
        </div>

        {/* Captcha question display */}
        <Flex
          align="center"
          justify="center"
          className="bg-gray-100 border border-gray-200 rounded-[0.5rem] px-[1rem] select-none h-[3rem] min-w-[7.5rem]"
        >
          <Text
            size="4"
            weight="bold"
            className="font-mono tracking-[0.125rem]"
          >
            {captcha.num1} + {captcha.num2} = ?
          </Text>
        </Flex>

        {/* Refresh button */}
        <IconButton
          type="button"
          size="3"
          variant="soft"
          onClick={handleRefresh}
          disabled={disabled}
          className="cursor-pointer h-[3rem] w-[3rem]"
          title={t('refresh')}
        >
          <ReloadIcon width="18" height="18" />
        </IconButton>
      </Flex>

      {/* Error message - displayed below the entire row */}
      {error && (
        <Text size="1" className="text-[#FF3B30]">
          {error}
        </Text>
      )}
    </Flex>
  );
}
