'use client';

import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import { storageService } from '@/lib/services/storage.service';
import type { RootState } from '@/lib/store';
import {
  AuthStatus,
  loginRequest,
  oauthRedirectRequest,
} from '@/lib/store/slices/authSlice';
import { useTranslations } from 'next-intl';
import type { OAuthProvider } from '@/types/auth';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppLocale } from '@/lib/locale';
import { SimpleCaptcha } from '../SimpleCaptcha';
import { LabeledTextField } from '@/components/common/LabeledTextField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthDialogHeader, AuthBenefits } from '../common';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  locale: AppLocale;
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
  prefillEmailOrPhone?: string;
}

interface FieldErrors {
  emailOrPhone?: string;
  password?: string;
  captcha?: string;
}

export function SignInDialog({
  open,
  onOpenChange,
  locale,
  onSignUpClick,
  onForgotPasswordClick,
  prefillEmailOrPhone = '',
}: SignInDialogProps) {
  const t = useTranslations('signin');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const dispatch = useDispatch();
  const { status } = useSelector((state: RootState) => state.auth);
  const isLoading = status === AuthStatus.LOADING;

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState(prefillEmailOrPhone);
  const [password, setPassword] = useState('');

  // Error state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // CAPTCHA state
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  // Lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Captcha countdown state
  const [captchaRemaining, setCaptchaRemaining] = useState(0);

  // Update email field when prefillEmail changes
  useEffect(() => {
    if (prefillEmailOrPhone) {
      setEmailOrPhone(prefillEmailOrPhone);
    }
  }, [prefillEmailOrPhone]);

  // Check lockout on mount and dialog open
  useEffect(() => {
    if (open) {
      const locked = storageService.isLoginLocked();
      setIsLocked(locked);
      if (locked) {
        setLockoutRemaining(storageService.getLockoutRemainingSeconds());
        setShowCaptcha(false); // Don't show CAPTCHA when locked
        showErrorToast(t('errors.lockedOut'));
      } else {
        // Check if captcha countdown is still active
        const captchaActive = storageService.isCaptchaCountdownActive();
        const attempts = storageService.getLoginFailedAttempts();

        if (captchaActive && attempts >= 3) {
          setShowCaptcha(true);
          setCaptchaRemaining(storageService.getCaptchaRemainingSeconds());
        } else if (!captchaActive) {
          // Countdown expired, ensure captcha is hidden
          setShowCaptcha(false);
          setCaptchaRemaining(0);
        }
      }
    }
  }, [open, t]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutRemaining <= 0) return;

    const timer = setInterval(() => {
      const remaining = storageService.getLockoutRemainingSeconds();
      setLockoutRemaining(remaining);

      if (remaining <= 0) {
        // Reset everything when lockout expires
        storageService.resetLoginFailedAttempts();
        storageService.clearLoginLockout();
        setIsLocked(false);
        setShowCaptcha(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutRemaining]);

  // Captcha countdown timer
  useEffect(() => {
    if (!showCaptcha || captchaRemaining <= 0 || isLocked) return;

    const timer = setInterval(() => {
      const remaining = storageService.getCaptchaRemainingSeconds();
      setCaptchaRemaining(remaining);

      if (remaining <= 0) {
        // Reset everything when captcha countdown expires
        storageService.resetLoginFailedAttempts();
        storageService.clearCaptchaCountdown();
        setShowCaptcha(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showCaptcha, captchaRemaining, isLocked]);

  // Reset form data when dialog closes
  useEffect(() => {
    if (!open) {
      setEmailOrPhone('');
      setPassword('');
      setShowPassword(false);
      setFieldErrors({});
      setTouched({});
      setCaptchaValid(false);
    }
  }, [open, dispatch]);


  const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateEmailOrPhone = useCallback(
    (value: string): string | undefined => {
      if (!value.trim()) {
        return t('errors.emailOrPhoneEmpty');
      }

      if (value.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return t('errors.invalidFormat');
        }
        return undefined;
      }

      const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
      if (!phoneRegex.test(value)) {
        return t('errors.invalidFormat');
      }
      return undefined;
    },
    [t]
  );

  const validatePassword = useCallback(
    (value: string): string | undefined => {
      if (!value) {
        return tCommon('errors.passwordRequired');
      }
      return undefined;
    },
    [tCommon]
  );

  const handleCaptchaValidate = useCallback((isValid: boolean) => {
    setCaptchaValid(isValid);
    if (isValid) {
      setFieldErrors((prev) => ({ ...prev, captcha: undefined }));
    }
  }, []);

  const handleSignIn = () => {
    setTouched({ emailOrPhone: true, password: true, captcha: true });

    const emailOrPhoneError = validateEmailOrPhone(emailOrPhone);
    const passwordError = validatePassword(password);
    const captchaError =
      showCaptcha && !captchaValid ? t('errors.captchaInvalid') : undefined;

    const newErrors: FieldErrors = {
      emailOrPhone: emailOrPhoneError,
      password: passwordError,
      captcha: captchaError,
    };

    setFieldErrors(newErrors);

    if (emailOrPhoneError || passwordError || captchaError) {
      return;
    }

    const handleLoginError = () => {
      const attempts = storageService.incrementLoginFailedAttempts();

      if (attempts >= 5) {
        const lockoutUntil = Date.now() + 15 * 60 * 1000;
        storageService.setLoginLockout(lockoutUntil);
        storageService.clearCaptchaCountdown(); // Clear captcha countdown when locked
        setIsLocked(true);
        setLockoutRemaining(15 * 60);
        setShowCaptcha(false); // Hide CAPTCHA when locked
      } else if (attempts >= 3) {
        // Set captcha countdown only if not already set
        if (!storageService.getCaptchaCountdownUntil()) {
          const captchaUntil = Date.now() + 15 * 60 * 1000;
          storageService.setCaptchaCountdown(captchaUntil);
        }
        setShowCaptcha(true);
        setCaptchaRemaining(storageService.getCaptchaRemainingSeconds());
      }
    };

    const handleLoginSuccess = () => {
      storageService.resetLoginFailedAttempts();
      storageService.clearLoginLockout();
      storageService.clearCaptchaCountdown(); // Clear captcha countdown on success
      showSuccessToast(tAuth('loginSuccess'));
      onOpenChange(false);
    };

    const inputIsEmail = isEmail(emailOrPhone);
    dispatch(
      loginRequest(
        inputIsEmail
          ? {
              email: emailOrPhone,
              password,
              locale,
              onSuccess: handleLoginSuccess,
              onError: handleLoginError,
            }
          : {
              phoneNumber: emailOrPhone,
              password,
              locale,
              onSuccess: handleLoginSuccess,
              onError: handleLoginError,
            }
      )
    );
  };

  const handleSocialSignIn = (provider: OAuthProvider) => {
    dispatch(oauthRedirectRequest({ provider }));
  };

  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrPhone(e.target.value);
    if (touched.emailOrPhone) {
      setTouched((prev) => ({ ...prev, emailOrPhone: false }));
      setFieldErrors((prev) => ({ ...prev, emailOrPhone: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) {
      setTouched((prev) => ({ ...prev, password: false }));
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !isLocked) {
      handleSignIn();
    }
  };

  // Format countdown for button display
  const formattedCountdown = useMemo(() => {
    if (!isLocked || lockoutRemaining <= 0) return null;
    const minutes = Math.floor(lockoutRemaining / 60);
    const seconds = lockoutRemaining % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [isLocked, lockoutRemaining]);

  // Format countdown for captcha display
  const formattedCaptchaCountdown = useMemo(() => {
    if (!showCaptcha || captchaRemaining <= 0) return null;
    const minutes = Math.floor(captchaRemaining / 60);
    const seconds = captchaRemaining % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [showCaptcha, captchaRemaining]);

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
        <AuthDialogHeader />

        {/* Benefits Section */}
        <AuthBenefits />

        <Flex direction="column" gap="3" mt="2">
          {/* Email or Phone Number Field */}
          <LabeledTextField
            label={t('emailOrPhone')}
            value={emailOrPhone}
            onChange={handleEmailOrPhoneChange}
            disabled={isLoading || isLocked}
            error={touched.emailOrPhone ? fieldErrors.emailOrPhone : undefined}
          />

          {/* Password Field */}
          <LabeledTextField
            label={tCommon('form.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading || isLocked}
            error={touched.password ? fieldErrors.password : undefined}
            onKeyDown={handlePasswordKeyDown}
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

          {/* CAPTCHA Field */}
          {showCaptcha && (
            <>
              <SimpleCaptcha
                onValidate={handleCaptchaValidate}
                error={touched.captcha ? fieldErrors.captcha : undefined}
                disabled={isLoading || isLocked}
              />
              {formattedCaptchaCountdown && (
                <Text size="1" className="text-gray-500 -mt-2">
                  {t('captchaCountdown', formattedCaptchaCountdown)}
                </Text>
              )}
            </>
          )}

          {/* Forgot Password Link */}
          <Flex justify="end" mt="-1">
            <Text
              as="span"
              onClick={onForgotPasswordClick}
              className="text-[0.875rem] leading-[1.125rem] font-normal text-blue-600 cursor-pointer hover:text-blue-700"
            >
              {t('forgotPassword')}
            </Text>
          </Flex>

          {/* Sign In Button */}
          <PrimaryButton
            onClick={handleSignIn}
            disabled={isLocked}
            isLoading={isLoading}
            className="mt-1"
          >
            {isLocked && formattedCountdown
              ? t('lockedButton', formattedCountdown)
              : t('signInButton')}
          </PrimaryButton>

          {/* Or Sign In With */}
          <Text size="2" align="center" className="text-gray-600 mt-1">
            {t('orSignInWith')}
          </Text>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            onSocialSignIn={handleSocialSignIn}
            disabled={isLocked}
          />

          {/* Sign Up Link */}
          <Text
            align="center"
            className="text-gray-700 mt-2 text-[0.875rem] leading-[1.125rem] font-normal"
          >
            {t('noAccount')}{' '}
            <span
              onClick={onSignUpClick}
              className="text-blue-600 cursor-pointer hover:text-blue-700 text-[0.875rem] leading-[1.125rem] font-normal"
            >
              {t('signUpNow')}
            </span>
          </Text>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
