'use client';

import { useRef } from 'react';
import { Box, Checkbox, Flex, Text, TextField, Select } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';
import { uploadFileRequest, selectUploadLoading } from '@/lib/store/slices/fileSlice';
import type { File as FileType } from '@/types/gen/shared/shared/files/file';
import type { ReturnRequestType, ExchangeReason, ReturnReason } from '@/types/returnRequest';
import { FormData, TouchedFields } from './types';
import {
  ReasonFields,
  OtherReasonField,
  ProductExchangeFields,
  BankInfoFields,
  ImageUploadField,
} from './FormFields';

interface ReturnRequestFormProps {
  policyAgreed: boolean;
  setPolicyAgreed: (_value: boolean) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  touched: TouchedFields;
  setTouched: React.Dispatch<React.SetStateAction<TouchedFields>>;
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ReturnRequestForm({
  policyAgreed,
  setPolicyAgreed,
  formData,
  setFormData,
  touched,
  setTouched,
  previewUrls,
  setPreviewUrls,
}: ReturnRequestFormProps) {
  const t = useTranslations('returnPolicy.dialog');
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = useSelector(selectUploadLoading);

  const handleExchangeReasonChange = (reason: ExchangeReason, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      exchangeReasons: checked
        ? [...prev.exchangeReasons, reason]
        : filter(prev.exchangeReasons, (r) => r !== reason),
    }));
    setTouched((prev) => ({ ...prev, exchangeReasons: true }));
  };

  const handleReturnReasonChange = (reason: ReturnReason, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      returnReasons: checked
        ? [...prev.returnReasons, reason]
        : filter(prev.returnReasons, (r) => r !== reason),
    }));
    setTouched((prev) => ({ ...prev, returnReasons: true }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - formData.images.length;
    const filesToUpload = take(Array.from(files), remainingSlots);

    forEach(filesToUpload, (file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      if (file.size > 10 * 1024 * 1024) return;

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, objectUrl]);

      dispatch(
        uploadFileRequest({
          file,
          onSuccess: (uploadedFile: FileType) => {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, uploadedFile],
            }));
          },
          onError: () => {
            setPreviewUrls((prev) => filter(prev, (url) => url !== objectUrl));
          },
        })
      );
    });

    setTouched((prev) => ({ ...prev, images: true }));
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: filter(prev.images, (_, i) => i !== index),
    }));
    setPreviewUrls((prev) => filter(prev, (_, i) => i !== index));
  };

  // Validation error states
  const showExchangeReasonError =
    touched.exchangeReasons &&
    formData.requestType === 'exchange' &&
    isEmpty(formData.exchangeReasons);

  const showReturnReasonError =
    touched.returnReasons &&
    formData.requestType === 'return' &&
    isEmpty(formData.returnReasons);

  const showOtherReasonError =
    touched.otherReason &&
    ((formData.requestType === 'exchange' && includes(formData.exchangeReasons, 'other')) ||
      (formData.requestType === 'return' && includes(formData.returnReasons, 'other'))) &&
    !formData.otherReason.trim();

  const showProductToExchangeError =
    touched.productToExchange &&
    formData.requestType === 'exchange' &&
    includes(formData.exchangeReasons, 'size') &&
    !formData.productToExchange.trim();

  const showProductWantedError =
    touched.productWanted &&
    formData.requestType === 'exchange' &&
    includes(formData.exchangeReasons, 'size') &&
    !formData.productWanted.trim();

  const showBankNameError =
    touched.bankName && formData.requestType === 'return' && !formData.bankName;

  const showAccountNumberError =
    touched.accountNumber &&
    formData.requestType === 'return' &&
    !formData.accountNumber.trim();

  const showAccountHolderError =
    touched.accountHolder &&
    formData.requestType === 'return' &&
    !formData.accountHolder.trim();

  const showOrderIdError = touched.orderId && !formData.orderId.trim();
  const showImagesError = touched.images && isEmpty(formData.images);

  return (
    <Box className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
      {/* Policy Notes */}
      {!policyAgreed && (
        <Box className="mb-6">
          <Text weight="bold" className="text-black block mb-3">
            {t('notesTitle')}
          </Text>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
            <li>{t('note1')}</li>
            <li>{t('note2')}</li>
            <li>{t('note3')}</li>
            <li>{t('note4')}</li>
          </ul>
          <Text className="text-sm text-gray-600 mt-3 block">
            {t('viewPolicy')}{' '}
            <Link href="/vi/policy/return" className="text-blue-600 underline">
              {t('viewPolicyLink')}
            </Link>
          </Text>
        </Box>
      )}

      {/* Policy Agreement Checkbox */}
      <Box className="mb-6">
        <Text as="label" size="2">
          <Flex gap="2" align="center" className="cursor-pointer">
            <Checkbox
              checked={policyAgreed}
              onCheckedChange={(checked) => setPolicyAgreed(checked === true)}
            />
            <Text className="text-black font-medium">{t('agreeCheckbox')}</Text>
          </Flex>
        </Text>
      </Box>

      {/* Form Fields - Only show after policy agreed */}
      {policyAgreed && (
        <Flex direction="column" gap="5">
          {/* Support Type */}
          <Box>
            <Text weight="medium" className="text-black block mb-2">
              {t('supportType')}
            </Text>
            <Select.Root
              value={formData.requestType || ''}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  requestType: value as ReturnRequestType,
                  exchangeReasons: [],
                  returnReasons: [],
                  otherReason: '',
                }));
                setTouched((prev) => ({ ...prev, requestType: true }));
              }}
            >
              <Select.Trigger placeholder={t('selectPlaceholder')} className="w-full" />
              <Select.Content position="popper">
                <Select.Item value="exchange">{t('exchange')}</Select.Item>
                <Select.Item value="return">{t('return')}</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Reason Fields */}
          <ReasonFields
            formData={formData}
            touched={touched}
            onExchangeReasonChange={handleExchangeReasonChange}
            onReturnReasonChange={handleReturnReasonChange}
            showExchangeReasonError={showExchangeReasonError}
            showReturnReasonError={showReturnReasonError}
          />

          {/* Other Reason Field */}
          <OtherReasonField
            formData={formData}
            setFormData={setFormData}
            setTouched={setTouched}
            showError={showOtherReasonError}
          />

          {/* Product Exchange Fields */}
          <ProductExchangeFields
            formData={formData}
            setFormData={setFormData}
            setTouched={setTouched}
            showProductToExchangeError={showProductToExchangeError}
            showProductWantedError={showProductWantedError}
          />

          {/* Bank Info Fields */}
          <BankInfoFields
            formData={formData}
            setFormData={setFormData}
            setTouched={setTouched}
            showBankNameError={showBankNameError}
            showAccountNumberError={showAccountNumberError}
            showAccountHolderError={showAccountHolderError}
          />

          {/* Order ID */}
          {formData.requestType && (
            <Box>
              <Text weight="medium" className="text-black block mb-2">
                {t('orderId')}
              </Text>
              <TextField.Root
                value={formData.orderId}
                onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
                onBlur={() => setTouched((prev) => ({ ...prev, orderId: true }))}
                placeholder={t('orderIdPlaceholder')}
                className="w-full"
              />
              {showOrderIdError && (
                <Text size="1" className="text-red-500 mt-1">
                  {t('errors.orderIdRequired')}
                </Text>
              )}
            </Box>
          )}

          {/* Product Images */}
          <ImageUploadField
            formData={formData}
            previewUrls={previewUrls}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
            fileInputRef={fileInputRef}
            showError={showImagesError}
          />
        </Flex>
      )}
    </Box>
  );
}
