'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { EmailVerificationNoticeDialog } from '@/components/auth/EmailVerificationNoticeDialog';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { ForgotPasswordEmailSentDialog } from '@/components/auth/ForgotPasswordEmailSentDialog';
import { OtpSource, OtpSourceDialog } from '@/components/auth/OtpSourceDialog';
import {
  PhoneResetPasswordDialog,
  PhoneResetPasswordFormData,
} from '@/components/auth/PhoneResetPasswordDialog';
import { PhoneVerificationDialog } from '@/components/auth/PhoneVerificationDialog';
import { RegistrationFailedDialog } from '@/components/auth/RegistrationFailedDialog';
import { RegistrationSuccessDialog } from '@/components/auth/RegistrationSuccessDialog';
import { SignInDialog } from '@/components/auth/signin';
import { SignUpDialog } from '@/components/auth/SignUpDialog';
import { showSuccessToast } from '@/lib/helpers/toastHelper';
import { storageService } from '@/lib/services/storage.service';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch } from '@/lib/store/hooks';
import { verifyPhoneOtpRequest } from '@/lib/store/slices/authSlice';
import {
  registerRequest,
  resendCodeRequest,
} from '@/lib/store/slices/registrationSlice';
import {
  phoneForgotPasswordCompleteRequest,
  phoneForgotPasswordRequestOtpRequest,
  phoneForgotPasswordVerifyOtpRequest,
} from '@/lib/store/slices/passwordRecoverySlice';

interface AuthDialogsManagerProps {
  locale: AppLocale;
  signInOpen: boolean;
  onSignInOpenChange: (_open: boolean) => void;
  signUpOpen: boolean;
  onSignUpOpenChange: (_open: boolean) => void;
}

export function AuthDialogsManager({
  locale,
  signInOpen,
  onSignInOpenChange,
  signUpOpen,
  onSignUpOpenChange,
}: AuthDialogsManagerProps) {
  const setSignUpOpen = onSignUpOpenChange;
  const [otpSourceOpen, setOtpSourceOpen] = useState(false);
  const [otpSource, setOtpSource] = useState<OtpSource | null>(null);
  const [emailVerificationNoticeOpen, setEmailVerificationNoticeOpen] =
    useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmailSentOpen, setForgotPasswordEmailSentOpen] =
    useState(false);
  const [signupData, setSignupData] = useState<{
    fullName: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
  } | null>(null);
  const [phoneData, setPhoneData] = useState<string | null>(null);
  const [verificationContext, setVerificationContext] = useState<
    'signup' | 'forgot'
  >('signup');
  const [prefillEmailOrPhone, setPrefillEmailOrPhone] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [phoneResetPasswordOpen, setPhoneResetPasswordOpen] = useState(false);
  const [registrationSuccessOpen, setRegistrationSuccessOpen] = useState(false);
  const [registrationFailedOpen, setRegistrationFailedOpen] = useState(false);
  const [resetOtpLoading, setResetOtpLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tVerify = useTranslations('phoneVerification');
  const tResetPassword = useTranslations('resetPassword');

  // Check for resetToken and phone in URL params
  useEffect(() => {
    const token = searchParams.get('phone-reset-token');
    const phone = searchParams.get('phone');
    if (token && phone) {
      setResetToken(token);
      setPhoneData(phone);
      setPhoneResetPasswordOpen(true);
      // Clear URL params to prevent re-trigger when component re-renders
      router.replace(`/${locale}`, { scroll: false });
    }
  }, [searchParams, locale, router]);

  const handleSignUpClick = () => {
    onSignInOpenChange(false);
    setSignUpOpen(true);
  };

  const signupBackToSigin = () => {
    setSignUpOpen(false);
    onSignInOpenChange(true);
    setSignupData(null);
  };

  const handleForgotPasswordClick = () => {
    onSignInOpenChange(false);
    setForgotPasswordOpen(true);
  };

  const handleForgotPasswordBack = () => {
    setForgotPasswordOpen(false);
    onSignInOpenChange(true);
  };

  const handleForgotPasswordPhone = (phone: string) => {
    setVerificationContext('forgot');
    setForgotPasswordOpen(false);
    setOtpSourceOpen(true);
    setPhoneData(phone);
  };

  const handleForgotPasswordEmailSuccess = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmailSentOpen(true);
  };

  const handleForgotPasswordEmailSentClose = () => {
    setForgotPasswordEmailSentOpen(false);
    onSignInOpenChange(true);
  };

  const handleEmailSignUpSuccess = (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setSignupData({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    setSignUpOpen(false);
    setEmailVerificationNoticeOpen(true);
    setPrefillEmailOrPhone(data.email);
  };

  const handleResendVerificationEmail = () => {
    if (signupData && signupData.email && signupData.password) {
      dispatch(
        registerRequest({
          firstName: signupData.fullName,
          lastName: '',
          email: signupData.email,
          password: signupData.password,
          onSuccess: () => {
            showSuccessToast(tVerify('success.resendCodeSuccess'));
          },
        })
      );
    }
  };

  const handlePhoneSignUp = (data: {
    fullName: string;
    phoneNumber: string;
    password: string;
  }) => {
    setSignupData(data);
    setVerificationContext('signup');
    setSignUpOpen(false);
    setOtpSourceOpen(true);
  };

  const handleOtpSourceError = () => {
    setResetOtpLoading(true);
    setTimeout(() => setResetOtpLoading(false), 0);
  };

  const handleOtpSourceSelect = (source: OtpSource) => {
    if (verificationContext === 'signup' && signupData) {
      dispatch(
        registerRequest({
          firstName: signupData.fullName,
          lastName: '',
          phoneNumber: signupData.phoneNumber,
          password: (signupData as { password: string }).password,
          otpMethod: source,
          onSuccess: () => {
            const countdownTime = Date.now() + 60 * 1000;
            storageService.setOtpResendCountdown(countdownTime);
            setOtpSourceOpen(false);
            setOtpSource(source);
          },
          onError: handleOtpSourceError,
        })
      );
      return;
    }
    if (phoneData)
      dispatch(
        phoneForgotPasswordRequestOtpRequest({
          phone: phoneData,
          otpMethod: source,
          onSuccess: () => {
            const countdownTime = Date.now() + 60 * 1000;
            storageService.setOtpResendCountdown(countdownTime);
            setOtpSourceOpen(false);
            setOtpSource(source);
          },
          onError: handleOtpSourceError,
        })
      );
  };

  const handleResendCode = () => {
    if (verificationContext === 'signup' && signupData && otpSource) {
      dispatch(
        resendCodeRequest({
          firstName: signupData.fullName,
          lastName: '',
          phoneNumber: signupData.phoneNumber,
          password: (signupData as { password: string }).password,
          otpMethod: otpSource,
          onSuccess: () => {
            showSuccessToast(tVerify('success.resendCodeSuccess'));
          },
        })
      );
      return;
    }

    if (verificationContext === 'forgot' && phoneData && otpSource) {
      dispatch(
        phoneForgotPasswordRequestOtpRequest({
          phone: phoneData,
          otpMethod: otpSource,
          onSuccess: () => {
            showSuccessToast(tVerify('success.resendCodeSuccess'));
          },
        })
      );
    }
  };

  const handleOtpSourceBack = () => {
    setOtpSourceOpen(false);
    if (verificationContext === 'forgot') {
      setForgotPasswordOpen(true);
    } else {
      setSignUpOpen(true);
    }
  };

  const handlePhoneVerificationBack = () => {
    setOtpSource(null);
    setOtpSourceOpen(true);
  };

  // Handle OTP verify error with lockout logic
  const handleVerifyError = () => {
    const attempts = storageService.incrementOtpVerifyFailedAttempts();
    if (attempts >= 3) {
      // Lock for 15 minutes - reset will happen when lockout expires
      const lockoutUntil = Date.now() + 15 * 60 * 1000;
      storageService.setOtpVerifyLockout(lockoutUntil);
    }
  };

  // Handle OTP verify success - reset failed attempts
  const handleVerifySuccess = () => {
    storageService.resetOtpVerifyFailedAttempts();
    storageService.clearOtpVerifyLockout();
  };

  const handleVerify = (otp: string) => {
    if (verificationContext === 'signup') {
      dispatch(
        verifyPhoneOtpRequest({
          phone: signupData?.phoneNumber ?? '',
          otp: otp,
          locale: locale,
          onSuccess: () => {
            handleVerifySuccess();
            setOtpSource(null);
            setSignupData(null);
            setRegistrationSuccessOpen(true);
          },
          onError: handleVerifyError,
        })
      );
      return;
    }

    if (phoneData)
      dispatch(
        phoneForgotPasswordVerifyOtpRequest({
          phone: phoneData,
          otp: otp,
          onSuccess: (token: string) => {
            handleVerifySuccess();
            setOtpSource(null);
            const params = new URLSearchParams();
            params.set('phone-reset-token', token);
            params.set('phone', phoneData);
            router.push(`/${locale}?${params.toString()}`);
          },
          onError: handleVerifyError,
        })
      );
  };

  const handlePhoneResetPassword = (data: PhoneResetPasswordFormData) => {
    if (!resetToken || !phoneData) return;

    dispatch(
      phoneForgotPasswordCompleteRequest({
        phone: phoneData,
        resetToken: resetToken,
        password: data.newPassword,
        onSuccess: () => {
          showSuccessToast(tResetPassword('success'));
          router.push(`/${locale}`);
          setPhoneResetPasswordOpen(false);
          setResetToken(null);
          setPhoneData(null);
          onSignInOpenChange(true);
        },
        onError: () => {
          router.push(`/${locale}`);
          setPhoneResetPasswordOpen(false);
          setResetToken(null);
          setForgotPasswordOpen(true);
        },
      })
    );
  };

  const handleEmailVerificationNoticeClose = () => {
    setEmailVerificationNoticeOpen(false);
    onSignInOpenChange(true);
  };

  const handleRegistrationSuccessGoHome = () => {
    setRegistrationSuccessOpen(false);
    router.push(`/${locale}`);
  };

  const handleRegistrationFailedRegister = () => {
    setRegistrationFailedOpen(false);
    setSignUpOpen(true);
  };

  return (
    <>
      {/* Sign In Dialog */}
      <SignInDialog
        open={signInOpen}
        onOpenChange={(value) => {
          onSignInOpenChange(value);
          if (!value) {
            setPrefillEmailOrPhone('');
          }
        }}
        locale={locale}
        onSignUpClick={handleSignUpClick}
        onForgotPasswordClick={handleForgotPasswordClick}
        prefillEmailOrPhone={prefillEmailOrPhone}
      />

      {/* Sign Up Dialog */}
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={(value) => {
          setSignUpOpen(value);
          if (!value) {
            setSignupData(null);
            setVerificationContext('signup');
          }
        }}
        locale={locale}
        initialData={
          signupData
            ? {
                fullName: signupData.fullName,
                emailOrPhone: signupData.email || signupData.phoneNumber,
                password: signupData.password,
              }
            : undefined
        }
        onEmailSignUpSuccess={handleEmailSignUpSuccess}
        onPhoneSignUp={handlePhoneSignUp}
        onBackToSignIn={signupBackToSigin}
      />

      {/* OTP Source Selection Dialog */}
      <OtpSourceDialog
        open={otpSourceOpen}
        onOpenChange={(value) => {
          setOtpSourceOpen(value);
          if (!value) {
            setSignupData(null);
            setVerificationContext('signup');
            setPhoneData(null);
          }
        }}
        phoneNumber={signupData?.phoneNumber || phoneData || ''}
        onSelectSource={handleOtpSourceSelect}
        onBack={handleOtpSourceBack}
        resetLoading={resetOtpLoading}
      />

      {/* Phone Verification Dialog */}
      <PhoneVerificationDialog
        open={otpSource !== null}
        onOpenChange={(value) => {
          if (!value) {
            const wasForgotFlow = verificationContext === 'forgot';
            setOtpSource(null);
            setVerificationContext('signup');
            setSignupData(null);
            if (wasForgotFlow) {
              setPhoneData(null);
            }
          }
        }}
        phoneNumber={
          verificationContext === 'forgot'
            ? phoneData ?? ''
            : signupData?.phoneNumber ?? ''
        }
        onVerify={handleVerify}
        onResendCode={handleResendCode}
        onBack={handlePhoneVerificationBack}
      />

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={(value) => {
          setForgotPasswordOpen(value);
          if (!value) {
            setVerificationContext('signup');
            setPhoneData(null);
          }
        }}
        onBackClick={handleForgotPasswordBack}
        onForgotPasswordPhone={handleForgotPasswordPhone}
        onEmailSuccess={handleForgotPasswordEmailSuccess}
        prefillPhone={phoneData ?? undefined}
      />

      {/* Forgot Password Email Sent Dialog */}
      <ForgotPasswordEmailSentDialog
        open={forgotPasswordEmailSentOpen}
        onOpenChange={setForgotPasswordEmailSentOpen}
        onBackToSignIn={handleForgotPasswordEmailSentClose}
      />

      {/* Email Verification Notice Dialog */}
      <EmailVerificationNoticeDialog
        open={emailVerificationNoticeOpen}
        onOpenChange={(value) => {
          setEmailVerificationNoticeOpen(value);
          if (!value) {
            setSignupData(null);
            setVerificationContext('signup');
          }
        }}
        email={prefillEmailOrPhone}
        onResendEmail={handleResendVerificationEmail}
        onBackToSignIn={handleEmailVerificationNoticeClose}
      />

      {/* Phone Reset Password Dialog */}
      <PhoneResetPasswordDialog
        open={phoneResetPasswordOpen}
        onOpenChange={(value) => {
          setPhoneResetPasswordOpen(value);
          if (!value) {
            setResetToken(null);
            setPhoneData(null);
            // Note: Navigation is handled in handlePhoneResetPassword success/error callbacks
          }
        }}
        onSubmit={handlePhoneResetPassword}
      />

      {/* Registration Success Dialog */}
      <RegistrationSuccessDialog
        open={registrationSuccessOpen}
        onOpenChange={setRegistrationSuccessOpen}
        onGoHome={handleRegistrationSuccessGoHome}
      />

      {/* Registration Failed Dialog */}
      <RegistrationFailedDialog
        open={registrationFailedOpen}
        onOpenChange={setRegistrationFailedOpen}
        onRegister={handleRegistrationFailedRegister}
      />
    </>
  );
}
