'use client';

import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { Cross2Icon, EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { LabeledTextField } from '@/components/common/LabeledTextField';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export interface PhoneResetPasswordFormData {
  newPassword: string;
}

interface PhoneResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onSubmit: (_data: PhoneResetPasswordFormData) => void;
}

export function PhoneResetPasswordDialog({
  open,
  onOpenChange,
  onSubmit,
}: PhoneResetPasswordDialogProps) {
  const t = useTranslations('resetPassword');
  const tCommon = useTranslations('common');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    newPassword: boolean;
    confirmPassword: boolean;
  }>({
    newPassword: false,
    confirmPassword: false,
  });

  // Clear form data when dialog closes
  useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setTouched({
        newPassword: false,
        confirmPassword: false,
      });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  // Validate password format
  const validatePassword = (password: string): boolean => {
    // At least 8 characters, uppercase, lowercase, number, special character
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    );
  };

  const validateForm = (): boolean => {
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    // Validate new password
    if (touched.newPassword) {
      if (!newPassword.trim()) {
        newErrors.newPassword = tCommon('errors.passwordRequired');
      } else if (!validatePassword(newPassword)) {
        newErrors.newPassword = tCommon('errors.passwordInvalid');
      }
    }

    // Validate confirm password
    if (touched.confirmPassword) {
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = tCommon('errors.confirmPasswordRequired');
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = tCommon('errors.confirmPasswordMismatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = tCommon('errors.passwordRequired');
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = tCommon('errors.passwordInvalid');
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = tCommon('errors.confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = tCommon('errors.confirmPasswordMismatch');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Call parent's onSubmit callback
    onSubmit({
      newPassword,
    });

    // Reset form
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setTouched({
      newPassword: false,
      confirmPassword: false,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        style={{
          maxWidth: '512px',
          padding: '0',
          position: 'relative',
          borderRadius: '14px',
          boxShadow: '0px 12px 40px 0px rgba(0, 0, 0, 0.16)',
        }}
      >
        {/* Header */}
        <Flex
          direction="row"
          justify="between"
          align="center"
          style={{
            padding: '16px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E6EC',
            borderRadius: '14px 14px 0 0',
          }}
        >
          <div style={{ width: '24px', height: '24px' }} />
          <Dialog.Title
            style={{
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: '24px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {t('title')}
          </Dialog.Title>
          <Dialog.Close>
            <IconButton
              size="2"
              variant="ghost"
              style={{
                cursor: 'pointer',
              }}
            >
              <Cross2Icon width="18" height="18" />
            </IconButton>
          </Dialog.Close>
        </Flex>

        {/* Form Content */}
        <Flex
          direction="column"
          gap="4"
          className="px-9 py-6 bg-white rounded-b-[14px]"
        >
          {/* New Password Field */}
          <LabeledTextField
            label={tCommon('form.newPassword')}
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (touched.newPassword) {
                validateForm();
              }
            }}
            error={touched.newPassword ? errors.newPassword : undefined}
            rightElement={
              <IconButton
                size="1"
                variant="ghost"
                className="absolute right-3 cursor-pointer text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </IconButton>
            }
          />

          {/* Confirm Password Field */}
          <LabeledTextField
            label={tCommon('form.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (touched.confirmPassword) {
                validateForm();
              }
            }}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            rightElement={
              <IconButton
                size="1"
                variant="ghost"
                className="absolute right-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </IconButton>
            }
          />

          {/* Submit Button */}
          <PrimaryButton onClick={handleSubmit}>
            {t('submitButton')}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
