'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  VisuallyHidden,
} from '@radix-ui/themes';
import { Cross2Icon, CameraIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { uploadFileRequest, selectUploadLoading } from '@/lib/store/slices/fileSlice';
import type { File as FileType } from '@/types/gen/shared/shared/files/file';
import { LabeledTextField } from '@/components/common/LabeledTextField';

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface EditAccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: FileType;
}

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  userData: EditAccountFormData;
  onSave: (_data: EditAccountFormData) => void;
  isLoading?: boolean;
}

export function EditAccountDialog({
  open,
  onOpenChange,
  userData,
  onSave,
  isLoading = false,
}: EditAccountDialogProps) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = useSelector(selectUploadLoading);

  const [formData, setFormData] = useState(userData);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sync formData when userData changes (e.g., when dialog opens with new data)
  useEffect(() => {
    setFormData(userData);
    // Combine firstName + lastName for display
    const combinedName = [userData.firstName, userData.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    setFullName(combinedName);
    setPreviewUrl(null);
    setErrors({});
    setTouched({});
  }, [userData]);

  // Validation functions
  const validateFullName = (value: string): string | undefined => {
    if (!value.trim()) return tCommon('errors.fullNameRequired');
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return undefined; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return tCommon('errors.emailInvalid');
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) return undefined; // Optional
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(value)) return tCommon('errors.phoneInvalid');
    return undefined;
  };

  const handleFieldChange = (
    field: keyof ValidationErrors,
    value: string,
    setter: (_value: string) => void
  ) => {
    setter(value);
    if (touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: false }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ValidationErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    };

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, phone: true });

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== undefined
    );
    if (hasErrors) return;

    onSave({
      ...formData,
      firstName: fullName,
      lastName: '',
    });
    onOpenChange(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    dispatch(
      uploadFileRequest({
        file,
        onSuccess: (uploadedFile: FileType) => {
          setFormData((prev) => ({ ...prev, photo: uploadedFile }));
        },
        onError: () => {
          setPreviewUrl(null);
        },
      })
    );

    // Reset input
    e.target.value = '';
  };

  // Get avatar display URL
  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (formData.photo?.path) return formData.photo.path;
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        style={{
          maxWidth: '600px',
          padding: 0,
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <VisuallyHidden>
          <Dialog.Title>{t('editDialogTitle')}</Dialog.Title>
          <Dialog.Description>{t('editDialogTitle')}</Dialog.Description>
        </VisuallyHidden>

        {/* Header */}
        <Box
          className="bg-white border-b border-gray-200 px-6 py-4"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Heading size="5" className="text-lg font-bold">
            {t('editDialogTitle')}
          </Heading>
          <Dialog.Close>
            <Button
              variant="ghost"
              className="cursor-pointer"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cross2Icon width="20" height="20" />
            </Button>
          </Dialog.Close>
        </Box>

        {/* Form Content */}
        <Box className="bg-white px-6 py-6">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="5">
              {/* Avatar Upload */}
              <Flex direction="column" align="center" gap="3">
                <Box
                  className="relative cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  <Box
                    className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200"
                    style={{ position: 'relative' }}
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <Box className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-3xl text-gray-400">
                          {formData.firstName?.charAt(0)?.toUpperCase() ||
                            formData.lastName?.charAt(0)?.toUpperCase() ||
                            '?'}
                        </span>
                      </Box>
                    )}
                    {/* Overlay */}
                    <Box
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderRadius: '50%' }}
                    >
                      <CameraIcon width="24" height="24" className="text-white" />
                    </Box>
                    {/* Loading overlay */}
                    {isUploading && (
                      <Box
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                        style={{ borderRadius: '50%' }}
                      >
                        <Box className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </Box>
                    )}
                  </Box>
                </Box>
                <span className="text-sm text-gray-500">
                  {t('changeAvatar')}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Flex>

              {/* Full Name */}
              <LabeledTextField
                label={tCommon('form.fullName')}
                value={fullName}
                onChange={(e) =>
                  handleFieldChange('fullName', e.target.value, setFullName)
                }
                disabled={isLoading}
                error={touched.fullName ? errors.fullName : undefined}
              />

              {/* Email */}
              <LabeledTextField
                label={tCommon('form.email')}
                value={formData.email}
                onChange={(e) =>
                  handleFieldChange('email', e.target.value, (val) =>
                    setFormData((prev) => ({ ...prev, email: val }))
                  )
                }
                disabled={isLoading}
                error={touched.email ? errors.email : undefined}
              />

              {/* Phone Number */}
              <LabeledTextField
                label={tCommon('form.phone')}
                value={formData.phone}
                onChange={(e) =>
                  handleFieldChange('phone', e.target.value, (val) =>
                    setFormData((prev) => ({ ...prev, phone: val }))
                  )
                }
                disabled={isLoading}
                error={touched.phone ? errors.phone : undefined}
              />

              {/* Submit Button */}
              <Box className="mt-2">
                <Button
                  type="submit"
                  size="3"
                  disabled={isLoading || isUploading}
                  className="w-full bg-black text-white hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    height: '44px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? tCommon('status.updating') : t('updateButton')}
                </Button>
              </Box>
            </Flex>
          </form>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}
