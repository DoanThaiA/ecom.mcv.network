'use client';

import { Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import Image from 'next/image';

interface RegistrationFailedDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onRegister: () => void;
}

export function RegistrationFailedDialog({
  open,
  onOpenChange,
  onRegister,
}: RegistrationFailedDialogProps) {
  const t = useTranslations('verifySignup');

  const handleRegister = () => {
    onOpenChange(false);
    onRegister();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="rounded-[1.5rem] w-[calc(100vw-32px)] sm:w-[338px] max-w-[338px] p-8 pb-14"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('errorTitle')}</Dialog.Title>
          <Dialog.Description>{t('errorTitle')}</Dialog.Description>
        </VisuallyHidden>

        <Flex direction="column" align="center" gap="4">
          {/* Failed Illustration */}
          <Image
            src="/assets/svg/auth/registration-failed.svg"
            alt="Registration Failed"
            width={250}
            height={200}
            className="w-[250px] h-[200px]"
            priority
          />

          {/* Text Content */}
          <Text className="text-black text-sm leading-6 text-center">
            {t('errorTitle')} {t('errorMessage')}
          </Text>

          {/* Register Button */}
          <PrimaryButton onClick={handleRegister} className="mt-2">
            {t('registerAgain')}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
