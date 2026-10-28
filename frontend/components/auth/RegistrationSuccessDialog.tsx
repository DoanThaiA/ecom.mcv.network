'use client';

import { Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import Image from 'next/image';

interface RegistrationSuccessDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onGoHome: () => void;
}

export function RegistrationSuccessDialog({
  open,
  onOpenChange,
  onGoHome,
}: RegistrationSuccessDialogProps) {
  const t = useTranslations('verifySignup');
  const tCommon = useTranslations('common');

  const handleGoHome = () => {
    onOpenChange(false);
    onGoHome();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="rounded-[1.5rem] w-[calc(100vw-32px)] sm:w-[338px] max-w-[338px] p-8 pb-14"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('successTitle')}</Dialog.Title>
          <Dialog.Description>{t('successTitle')}</Dialog.Description>
        </VisuallyHidden>

        <Flex direction="column" align="center" gap="4">
          {/* Success Illustration */}
          <Image
            src="/assets/svg/auth/registration-success.svg"
            alt="Registration Success"
            width={250}
            height={200}
            className="w-[250px] h-[200px]"
            priority
          />

          {/* Text Content */}
          <Flex direction="column" align="center" gap="2" className="text-center">
            <Text
              weight="bold"
              className="text-[#4a4a4a] text-base"
            >
              {t('successTitle')}
            </Text>
            <Text className="text-black text-sm leading-6">
              {t('successMessage')}
            </Text>
          </Flex>

          {/* Go Home Button */}
          <PrimaryButton onClick={handleGoHome} className="mt-2">
            {tCommon('buttons.backToHome').toUpperCase()}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
