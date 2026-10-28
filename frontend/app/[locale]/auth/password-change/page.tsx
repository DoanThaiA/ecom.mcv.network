'use client';

import { showErrorToast } from '@/lib/helpers/toastHelper';
import { AppLocale } from '@/lib/locale';
import { authRepository } from '@/lib/repositories/auth.repository';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PasswordChangeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as AppLocale;
  const t = useTranslations('resetPassword');
  const tCommon = useTranslations('common');

  const [hash, setHash] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const hashParam = searchParams.get('hash');
    const expiresParam = searchParams.get('expires');

    if (!hashParam) {
      setIsExpired(true);
      return;
    }

    // Check if link is expired
    if (expiresParam) {
      const expiresTime = parseInt(expiresParam, 10);
      if (Date.now() > expiresTime) {
        setIsExpired(true);
        return;
      }
    }

    setHash(hashParam);
  }, [searchParams]);

  // Validate password format
  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    );
  };

  const handleBlur = (field: 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (touched.newPassword) {
      if (!newPassword.trim()) {
        newErrors.newPassword = tCommon('errors.passwordRequired');
      } else if (!validatePassword(newPassword)) {
        newErrors.newPassword = tCommon('errors.passwordInvalid');
      }
    }

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

  const handleSubmit = async () => {
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });

    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

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

    try {
      setIsLoading(true);

      await authRepository.resetPasswordWithHash({
        password: newPassword,
        hash,
      });

      setIsSuccess(true);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Container
        size="1"
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md p-6 sm:p-8">
          <Flex direction="column" gap="4" align="center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <Heading size="6" align="center" className="text-green-600">
              {t('successTitle')}
            </Heading>
            <Text size="3" className="text-gray-600 text-center">
              {t('successMessage')}
            </Text>
            <Text size="2" className="text-gray-500 text-center">
              {t('canCloseTab')}
            </Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  if (isExpired) {
    return (
      <Container
        size="1"
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md p-6 sm:p-8">
          <Flex direction="column" gap="4" align="center">
            <Heading size="6" align="center" className="text-red-600">
              {t('linkExpiredTitle')}
            </Heading>
            <Text size="3" className="text-gray-600 text-center">
              {t('linkExpiredMessage')}
            </Text>
            <Button
              size="3"
              onClick={() => router.push(`/${locale}`)}
              className="bg-black text-white cursor-pointer"
            >
              {t('backToHomeButton')}
            </Button>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      size="1"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Flex direction="column" gap="4">
          <Heading size="6" align="center">
            {t('title')}
          </Heading>

          {/* New Password Field */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" className="text-black">
              {tCommon('form.newPassword')}
            </Text>
            <div className="relative flex items-center">
              <TextField.Root
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (touched.newPassword) {
                    validateForm();
                  }
                }}
                onBlur={() => handleBlur('newPassword')}
                placeholder={tCommon('form.newPasswordPlaceholder')}
                size="3"
                className={`w-full pr-10 ${
                  touched.newPassword && errors.newPassword
                    ? 'border-red-500'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 bg-transparent border-0 p-1 cursor-pointer flex items-center justify-center text-gray-600"
              >
                {showNewPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </button>
            </div>
            {touched.newPassword && errors.newPassword && (
              <Text size="1" className="text-red-500">
                {errors.newPassword}
              </Text>
            )}
          </Flex>

          {/* Confirm Password Field */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" className="text-black">
              {tCommon('form.confirmPassword')}
            </Text>
            <div className="relative flex items-center">
              <TextField.Root
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) {
                    validateForm();
                  }
                }}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder={tCommon('form.confirmPasswordPlaceholder')}
                size="3"
                className={`w-full pr-10 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 bg-transparent border-0 p-1 cursor-pointer flex items-center justify-center text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeNoneIcon width="16" height="16" />
                ) : (
                  <EyeOpenIcon width="16" height="16" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text size="1" className="text-red-500">
                {errors.confirmPassword}
              </Text>
            )}
          </Flex>

          {/* Submit Button */}
          <Button
            size="3"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-black text-white mt-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t('resetting') : t('submitButton')}
          </Button>
        </Flex>
      </Card>
    </Container>
  );
}

function LoadingFallback() {
  const t = useTranslations('resetPassword');

  return (
    <Container
      size="1"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Flex direction="column" gap="4" align="center">
          <Heading size="6" align="center">
            {t('loading')}
          </Heading>
        </Flex>
      </Card>
    </Container>
  );
}

export default function PasswordChangePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PasswordChangeContent />
    </Suspense>
  );
}
