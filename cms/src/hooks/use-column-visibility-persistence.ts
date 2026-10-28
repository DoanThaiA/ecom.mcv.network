import { useEffect, useState, useCallback } from 'react';
import type { VisibilityState } from '@tanstack/react-table';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';

/**
 * Custom hook to persist column visibility state to localStorage
 * Automatically saves and loads column visibility settings
 *
 * @param tableKey - Unique identifier for the table (e.g., 'product-table', 'inventory-table')
 * @param enabled - Whether to enable persistence (default: true)
 * @returns [columnVisibility state, setColumnVisibility function]
 *
 * @example
 * const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('product-table');
 *
 * const table = useReactTable({
 *   // ...
 *   state: { columnVisibility },
 *   onColumnVisibilityChange: setColumnVisibility,
 * });
 */
export function useColumnVisibilityPersistence(
  tableKey: string,
  enabled: boolean = true
): [
  VisibilityState,
  (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void,
] {
  // Generate storage key based on table identifier
  const storageKey = `${localStorageKeys.COLUMN_VISIBILITY}_${tableKey}`;

  // Load initial state from localStorage
  const [columnVisibility, setColumnVisibilityState] = useState<VisibilityState>(() => {
    if (!enabled) return {};

    const savedState = appLocalStorage.getItem<VisibilityState>(storageKey);
    return savedState || {};
  });

  // Wrapper function to handle both direct values and updater functions
  const setColumnVisibility = useCallback(
    (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      setColumnVisibilityState((prevState) => {
        const newState = typeof updater === 'function' ? updater(prevState) : updater;

        // Save to localStorage if enabled
        if (enabled) {
          appLocalStorage.setItem(storageKey, newState);
        }

        return newState;
      });
    },
    [enabled, storageKey]
  );

  // Save to localStorage whenever columnVisibility changes
  useEffect(() => {
    if (enabled) {
      appLocalStorage.setItem(storageKey, columnVisibility);
    }
  }, [columnVisibility, enabled, storageKey]);

  return [columnVisibility, setColumnVisibility];
}
