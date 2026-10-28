'use client';

import { useEffect, useState } from 'react';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import { LabeledTextField } from '@/components/common/LabeledTextField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Cross2Icon, ChevronLeftIcon } from '@radix-ui/react-icons';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  forgotPasswordRequest,
  selectIsPasswordRecoveryLoading,
} from '@/lib/store/slices/passwordRecoverySlice';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onBackClick?: () => void;
  onForgotPasswordPhone?: (_phoneNumber: string) => void;
  onEmailSuccess?: () => void;
  prefillPhone?: string;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  onBackClick,
  onForgotPasswordPhone,
  onEmailSuccess,
  prefillPhone,
}: ForgotPasswordDialogProps) {
  const t = useTranslations('forgotPassword');
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsPasswordRecoveryLoading);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Prefill phone when dialog opens with prefillPhone
  useEffect(() => {
    if (open && prefillPhone) {
      setEmailOrPhone(prefillPhone);
    }
  }, [open, prefillPhone]);

  // Clear form data when dialog closes
  useEffect(() => {
    if (!open) {
      setEmailOrPhone('');
      setError('');
      setTouched(false);
    }
  }, [open]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Vietnamese phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    if (!emailOrPhone.trim()) {
      setError(t('errors.emailOrPhoneRequired'));
      return false;
    }

    // Check if it's an email or phone number
    const isEmail = emailOrPhone.includes('@');

    if (isEmail) {
      if (!validateEmail(emailOrPhone)) {
        setError(t('errors.emailInvalid'));
        return false;
      }
    } else {
      if (!validatePhoneNumber(emailOrPhone)) {
        setError(t('errors.phoneNumberInvalid'));
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSendCode = () => {
    setTouched(true);

    if (!validateForm()) {
      return;
    }

    const isEmail = emailOrPhone.includes('@');

    if (isEmail) {
      // Email: Call forgot password API (sends reset link to email)
      dispatch(
        forgotPasswordRequest({
          email: emailOrPhone,
          onSuccess: () => {
            // Close dialog and navigate to SignIn dialog on success (email sent)
            onOpenChange(false);
            if (onEmailSuccess) {
              onEmailSuccess();
            }
          },
        })
      );
    } else {
      // Phone: Send OTP and open verification dialog
      if (onForgotPasswordPhone) {
        onForgotPasswordPhone(emailOrPhone);
      }
    }
  };

  const handleBack = () => {
    // Reset form state when going back
    setEmailOrPhone('');
    setError('');
    setTouched(false);

    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="max-w-[370px] p-0 overflow-hidden"
      >
        {/* Header */}
        <Flex
          justify="center"
          align="center"
          className="relative p-4 border-b border-[#E5E6EC]"
        >
          {/* Back Button */}
          <IconButton
            size="2"
            variant="ghost"
            onClick={handleBack}
            className="absolute left-4 cursor-pointer"
          >
            <ChevronLeftIcon width="18" height="18" />
          </IconButton>

          {/* Title */}
          <Dialog.Title className="text-center text-base font-medium uppercase m-0">
            {t('title')}
          </Dialog.Title>

          {/* Close Button */}
          <Dialog.Close>
            <IconButton
              size="2"
              variant="ghost"
              className="absolute right-4 cursor-pointer"
            >
              <Cross2Icon width="18" height="18" />
            </IconButton>
          </Dialog.Close>
        </Flex>

        {/* Content */}
        <Flex direction="column" gap="4" className="px-4 pb-8 pt-4">
          {/* Email or Phone Number Field */}
          <LabeledTextField
            label={t('emailOrPhone')}
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (touched) {
                validateForm();
              }
            }}
            error={touched ? error : undefined}
          />

          {/* Send Code Button */}
          <PrimaryButton onClick={handleSendCode} isLoading={isLoading}>
            {t('sendCodeButton')}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
