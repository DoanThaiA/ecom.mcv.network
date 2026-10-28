'use client';

import { storageService } from '@/lib/services/storage.service';
import { useAppSelector } from '@/lib/store/hooks';
import { AuthStatus } from '@/lib/store/slices/authSlice';
import { useTranslations } from 'next-intl';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { ChevronLeftIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Text, VisuallyHidden } from '@radix-ui/themes';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

interface PhoneVerificationDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  phoneNumber: string;
  onVerify?: (_code: string) => void;
  onResendCode?: () => void;
  onBack?: () => void;
}

export function PhoneVerificationDialog({
  open,
  onOpenChange,
  phoneNumber,
  onVerify,
  onResendCode,
  onBack,
}: PhoneVerificationDialogProps) {
  const t = useTranslations('phoneVerification');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isLoading = useAppSelector((s) => s.auth.status) === AuthStatus.LOADING;

  // Initialize countdown and lockout from storage when dialog opens
  useEffect(() => {
    if (open) {
      const remaining = storageService.getOtpResendRemainingSeconds();
      setCountdown(remaining);

      // Check lockout status
      const locked = storageService.isOtpVerifyLocked();
      setIsLocked(locked);
      if (locked) {
        setLockoutCountdown(storageService.getOtpVerifyLockoutRemainingSeconds());
      }
    } else {
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [open]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutCountdown <= 0) return;

    const timer = setInterval(() => {
      const remaining = storageService.getOtpVerifyLockoutRemainingSeconds();
      setLockoutCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setIsLocked(false);
        storageService.clearOtpVerifyLockout();
        storageService.resetOtpVerifyFailedAttempts();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutCountdown]);

  // Re-check lockout status when loading ends (after verify attempt)
  useEffect(() => {
    if (!isLoading) {
      const locked = storageService.isOtpVerifyLocked();
      setIsLocked(locked);
      if (locked) {
        setLockoutCountdown(storageService.getOtpVerifyLockoutRemainingSeconds());
      }
    }
  }, [isLoading]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      const remaining = storageService.getOtpResendRemainingSeconds();
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        storageService.removeOtpResendCountdown();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');

    if (code.length !== 6) {
      setError(t('errors.incompleteCode'));
      return;
    }

    // Call verify callback
    if (onVerify) {
      onVerify(code);
    }
  };

  const handleResendCode = () => {
    if (!storageService.canResendOtp()) return;

    // Reset OTP
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();

    // Set countdown to 60 seconds
    const countdownTime = Date.now() + 60 * 1000;
    storageService.setOtpResendCountdown(countdownTime);
    setCountdown(60);

    if (onResendCode) {
      onResendCode();
    }
  };

  // Get resend button text
  const getResendButtonText = () => {
    if (countdown > 0) {
      return t('resendCodeIn', { seconds: countdown });
    }
    return t('resendCode');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        className="!max-w-[450px] !p-0 !rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_24px] items-center gap-4 px-4 py-4 border-b border-[#E5E6EC]">
          {/* Back Button */}
          {onBack ? (
            <ChevronLeftIcon
              width="24"
              height="24"
              color="black"
              onClick={onBack}
              className="cursor-pointer"
            />
          ) : (
            <div className="w-6 h-6" />
          )}
          {/* Title */}
          <Text className="text-center text-base font-medium uppercase m-0 leading-6 text-black">
            {t('title')}
          </Text>
          <VisuallyHidden>
            <Dialog.Title>{t('title')}</Dialog.Title>
            <Dialog.Description>{t('title')}</Dialog.Description>
          </VisuallyHidden>
          {/* Close Button */}
          <Dialog.Close>
            <Cross2Icon
              width="24"
              height="24"
              color="black"
              className="cursor-pointer"
            />
          </Dialog.Close>
        </div>

        {/* Content */}
        <Flex direction="column" gap="4" className="px-4 pb-8 pt-4">
          {/* Description */}
          <Text size="2" className="text-center text-black">
            {t('description')} {phoneNumber}
          </Text>

          {/* Lockout Message */}
          {isLocked && (
            <Text size="2" className="text-[#FF3B30] text-center">
              {t('errors.lockedCountdown', {
                minutes: Math.floor(lockoutCountdown / 60),
                seconds: lockoutCountdown % 60,
              })}
            </Text>
          )}

          {/* OTP Input */}
          <Flex gap="2" justify="center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isLocked}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(index, e)
                }
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-[50px] h-[50px] text-center text-2xl font-semibold border rounded outline-none
                  ${error ? 'border-[#FF3B30]' : 'border-[#F0F0F0]'}
                  ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                  focus:border-black`}
              />
            ))}
          </Flex>

          {/* Error Message */}
          {error && !isLocked && (
            <Text size="2" className="text-[#FF3B30] text-center">
              {error}
            </Text>
          )}

          {/* Verify Button */}
          <Button
            loading={isLoading}
            size="3"
            onClick={handleVerify}
            disabled={isLocked}
            className={`!bg-[#FAA63E] !text-white !rounded-3xl mt-2
              ${isLocked ? '!opacity-50 !cursor-not-allowed' : '!cursor-pointer'}`}
          >
            {t('verifyButton')}
          </Button>

          {/* Resend Code Link */}
          <Flex justify="center">
            <Button
              variant="ghost"
              disabled={countdown > 0 || isLoading || isLocked}
              onClick={handleResendCode}
              className={`!bg-transparent !border-none text-sm
                ${countdown > 0 || isLocked ? '!text-[#646569] !cursor-not-allowed' : '!text-[#646569] !cursor-pointer hover:!underline'}`}
            >
              {getResendButtonText()}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
