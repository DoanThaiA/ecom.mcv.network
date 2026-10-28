import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog } from 'src/hooks/use-dialog';

describe('useDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with closed state', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('opens dialog without data', () => {
    const { result } = renderHook(() => useDialog());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('opens dialog with data', () => {
    const { result } = renderHook(() => useDialog<string>());
    act(() => {
      result.current.open('test data');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test data');
  });

  it('closes dialog', () => {
    const { result } = renderHook(() => useDialog());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('clears data after 300ms when closing', () => {
    const { result } = renderHook(() => useDialog<string>());
    act(() => {
      result.current.open('test data');
    });
    expect(result.current.data).toBe('test data');

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBe('test data');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.data).toBeNull();
  });

  it('handles object data', () => {
    const { result } = renderHook(() => useDialog<{ id: number; name: string }>());
    const testData = { id: 1, name: 'Test' };
    
    act(() => {
      result.current.open(testData);
    });
    expect(result.current.data).toEqual(testData);
  });

  it('handles array data', () => {
    const { result } = renderHook(() => useDialog<number[]>());
    const testData = [1, 2, 3];
    
    act(() => {
      result.current.open(testData);
    });
    expect(result.current.data).toEqual(testData);
  });

  it('open callback is stable', () => {
    const { result, rerender } = renderHook(() => useDialog());
    const firstOpen = result.current.open;
    
    rerender();
    expect(result.current.open).toBe(firstOpen);
  });

  it('close callback is stable', () => {
    const { result, rerender } = renderHook(() => useDialog());
    const firstClose = result.current.close;
    
    rerender();
    expect(result.current.close).toBe(firstClose);
  });

  it('can open dialog multiple times with different data', () => {
    const { result } = renderHook(() => useDialog<string>());
    
    act(() => {
      result.current.open('first');
    });
    expect(result.current.data).toBe('first');

    act(() => {
      result.current.close();
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.open('second');
    });
    expect(result.current.data).toBe('second');
  });

  it('returns all required properties', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current).toHaveProperty('isOpen');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('open');
    expect(result.current).toHaveProperty('close');
  });

  it('open and close are functions', () => {
    const { result } = renderHook(() => useDialog());
    expect(typeof result.current.open).toBe('function');
    expect(typeof result.current.close).toBe('function');
  });

  it('handles undefined data explicitly', () => {
    const { result } = renderHook(() => useDialog<string>());
    act(() => {
      result.current.open(undefined);
    });
    expect(result.current.data).toBeNull();
  });

  it('data persists during open state', () => {
    const { result } = renderHook(() => useDialog<string>());
    act(() => {
      result.current.open('persistent');
    });
    
    expect(result.current.data).toBe('persistent');
    expect(result.current.isOpen).toBe(true);
    
    // Advance time but don't close
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.data).toBe('persistent');
  });

  it('can reopen before timeout completes', () => {
    const { result } = renderHook(() => useDialog<string>());
    
    act(() => {
      result.current.open('first');
    });
    
    act(() => {
      result.current.close();
    });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.open('second');
    });
    
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('second');
  });

  it('handles generic type parameter', () => {
    interface TestData {
      id: number;
      value: string;
    }
    
    const { result } = renderHook(() => useDialog<TestData>());
    const data: TestData = { id: 123, value: 'test' };
    
    act(() => {
      result.current.open(data);
    });
    
    expect(result.current.data?.id).toBe(123);
    expect(result.current.data?.value).toBe('test');
  });
});
