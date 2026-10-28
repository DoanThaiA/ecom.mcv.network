'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';
import {
  submitReturnRequestAction,
  selectReturnRequestLoading,
  resetState,
} from '@/lib/store/slices/returnRequestSlice';
import { selectUploadLoading } from '@/lib/store/slices/fileSlice';
import { ReturnRequestForm } from './ReturnRequestForm';
import {
  ReturnRequestDialogProps,
  FormData,
  TouchedFields,
  initialFormData,
  initialTouched,
} from './types';

export function ReturnRequestDialog({
  open,
  onOpenChange,
}: ReturnRequestDialogProps) {
  const t = useTranslations('returnPolicy.dialog');
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSubmitting = useSelector(selectReturnRequestLoading);
  const isUploading = useSelector(selectUploadLoading);

  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Reset form when dialog closes
  useEffect(() => {
    if (open) return;

    setPolicyAgreed(false);
    setFormData(initialFormData);
    setTouched(initialTouched);
    setPreviewUrls([]);
    dispatch(resetState());
  }, [open, dispatch]);

  const validateForm = (): boolean => {
    if (!formData.requestType) return false;
    if (!formData.orderId.trim()) return false;
    if (isEmpty(formData.images)) return false;

    if (formData.requestType === 'exchange') {
      if (isEmpty(formData.exchangeReasons)) return false;
      if (includes(formData.exchangeReasons, 'other') && !formData.otherReason.trim()) {
        return false;
      }
      if (includes(formData.exchangeReasons, 'size')) {
        if (!formData.productToExchange.trim() || !formData.productWanted.trim()) {
          return false;
        }
      }
    }

    if (formData.requestType === 'return') {
      if (isEmpty(formData.returnReasons)) return false;
      if (includes(formData.returnReasons, 'other') && !formData.otherReason.trim()) {
        return false;
      }
      if (!formData.bankName || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    setTouched({
      requestType: true,
      exchangeReasons: true,
      returnReasons: true,
      otherReason: true,
      productToExchange: true,
      productWanted: true,
      orderId: true,
      images: true,
      bankName: true,
      accountNumber: true,
      accountHolder: true,
    });

    if (!validateForm()) return;

    dispatch(
      submitReturnRequestAction({
        data: {
          requestType: formData.requestType!,
          exchangeReasons: formData.requestType === 'exchange' ? formData.exchangeReasons : undefined,
          returnReasons: formData.requestType === 'return' ? formData.returnReasons : undefined,
          otherReason: formData.otherReason || undefined,
          productToExchange: formData.productToExchange || undefined,
          productWanted: formData.productWanted || undefined,
          orderId: formData.orderId,
          images: formData.images,
          bankInfo:
            formData.requestType === 'return'
              ? {
                  bankName: formData.bankName,
                  accountNumber: formData.accountNumber,
                  accountHolder: formData.accountHolder,
                }
              : undefined,
        },
        onSuccess: () => {
          onOpenChange(false);
        },
      })
    );
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          onPointerDownOutside={preventDialogCloseOnToast}
          className="rounded-[14px] w-[calc(100vw-32px)] sm:w-[500px] max-w-[500px] p-6"
        >
          <VisuallyHidden>
            <Dialog.Title>{t('title')}</Dialog.Title>
          </VisuallyHidden>
          <Dialog.Close>
            <IconButton
              size="2"
              variant="ghost"
              className="hover:bg-gray-100"
              style={{ position: 'absolute', top: '12px', right: '12px', cursor: 'pointer' }}
            >
              <Cross2Icon width="16" height="16" />
            </IconButton>
          </Dialog.Close>
          <Flex direction="column" align="center" gap="4" py="6">
            <Text size="4" weight="bold" className="text-black text-center">
              {t('loginRequired')}
            </Text>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="rounded-[14px] w-[calc(100vw-32px)] sm:w-[600px] max-w-[600px] p-0 max-h-[90vh] overflow-hidden"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('title')}</Dialog.Title>
        </VisuallyHidden>

        {/* Header */}
        <Box className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <Text size="5" weight="bold" className="text-black">
            {t('title')}
          </Text>
          <Dialog.Close>
            <IconButton
              size="2"
              variant="ghost"
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Cross2Icon width="16" height="16" />
            </IconButton>
          </Dialog.Close>
        </Box>

        {/* Form Content */}
        <ReturnRequestForm
          policyAgreed={policyAgreed}
          setPolicyAgreed={setPolicyAgreed}
          formData={formData}
          setFormData={setFormData}
          touched={touched}
          setTouched={setTouched}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
        />

        {/* Footer */}
        <Box className="bg-white border-t border-gray-200 px-6 py-4">
          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="outline" size="3" className="cursor-pointer">
                {t('cancelButton')}
              </Button>
            </Dialog.Close>
            <Button
              size="3"
              className="bg-black text-white hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!policyAgreed || isSubmitting || isUploading}
              onClick={handleSubmit}
            >
              {isSubmitting ? t('submitting') : t('submitButton')}
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}
