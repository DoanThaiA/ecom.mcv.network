'use client';

import { LabeledTextField } from '@/components/common/LabeledTextField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { showSuccessToast } from '@/lib/helpers/toastHelper';
import { AppLocale } from '@/lib/locale';
import {
  registerRequest,
  RegistrationStatus,
} from '@/lib/store/slices/registrationSlice';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, VisuallyHidden } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthDialogHeader, AuthBenefits } from './common';

interface ValidationErrors {
  fullName?: string;
  emailOrPhone?: string;
  password?: string;
  confirmPassword?: string;
}

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  locale: AppLocale;
  initialData?: {
    fullName?: string;
    emailOrPhone?: string;
    password?: string;
  };
  onEmailSignUpSuccess?: (_data: {
    fullName: string;
    email: string;
    password: string;
  }) => void;
  onPhoneSignUp?: (_data: {
    fullName: string;
    phoneNumber: string;
    password: string;
  }) => void;
  /** Callback when closing dialog should return to SignIn (e.g., when opened from SignIn) */
  onBackToSignIn?: () => void;
}

export function SignUpDialog({
  open,
  onOpenChange,
  initialData,
  onEmailSignUpSuccess,
  onPhoneSignUp: onPhoneSignUp,
  onBackToSignIn,
}: SignUpDialogProps) {
  const t = useTranslations('signup');
  const tCommon = useTranslations('common');
  const dispatch = useDispatch();
  const registrationStatus = useSelector((state: any) => state.registration.status);
  const isLoading = registrationStatus === RegistrationStatus.LOADING;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle form data when dialog opens/closes
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setEmailOrPhone(initialData.emailOrPhone || '');
      setPassword(initialData.password || '');
      setConfirmPassword(initialData.password || '');
    } else {
      setFullName('');
      setEmailOrPhone('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData, open]);

  // Validation functions
  const validateFullName = (value: string): string | undefined => {
    if (!value.trim()) {
      return tCommon('errors.fullNameRequired');
    }
    return undefined;
  };

  const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateEmailOrPhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return t('errors.emailOrPhoneRequired');
    }

    if (value.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return tCommon('errors.emailInvalid');
      }
      return undefined;
    }

    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(value)) {
      return t('errors.phoneNumberInvalid');
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return tCommon('errors.passwordRequired');
    }
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (
      !hasMinLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      return tCommon('errors.passwordInvalid');
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) {
      return tCommon('errors.confirmPasswordRequired');
    }
    if (value !== password) {
      return tCommon('errors.confirmPasswordMismatch');
    }
    return undefined;
  };

  const handleSignUp = () => {
    const newErrors: ValidationErrors = {
      fullName: validateFullName(fullName),
      emailOrPhone: validateEmailOrPhone(emailOrPhone),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      emailOrPhone: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== undefined
    );

    if (!hasErrors) {
      const inputIsEmail = isEmail(emailOrPhone);

      if (inputIsEmail) {
        dispatch(
          registerRequest({
            firstName: fullName,
            lastName: '',
            email: emailOrPhone,
            password,
            onSuccess: () => {
              showSuccessToast(t('success.emailRegistration'));
              if (onEmailSignUpSuccess) {
                onEmailSignUpSuccess({
                  fullName,
                  email: emailOrPhone,
                  password,
                });
              }
            },
          })
        );
      } else {
        if (onPhoneSignUp) {
          onPhoneSignUp({
            fullName,
            phoneNumber: emailOrPhone,
            password,
          });
        }
      }
    }
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="rounded-[14px] w-[calc(100vw-32px)] sm:w-[480px] md:w-[512px] max-w-[512px] p-4 sm:p-6 relative"
      >
        <VisuallyHidden>
          <Dialog.Title>{t('title')}</Dialog.Title>
          <Dialog.Description>{t('title')}</Dialog.Description>
        </VisuallyHidden>

        {/* Header: Logo + Close button */}
        <AuthDialogHeader onClose={onBackToSignIn} />

        {/* Benefits Section */}
        <AuthBenefits />

        <Flex direction="column" gap="3" mt="2">
          {/* Full Name Field */}
          <LabeledTextField
            label={tCommon('form.fullName')}
            value={fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)}
            disabled={isLoading}
            error={touched.fullName ? errors.fullName : undefined}
          />

          {/* Email or Phone Number Field */}
          <LabeledTextField
            label={t('emailOrPhone')}
            value={emailOrPhone}
            onChange={(e) => handleFieldChange('emailOrPhone', e.target.value, setEmailOrPhone)}
            disabled={isLoading}
            error={touched.emailOrPhone ? errors.emailOrPhone : undefined}
          />

          {/* Password Field */}
          <LabeledTextField
            label={tCommon('form.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
            disabled={isLoading}
            error={touched.password ? errors.password : undefined}
            className="pr-10"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bg-transparent border-0 p-1 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </button>
            }
          />

          {/* Confirm Password Field */}
          <LabeledTextField
            label={tCommon('form.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
            disabled={isLoading}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            className="pr-10"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 bg-transparent border-0 p-1 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </button>
            }
          />

          {/* Sign Up Button */}
          <PrimaryButton
            onClick={handleSignUp}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText={t('signingUp')}
            className="mt-1"
          >
            {t('signUpButton')}
          </PrimaryButton>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
