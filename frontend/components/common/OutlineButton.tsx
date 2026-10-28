'use client';

import { Button } from '@radix-ui/themes';
import { forwardRef } from 'react';

interface OutlineButtonProps {
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
 * OutlineButton - Reusable outline button with light border
 *
 * Figma specs:
 * - border: 1px solid #F0F0F0 (using box-shadow for Radix compatibility)
 * - border-radius: 40px (pill shape)
 * - padding: 12px 16px
 * - background: white
 * - text: black, uppercase, semibold
 *
 * Usage: Cancel buttons, secondary actions
 */
export const OutlineButton = forwardRef<HTMLButtonElement, OutlineButtonProps>(
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
        variant="outline"
        onClick={onClick}
        disabled={isDisabled}
        className={`
          bg-white text-black
          hover:bg-gray-50
          transition-colors duration-200
          cursor-pointer
          px-4 py-5
          rounded-full
          text-base font-semibold uppercase
          !shadow-[inset_0_0_0_1px_#F0F0F0]
          disabled:opacity-70 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {isLoading ? loadingText : children}
      </Button>
    );
  }
);

OutlineButton.displayName = 'OutlineButton';
