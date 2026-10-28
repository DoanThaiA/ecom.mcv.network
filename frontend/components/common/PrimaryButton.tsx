'use client';

import { Button } from '@radix-ui/themes';
import { forwardRef } from 'react';

interface PrimaryButtonProps {
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
 * PrimaryButton - Reusable primary action button using Radix UI
 *
 * Figma specs:
 * - width: 338px (full width by default)
 * - height: 48px (3rem)
 * - border-radius: 24px (1.5rem)
 * - padding: 12px 16px (0.75rem 1rem)
 * - gap: 10px (0.625rem)
 * - background: var(--color-primary) (CChat brand color)
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      children,
      onClick,
      disabled = false,
      isLoading = false,
      loadingText = '...',
      type = 'button',
      className = '',
      fullWidth = true,
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
          h-[3rem] rounded-[1.5rem]
          px-[1rem] py-[0.75rem]
          bg-primary hover:bg-primary-hover
          text-white font-medium text-[1rem] leading-[1.5rem]
          transition-colors duration-200
          disabled:opacity-70 disabled:cursor-not-allowed
          cursor-pointer
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {isLoading ? loadingText : children}
      </Button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';
