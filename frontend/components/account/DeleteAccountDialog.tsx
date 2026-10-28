'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Text,
  TextField,
  VisuallyHidden,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { OutlineButton } from '@/components/common/OutlineButton';
import { GradientButton } from '@/components/common/GradientButton';
import { authRepository } from '@/lib/repositories/auth.repository';
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
import { getUserFullName } from '@/lib/helpers/userHelper';
import { logoutRequest } from '@/lib/store/slices/authSlice';
import type { RootState } from '@/lib/store';
import { AppLocale } from '@/lib/locale';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  locale: AppLocale;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  locale,
}: DeleteAccountDialogProps) {
  const t = useTranslations('accountDeletion.deleteDialog');
  const tCommon = useTranslations('common');
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.account.user);
  const userName = getUserFullName(user);

  const [inputName, setInputName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isNameMatch = inputName.trim() === userName.trim();

  const handleConfirm = async () => {
    if (!isNameMatch) return;

    setIsLoading(true);
    try {
      await authRepository.deleteMyAccount();
      showSuccessToast(t('success'));
      onOpenChange(false);
      dispatch(logoutRequest());
      router.push(`/${locale}`);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInputName('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="w-[calc(100vw-32px)] sm:w-[400px] max-w-[500px] !p-4 !rounded-lg overflow-hidden"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('title')}</Dialog.Title>
        </VisuallyHidden>
        <Dialog.Description className="sr-only">
          {t('description')}
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Header: Title centered + Close button right */}
          <Flex align="center" gap="2">
            <Box className="w-6 shrink-0" />
            <Text className="flex-1 text-center font-semibold text-base leading-6 text-[#CC0000]">
              {t('title')}
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

          {/* Warning message */}
          <Box className="p-4 bg-[#FFF5F5] border border-[#FFCCCC] rounded-lg">
            <Text className="text-sm text-[#CC0000] leading-5 text-center">
              {t('description')}
            </Text>
          </Box>

          {/* Confirm instruction */}
          <Flex direction="column" gap="2">
            <Text className="text-sm text-black leading-5">
              {t('confirmInstruction')}
            </Text>
            <Text className="text-sm font-semibold text-black leading-5">
              {userName}
            </Text>
          </Flex>

          {/* Name input */}
          <TextField.Root
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="w-full text-sm h-10 rounded-lg border border-[#F0F0F0] px-2"
          />

          {/* Error message when name doesn't match */}
          {inputName.length > 0 && !isNameMatch && (
            <Text className="text-xs text-[#FF3B30]">{t('nameNotMatch')}</Text>
          )}

          {/* Buttons */}
          <Flex gap="2" className="pt-2">
            <OutlineButton
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              {tCommon('buttons.cancel')}
            </OutlineButton>
            <GradientButton
              onClick={handleConfirm}
              className="flex-1 !bg-[#CC0000] hover:!bg-[#AA0000]"
              disabled={!isNameMatch || isLoading}
              isLoading={isLoading}
              loadingText={t('deleting')}
            >
              {tCommon('buttons.confirm')}
            </GradientButton>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
