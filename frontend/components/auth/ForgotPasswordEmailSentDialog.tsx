'use client';

import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { PrimaryButton } from '@/components/common/PrimaryButton';

interface ForgotPasswordEmailSentDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onBackToSignIn: () => void;
}

export function ForgotPasswordEmailSentDialog({
  open,
  onOpenChange,
  onBackToSignIn,
}: ForgotPasswordEmailSentDialogProps) {
  const t = useTranslations('forgotPasswordEmailSent');

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
            {t('description')}
          </Text>

          {/* Back to Sign In Button */}
          <PrimaryButton onClick={onBackToSignIn}>
            {t('backToSignIn')}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
