'use client';

import {
  Box,
  Button,
  Dialog,
  Flex,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { OutlineButton } from '@/components/common/OutlineButton';
import { GradientButton } from '@/components/common/GradientButton';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutDialogProps) {
  const t = useTranslations('account');
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="w-[calc(100vw-32px)] sm:w-[338px] max-w-[338px] !p-4 !rounded-lg overflow-hidden"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('logoutDialogTitle')}</Dialog.Title>
          <Dialog.Description>{t('logoutDialogMessage')}</Dialog.Description>
        </VisuallyHidden>

        <Flex direction="column" gap="4">
          {/* Header: Title centered + Close button right */}
          <Flex align="center" gap="2">
            <Box className="w-6 shrink-0" />
            <Text className="flex-1 text-center font-semibold text-base leading-6">
              {t('logoutShort')}
            </Text>
            <Dialog.Close>
              <Button
                variant="ghost"
                className="cursor-pointer w-6 h-6 p-0 flex items-center justify-center shrink-0"
              >
                <Cross2Icon width="24" height="24" className="text-black" />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* Message */}
          <Text className="text-sm text-center text-black leading-6">
            {t('logoutDialogMessage')}
          </Text>

          {/* Buttons */}
          <Flex gap="2" className="px-4">
            <OutlineButton onClick={() => onOpenChange(false)} className="flex-1">
              {t('logoutCancel')}
            </OutlineButton>
            <GradientButton onClick={handleConfirm} className="flex-1">
              {t('logoutConfirm')}
            </GradientButton>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
