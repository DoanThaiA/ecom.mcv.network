'use client';

import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  MobileIcon,
} from '@radix-ui/react-icons';
import { Box, Card, Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export type OtpSource = 'zns' | 'sms';

type SelectSource = (_: OtpSource) => void;

interface OtpSourceDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  phoneNumber: string;
  onSelectSource?: SelectSource;
  onBack?: () => void;
  resetLoading?: boolean;
}

export function OtpSourceDialog({
  open,
  onOpenChange,
  phoneNumber,
  onSelectSource,
  onBack,
  resetLoading,
}: OtpSourceDialogProps) {
  const t = useTranslations('otpSource');
  const [loadingSource, setLoadingSource] = useState<OtpSource | null>(null);

  // Reset loading state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoadingSource(null);
    }
  }, [open]);

  // Reset loading state when API error occurs
  useEffect(() => {
    if (resetLoading) {
      setLoadingSource(null);
    }
  }, [resetLoading]);

  const maskPhone = (phone: string) => {
    if (phone.length <= 6) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  };

  const handleSelectSource = (source: OtpSource) => {
    if (loadingSource) return; // Prevent multiple clicks
    setLoadingSource(source);
    if (onSelectSource) {
      onSelectSource(source);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="max-w-[370px] !p-0 shadow-[0px_12px_40px_rgba(0,0,0,0.16)]"
      >
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_24px] items-center gap-4 px-4 py-4 border-b border-[#E5E6EC]">
          {/* Back Button */}
          {onBack ? (
            <ChevronLeftIcon
              width="24"
              height="24"
              color="black"
              onClick={onBack}
              className="cursor-pointer"
            />
          ) : (
            <div className="w-6 h-6" />
          )}
          {/* Title */}
          <Text className="text-center text-base font-medium uppercase m-0 leading-6 text-black">
            {t('title')}
          </Text>
          <VisuallyHidden>
            <Dialog.Title>{t('title')}</Dialog.Title>
            <Dialog.Description>{t('title')}</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close>
            <Cross2Icon
              width="24"
              height="24"
              color="black"
              className="cursor-pointer"
            />
          </Dialog.Close>
        </div>

        <Flex direction="column" gap="4" className="px-4 pt-4 pb-8">
          {/* SMS Option */}
          {phoneNumber && (
            <Card
              onClick={() => handleSelectSource('sms')}
              className={`p-2 cursor-pointer border border-[#C4C4C4] rounded-xl hover:border-gray-400 transition-colors ${loadingSource ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Flex align="center" gap="2">
                <MobileIcon width="32" height="32" className="text-black" />
                <Flex direction="column" className="flex-1">
                  <Text className="text-base font-medium leading-6 text-black">
                    {t('phoneOption')}
                  </Text>
                  <Text className="text-sm font-normal leading-6 text-black">
                    {t('sendToPhone', { phone: maskPhone(phoneNumber) })}
                  </Text>
                </Flex>
                {loadingSource === 'sms' ? (
                  <Box className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronRightIcon
                    width="24"
                    height="24"
                    className="text-gray-600"
                  />
                )}
              </Flex>
            </Card>
          )}

          {/* Zalo Option */}
          {phoneNumber && (
            <Card
              onClick={() => handleSelectSource('zns')}
              className={`p-2 cursor-pointer border border-[#C4C4C4] rounded-xl hover:border-gray-400 transition-colors ${loadingSource ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Flex align="center" gap="2">
                <Image
                  src="/assets/svg/social/zalo.svg"
                  alt="Zalo"
                  width={32}
                  height={32}
                />
                <Flex direction="column" className="flex-1">
                  <Text className="text-base font-medium leading-6 text-black">
                    {t('zaloOption')}
                  </Text>
                  <Text className="text-sm font-normal leading-6 text-black">
                    {t('sendToPhone', { phone: maskPhone(phoneNumber) })}
                  </Text>
                </Flex>
                {loadingSource === 'zns' ? (
                  <Box className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronRightIcon
                    width="24"
                    height="24"
                    className="text-gray-600"
                  />
                )}
              </Flex>
            </Card>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
