'use client';

import { useEffect, useState } from 'react';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { ChevronLeftIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, IconButton, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { PrimaryButton } from '@/components/common/PrimaryButton';

interface EmailVerificationNoticeDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  email: string;
  onResendEmail: () => void;
  onBackToSignIn: () => void;
  onBackClick?: () => void;
}

export function EmailVerificationNoticeDialog({
  open,
  onOpenChange,
  email,
  onResendEmail,
  onBackToSignIn,
  onBackClick,
}: EmailVerificationNoticeDialogProps) {
  const t = useTranslations('emailVerificationNotice');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!open) {
      setCountdown(60);
      return;
    }

    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdown]);

  const handleResend = () => {
    onResendEmail();
    setCountdown(60);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="rounded-2xl w-[370px] max-w-[calc(100vw-32px)] p-0"
      >
        {/* Header */}
        <Flex
          justify="center"
          align="center"
          className="relative p-4 border-b border-[#E5E6EC]"
        >
          {/* Back Button */}
          {onBackClick && (
            <IconButton
              size="2"
              variant="ghost"
              onClick={onBackClick}
              className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-gray-100"
            >
              <ChevronLeftIcon width="18" height="18" />
            </IconButton>
          )}

          {/* Title - centered */}
          <Dialog.Title className="text-base font-medium uppercase m-0">
            {t('title')}
          </Dialog.Title>

          {/* Close Button */}
          <Dialog.Close>
            <IconButton
              size="2"
              variant="ghost"
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-gray-100"
            >
              <Cross2Icon width="16" height="16" />
            </IconButton>
          </Dialog.Close>
        </Flex>

        {/* Content */}
        <Flex direction="column" gap="4" className="px-4 pb-8 pt-4">
          {/* Description */}
          <Text size="3" className="text-center text-black">
            {t('description', { email })}
          </Text>

          {/* Resend Button */}
          <PrimaryButton
            disabled={countdown > 0}
            onClick={handleResend}
          >
            {countdown > 0
              ? t('resendButton', { seconds: countdown })
              : t('resendButtonReady')}
          </PrimaryButton>

          {/* Back to Sign In */}
          <Button
            variant="ghost"
            size="3"
            onClick={onBackToSignIn}
            className="w-full text-black underline cursor-pointer hover:bg-transparent"
          >
            {t('backToSignIn')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
