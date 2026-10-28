'use client';

import { Flex, Text, TextField } from '@radix-ui/themes';
import { forwardRef, useId } from 'react';

interface LabeledTextFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'password' | 'email' | 'tel';
  error?: string;
  disabled?: boolean;
  onKeyDown?: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  rightElement?: React.ReactNode;
  /** Label display mode: 'above' shows label on top, 'placeholder' shows as input placeholder */
  labelPosition?: 'above' | 'placeholder';
  /** Input mode for mobile keyboards */
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  placeholder?: string;
  /** Autocomplete attribute for browser autofill behavior */
  autoComplete?: string;
}

/**
 * LabeledTextField - Reusable text field with label
 *
 * Specs:
 * - Label: font-size 14px (0.875rem), weight 400, line-height 24px (1.5rem)
 * - Gap between label and input: 4px (0.25rem)
 * - Uses rem for scalability across devices
 * - Responsive: scales well on desktop
 */
export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      type = 'text',
      error,
      disabled = false,
      onKeyDown,
      className = '',
      rightElement,
      labelPosition = 'above',
      inputMode,
      placeholder,
      autoComplete,
    },
    ref
  ) => {
    const isPlaceholder = labelPosition === 'placeholder';
    const inputId = useId();

    return (
      <Flex direction="column" gap="1">
        {/* Label above input (default mode) */}
        {!isPlaceholder && (
          <Text
            as="label"
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: '1.5rem',
              color: '#000000',
            }}
          >
            {label}
          </Text>
        )}

        {/* Input field with optional right element */}
        <div className="relative flex items-center">
          <TextField.Root
            id={inputId}
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder || (isPlaceholder && typeof label === 'string' ? label : undefined)}
            inputMode={inputMode}
            autoComplete={autoComplete}
            className={`w-full ${error ? 'field-error' : ''} ${className}`}
            style={{
              fontSize: '1rem', // 16px minimum to prevent iOS Safari auto-zoom on focus
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #F0F0F0',
              padding: '8px',
            }}
          />
          {rightElement}
        </div>

        {/* Error message */}
        {error && (
          <Text
            size="1"
            style={{
              color: '#FF3B30',
              marginTop: '0.25rem',
            }}
          >
            {error}
          </Text>
        )}
      </Flex>
    );
  }
);

LabeledTextField.displayName = 'LabeledTextField';
