import { useState, useCallback, useMemo } from 'react';

import type { RangeValue } from '../types';

type FilterValue = string | number | boolean | null | undefined | RangeValue;

export interface FilterState {
  [key: string]: FilterValue;
}

interface UseFilterStateOptions<T extends FilterState> {
  initialValues: T;
  onChange?: (filters: T) => void;
}

interface UseFilterStateReturn<T extends FilterState> {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  reset: () => void;
  activeCount: number;
}

function isRangeValue(value: unknown): value is RangeValue {
  return typeof value === 'object' && value !== null && ('from' in value || 'to' in value);
}

function isEmptyValue(value: FilterValue): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value === 'boolean') return false;
  if (isRangeValue(value)) {
    return value.from === undefined && value.to === undefined;
  }
  return false;
}

export function useFilterState<T extends FilterState>(
  options: UseFilterStateOptions<T>
): UseFilterStateReturn<T> {
  const { initialValues, onChange } = options;
  const [values, setValuesState] = useState<T>(initialValues);

  const setValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValuesState((prev) => {
        const next = { ...prev, [key]: value };
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => {
        const next = { ...prev, ...newValues };
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    onChange?.(initialValues);
  }, [initialValues, onChange]);

  const activeCount = useMemo(() => {
    let count = 0;
    Object.values(values).forEach((value) => {
      if (!isEmptyValue(value)) {
        count += 1;
      }
    });
    return count;
  }, [values]);

  return {
    values,
    setValue,
    setValues,
    reset,
    activeCount,
  };
}
