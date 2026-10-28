'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { ImageIcon, TrashIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import includes from 'lodash/includes';
import map from 'lodash/map';
import upperFirst from 'lodash/upperFirst';
import type { ExchangeReason, ReturnReason } from '@/types/returnRequest';
import { FormData, TouchedFields, VIETNAM_BANKS, EXCHANGE_REASONS, RETURN_REASONS } from './types';

interface ReasonFieldsProps {
  formData: FormData;
  touched: TouchedFields;
  onExchangeReasonChange: (_reason: ExchangeReason, _checked: boolean) => void;
  onReturnReasonChange: (_reason: ReturnReason, _checked: boolean) => void;
  showExchangeReasonError: boolean;
  showReturnReasonError: boolean;
}

export function ReasonFields({
  formData,
  touched: _touched,
  onExchangeReasonChange,
  onReturnReasonChange,
  showExchangeReasonError,
  showReturnReasonError,
}: ReasonFieldsProps) {
  const t = useTranslations('returnPolicy.dialog');

  if (formData.requestType === 'exchange') {
    return (
      <Box>
        <Text weight="medium" className="text-black block mb-2">
          {t('exchangeReasonsTitle')}
        </Text>
        <Flex direction="column" gap="2">
          {map(EXCHANGE_REASONS, (reason) => (
            <Text as="label" key={reason} size="2">
              <Flex gap="2" align="center" className="cursor-pointer">
                <Checkbox
                  checked={includes(formData.exchangeReasons, reason)}
                  onCheckedChange={(checked) => onExchangeReasonChange(reason, checked === true)}
                />
                <Text className="text-black">{t(`exchangeReason${upperFirst(reason)}`)}</Text>
              </Flex>
            </Text>
          ))}
        </Flex>
        {showExchangeReasonError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.reasonRequired')}
          </Text>
        )}
      </Box>
    );
  }

  if (formData.requestType === 'return') {
    return (
      <Box>
        <Text weight="medium" className="text-black block mb-2">
          {t('returnReasonsTitle')}
        </Text>
        <Flex direction="column" gap="2">
          {map(RETURN_REASONS, (reason) => (
            <Text as="label" key={reason} size="2">
              <Flex gap="2" align="center" className="cursor-pointer">
                <Checkbox
                  checked={includes(formData.returnReasons, reason)}
                  onCheckedChange={(checked) => onReturnReasonChange(reason, checked === true)}
                />
                <Text className="text-black">{t(`returnReason${upperFirst(reason)}`)}</Text>
              </Flex>
            </Text>
          ))}
        </Flex>
        {showReturnReasonError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.reasonRequired')}
          </Text>
        )}
      </Box>
    );
  }

  return null;
}

interface OtherReasonFieldProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setTouched: React.Dispatch<React.SetStateAction<TouchedFields>>;
  showError: boolean;
}

export function OtherReasonField({
  formData,
  setFormData,
  setTouched,
  showError,
}: OtherReasonFieldProps) {
  const t = useTranslations('returnPolicy.dialog');

  const shouldShow =
    (formData.requestType === 'exchange' && includes(formData.exchangeReasons, 'other')) ||
    (formData.requestType === 'return' && includes(formData.returnReasons, 'other'));

  if (!shouldShow) return null;

  return (
    <Box>
      <Text weight="medium" className="text-black block mb-2">
        {t('otherReasonLabel')}
      </Text>
      <TextArea
        value={formData.otherReason}
        onChange={(e) => setFormData((prev) => ({ ...prev, otherReason: e.target.value }))}
        onBlur={() => setTouched((prev) => ({ ...prev, otherReason: true }))}
        placeholder={t('otherReasonPlaceholder')}
        maxLength={256}
        className="w-full"
      />
      {showError && (
        <Text size="1" className="text-red-500 mt-1">
          {t('errors.otherReasonRequired')}
        </Text>
      )}
    </Box>
  );
}

interface ProductExchangeFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setTouched: React.Dispatch<React.SetStateAction<TouchedFields>>;
  showProductToExchangeError: boolean;
  showProductWantedError: boolean;
}

export function ProductExchangeFields({
  formData,
  setFormData,
  setTouched,
  showProductToExchangeError,
  showProductWantedError,
}: ProductExchangeFieldsProps) {
  const t = useTranslations('returnPolicy.dialog');

  const shouldShow =
    formData.requestType === 'exchange' && includes(formData.exchangeReasons, 'size');

  if (!shouldShow) return null;

  return (
    <>
      <Box>
        <Text weight="medium" className="text-black block mb-2">
          {t('productToExchange')}
        </Text>
        <Text size="2" className="text-gray-600 block mb-2">
          {t('productToExchangeLabel')}
        </Text>
        <TextField.Root
          value={formData.productToExchange}
          onChange={(e) => setFormData((prev) => ({ ...prev, productToExchange: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, productToExchange: true }))}
          placeholder={t('productToExchangePlaceholder')}
          className="w-full"
        />
        {showProductToExchangeError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.productToExchangeRequired')}
          </Text>
        )}
      </Box>
      <Box>
        <Text weight="medium" className="text-black block mb-2">
          {t('productWantedLabel')}
        </Text>
        <TextField.Root
          value={formData.productWanted}
          onChange={(e) => setFormData((prev) => ({ ...prev, productWanted: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, productWanted: true }))}
          placeholder={t('productWantedPlaceholder')}
          className="w-full"
        />
        {showProductWantedError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.productWantedRequired')}
          </Text>
        )}
      </Box>
    </>
  );
}

interface BankInfoFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setTouched: React.Dispatch<React.SetStateAction<TouchedFields>>;
  showBankNameError: boolean;
  showAccountNumberError: boolean;
  showAccountHolderError: boolean;
}

export function BankInfoFields({
  formData,
  setFormData,
  setTouched,
  showBankNameError,
  showAccountNumberError,
  showAccountHolderError,
}: BankInfoFieldsProps) {
  const t = useTranslations('returnPolicy.dialog');

  if (formData.requestType !== 'return') return null;

  return (
    <>
      <Box>
        <Text weight="medium" className="text-black block mb-2">
          {t('bankInfoTitle')}
        </Text>
      </Box>
      <Box>
        <Text size="2" className="text-gray-600 block mb-2">
          {t('bankName')}
        </Text>
        <Select.Root
          value={formData.bankName}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, bankName: value }));
            setTouched((prev) => ({ ...prev, bankName: true }));
          }}
        >
          <Select.Trigger placeholder={t('bankNamePlaceholder')} className="w-full" />
          <Select.Content position="popper">
            {map(VIETNAM_BANKS, (bank) => (
              <Select.Item key={bank} value={bank}>
                {bank}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {showBankNameError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.bankNameRequired')}
          </Text>
        )}
      </Box>
      <Box>
        <Text size="2" className="text-gray-600 block mb-2">
          {t('accountNumber')}
        </Text>
        <TextField.Root
          value={formData.accountNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setFormData((prev) => ({ ...prev, accountNumber: value }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, accountNumber: true }))}
          placeholder={t('accountNumberPlaceholder')}
          className="w-full"
        />
        {showAccountNumberError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.accountNumberRequired')}
          </Text>
        )}
      </Box>
      <Box>
        <Text size="2" className="text-gray-600 block mb-2">
          {t('accountHolder')}
        </Text>
        <TextField.Root
          value={formData.accountHolder}
          onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, accountHolder: true }))}
          placeholder={t('accountHolderPlaceholder')}
          maxLength={256}
          className="w-full"
        />
        {showAccountHolderError && (
          <Text size="1" className="text-red-500 mt-1">
            {t('errors.accountHolderRequired')}
          </Text>
        )}
      </Box>
    </>
  );
}

interface ImageUploadFieldProps {
  formData: FormData;
  previewUrls: string[];
  isUploading: boolean;
  onFileChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (_index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showError: boolean;
}

export function ImageUploadField({
  formData,
  previewUrls,
  isUploading,
  onFileChange,
  onRemoveImage,
  fileInputRef,
  showError,
}: ImageUploadFieldProps) {
  const t = useTranslations('returnPolicy.dialog');

  if (!formData.requestType) return null;

  return (
    <Box>
      <Text weight="medium" className="text-black block mb-2">
        {t('productImages')}
      </Text>
      <Flex gap="2" wrap="wrap">
        {map(previewUrls, (url, index) => (
          <Box key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            <IconButton
              size="1"
              variant="solid"
              color="red"
              className="absolute top-1 right-1 cursor-pointer"
              onClick={() => onRemoveImage(index)}
            >
              <TrashIcon width="12" height="12" />
            </IconButton>
          </Box>
        ))}
        {formData.images.length < 4 && (
          <Box
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Box className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon width="24" height="24" className="text-gray-400" />
            )}
          </Box>
        )}
      </Flex>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="2"
        className="mt-2 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        disabled={formData.images.length >= 4 || isUploading}
      >
        {t('uploadButton')}
      </Button>
      {showError && (
        <Text size="1" className="text-red-500 mt-1 block">
          {t('errors.imagesRequired')}
        </Text>
      )}
    </Box>
  );
}
