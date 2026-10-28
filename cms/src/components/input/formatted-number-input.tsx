import type { TextFieldProps } from '@mui/material';
import { InputAdornment, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { formatCommissionNumber, parseInputNumber } from 'src/utils/format';

// ----------------------------------------------------------------------

interface FormattedNumberInputProps extends Omit<
  TextFieldProps,
  'value' | 'onChange' | 'type' | 'InputProps'
> {
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
  suffix?: string;
  min?: number;
  max?: number;
  allowEmpty?: boolean;
}

/**
 * A TextField component that displays numbers with thousand separators
 * Formats as user types: 1000000 -> "1,000,000"
 */
export function FormattedNumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
  allowEmpty = true,
  disabled,
  ...other
}: FormattedNumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Update display value when external value changes
  useEffect(() => {
    if (value === undefined || value === null) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCommissionNumber(value, 2));
    }
  }, [value]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      // Allow empty input
      if (inputValue === '') {
        setDisplayValue('');
        onChange(allowEmpty ? undefined : 0);
        return;
      }

      // Remove suffix/non-numeric characters, keep digits and at most one decimal separator
      // Commas here are thousand separators (from Intl.NumberFormat en-US), not decimals
      const stripped = inputValue.replace(/[^\d.]/g, '');

      // Prevent multiple decimal separators
      const periodCount = (stripped.match(/\./g) || []).length;
      if (periodCount > 1) {
        return;
      }

      const digitsOnly = stripped;

      if (digitsOnly === '') {
        setDisplayValue('');
        onChange(allowEmpty ? undefined : 0);
        return;
      }

      const normalized = digitsOnly;

      // Parse to number with decimal support
      let numericValue = parseFloat(normalized);

      // Validate numeric value
      if (isNaN(numericValue) || !isFinite(numericValue)) {
        setDisplayValue('');
        onChange(allowEmpty ? undefined : 0);
        return;
      }

      // Round to 2 decimal places for precision
      numericValue = Math.round(numericValue * 100) / 100;

      // Check if input ends with decimal separator (preserve for continued typing)
      const endsWithSeparator = digitsOnly.endsWith('.');

      // Apply min/max constraints
      if (min !== undefined && numericValue < min) {
        numericValue = min;
      }
      if (max !== undefined && numericValue > max) {
        numericValue = max;
      }

      // Update display with formatted value (2 decimal places)
      const formattedValue = formatCommissionNumber(numericValue, 2);

      // If user is in the middle of typing a decimal, preserve the separator
      if (endsWithSeparator) {
        // Always display period (we normalize comma to period internally)
        setDisplayValue(formattedValue + '.');
      } else {
        setDisplayValue(formattedValue);
      }

      onChange(numericValue);
    },
    [onChange, min, max, allowEmpty]
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl/Cmd + A, C, V, X
    if (
      (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())
    ) {
      return;
    }

    // Block non-numeric characters (allow digits and dot for decimals)
    if (!/^[\d.]$/.test(event.key)) {
      event.preventDefault();
    }
  }, []);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData('text');

      // Extract only digits and dots from pasted content (commas are thousand separators)
      const digitsOnly = pastedText.replace(/[^\d.]/g, '');

      if (digitsOnly === '') return;

      const normalized = digitsOnly;

      let numericValue = parseFloat(normalized);

      // Apply min/max constraints
      if (min !== undefined && numericValue < min) {
        numericValue = min;
      }
      if (max !== undefined && numericValue > max) {
        numericValue = max;
      }

      setDisplayValue(formatCommissionNumber(numericValue, 2));
      onChange(numericValue);
    },
    [onChange, min, max]
  );

  return (
    <TextField
      {...other}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      disabled={disabled}
      inputProps={{
        inputMode: 'numeric',
      }}
      InputProps={
        suffix
          ? {
              endAdornment: <InputAdornment position="end">{suffix}</InputAdornment>,
            }
          : undefined
      }
    />
  );
}

export { parseInputNumber };
