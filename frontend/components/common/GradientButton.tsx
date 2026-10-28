'use client';

import { Button } from '@radix-ui/themes';
import { forwardRef } from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

/**
 * GradientButton - Reusable button with CChat orange gradient
 *
 * Figma specs:
 * - background: linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)
 * - border-radius: 40px (pill shape)
 * - padding: 12px 16px
 * - text: white, uppercase, semibold
 *
 * Usage: Confirm buttons, primary actions in dialogs
 */
export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      children,
      onClick,
      disabled = false,
      isLoading = false,
      loadingText = '...',
      type = 'button',
      className = '',
      fullWidth = false,
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <Button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`
          text-white
          transition-colors duration-200
          cursor-pointer
          px-4 py-5
          rounded-full
          text-base font-semibold uppercase
          disabled:opacity-70 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        style={{
          background: isDisabled
            ? '#ccc'
            : 'linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
        }}
      >
        {isLoading ? loadingText : children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
