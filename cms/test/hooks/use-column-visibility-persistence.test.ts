import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnVisibilityPersistence } from 'src/hooks/use-column-visibility-persistence';
import { appLocalStorage } from 'src/services/localStorage';

vi.mock('src/services/localStorage', () => ({
  appLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  localStorageKeys: {
    COLUMN_VISIBILITY: 'column_visibility',
  },
}));

describe('useColumnVisibilityPersistence hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state when no saved data', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table'));
    expect(result.current[0]).toEqual({});
  });

  it('loads initial state from localStorage', () => {
    const savedState = { col1: false, col2: true };
    vi.mocked(appLocalStorage.getItem).mockReturnValue(savedState);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table'));
    expect(result.current[0]).toEqual(savedState);
    expect(appLocalStorage.getItem).toHaveBeenCalledWith('column_visibility_test-table');
  });

  it('updates state and saves to localStorage', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table'));

    act(() => {
      result.current[1]({ col1: false });
    });

    expect(result.current[0]).toEqual({ col1: false });
    expect(appLocalStorage.setItem).toHaveBeenCalledWith('column_visibility_test-table', { col1: false });
  });

  it('handles updater function', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue({ col1: true });
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table'));

    act(() => {
      result.current[1]((prev) => ({ ...prev, col2: false }));
    });

    expect(result.current[0]).toEqual({ col1: true, col2: false });
    expect(appLocalStorage.setItem).toHaveBeenCalledWith('column_visibility_test-table', { col1: true, col2: false });
  });

  it('does not save when disabled', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table', false));

    act(() => {
      result.current[1]({ col1: false });
    });

    expect(result.current[0]).toEqual({ col1: false });
    expect(appLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('does not load from localStorage when disabled', () => {
    const savedState = { col1: false };
    vi.mocked(appLocalStorage.getItem).mockReturnValue(savedState);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table', false));

    expect(result.current[0]).toEqual({});
    expect(appLocalStorage.getItem).not.toHaveBeenCalled();
  });

  it('uses unique storage key per table', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
    const { result: result1 } = renderHook(() => useColumnVisibilityPersistence('table-1'));
    const { result: result2 } = renderHook(() => useColumnVisibilityPersistence('table-2'));

    act(() => {
      result1.current[1]({ col1: false });
    });
    act(() => {
      result2.current[1]({ col2: true });
    });

    expect(appLocalStorage.setItem).toHaveBeenCalledWith('column_visibility_table-1', { col1: false });
    expect(appLocalStorage.setItem).toHaveBeenCalledWith('column_visibility_table-2', { col2: true });
  });

  it('saves to localStorage on state change', () => {
    vi.mocked(appLocalStorage.getItem).mockReturnValue(null);
    const { result } = renderHook(() => useColumnVisibilityPersistence('test-table'));

    act(() => {
      result.current[1]({ col1: false });
    });

    // Verify setItem was called with correct arguments
    expect(appLocalStorage.setItem).toHaveBeenCalledWith('column_visibility_test-table', { col1: false });
    expect(appLocalStorage.setItem).toHaveBeenCalledTimes(3); // Initial load + setter + useEffect
  });
});
