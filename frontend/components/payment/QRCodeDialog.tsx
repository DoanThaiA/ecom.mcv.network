'use client';

import { ChevronLeftIcon, Cross2Icon } from '@radix-ui/react-icons';
import {
  Box,
  Dialog,
  Flex,
  IconButton,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';

interface QRCodeDialogProps {
  /** Control dialog open state */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (_open: boolean) => void;
  /** URL of existing QR image to display */
  qrUrl?: string;
  /** Data string to generate QR code from */
  qrData?: string;
  /** Custom title for the dialog */
  title?: string;
  /** Callback when back button is clicked */
  onBack?: () => void;
}

/**
 * QRCodeDialog - Full screen dialog for displaying payment QR code
 * Supports both qrUrl (image) and qrData (generated QR)
 */
export function QRCodeDialog({
  open,
  onOpenChange,
  qrUrl,
  qrData,
  title,
  onBack,
}: QRCodeDialogProps) {
  const t = useTranslations('qrDialog');

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  // Determine QR content to display
  const qrContent = qrData || qrUrl;
  const useImage = qrUrl && !qrData;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="!p-0 w-[calc(100vw-2rem)] h-[calc(100vh-4rem)] max-w-lg !rounded-2xl overflow-hidden"
      >
        <VisuallyHidden>
          <Dialog.Title>{title || t('title')}</Dialog.Title>
          <Dialog.Description>{t('scanInstruction')}</Dialog.Description>
        </VisuallyHidden>

        <Flex direction="column" className="h-full">
          {/* Header */}
          <Flex
            align="center"
            justify="between"
            className="px-4 py-3 border-b border-gray-100 bg-white"
          >
            {/* Back Button */}
            <IconButton
              size="2"
              variant="ghost"
              onClick={handleBack}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <ChevronLeftIcon width="20" height="20" />
            </IconButton>

            {/* Title */}
            <Text weight="medium" className="text-base text-black">
              {title || t('title')}
            </Text>

            {/* Close Button */}
            <IconButton
              size="2"
              variant="ghost"
              onClick={handleClose}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Cross2Icon width="20" height="20" color="#000000" />
            </IconButton>
          </Flex>

          {/* Body - QR Code */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            className="flex-1 bg-gradient-to-b from-gray-50 to-white p-6"
          >
            {/* QR Container */}
            <Box className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              {qrContent ? (
                <Box className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
                  {useImage ? (
                    <Image
                      src={qrUrl!}
                      alt="QR Code"
                      width={320}
                      height={320}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={qrData!}
                      size={280}
                      level="H"
                      includeMargin={false}
                      className="w-full h-full"
                    />
                  )}
                </Box>
              ) : (
                <Box className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <Text size="2" className="text-gray-400">
                    {t('noQrData')}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Scan Instruction */}
            <Text
              size="2"
              className="text-gray-500 mt-6 text-center max-w-[280px]"
            >
              {t('scanInstruction')}
            </Text>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
