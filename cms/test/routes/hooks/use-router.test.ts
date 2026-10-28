import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks/use-router';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useRouter', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('returns router object', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toBeDefined();
  });

  it('has back method', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toHaveProperty('back');
    expect(typeof result.current.back).toBe('function');
  });

  it('has forward method', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toHaveProperty('forward');
    expect(typeof result.current.forward).toBe('function');
  });

  it('has refresh method', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toHaveProperty('refresh');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('has push method', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toHaveProperty('push');
    expect(typeof result.current.push).toBe('function');
  });

  it('has replace method', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    expect(result.current).toHaveProperty('replace');
    expect(typeof result.current.replace).toBe('function');
  });

  it('back calls navigate(-1)', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.back();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('forward calls navigate(1)', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.forward();
    expect(mockNavigate).toHaveBeenCalledWith(1);
  });

  it('refresh calls navigate(0)', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.refresh();
    expect(mockNavigate).toHaveBeenCalledWith(0);
  });

  it('push calls navigate with href', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.push('/test');
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('push accepts different paths', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.push('/products/123');
    expect(mockNavigate).toHaveBeenCalledWith('/products/123');
  });

  it('replace calls navigate with replace option', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.replace('/new-page');
    expect(mockNavigate).toHaveBeenCalledWith('/new-page', { replace: true });
  });

  it('replace accepts different paths', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.replace('/login');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('returns memoized router object', () => {
    const { result, rerender } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    const firstRouter = result.current;
    rerender();
    expect(result.current).toBe(firstRouter);
  });

  it('exports useRouter function', () => {
    expect(useRouter).toBeDefined();
    expect(typeof useRouter).toBe('function');
  });

  it('multiple method calls work correctly', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });

    result.current.push('/page1');
    result.current.back();
    result.current.forward();

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/page1');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, -1);
    expect(mockNavigate).toHaveBeenNthCalledWith(3, 1);
  });

  it('router methods are stable between renders', () => {
    const { result, rerender } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });

    const { back, forward, refresh, push, replace } = result.current;
    rerender();

    expect(result.current.back).toBe(back);
    expect(result.current.forward).toBe(forward);
    expect(result.current.refresh).toBe(refresh);
    expect(result.current.push).toBe(push);
    expect(result.current.replace).toBe(replace);
  });

  it('uses useNavigate hook', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    result.current.push('/test');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('uses useMemo to memoize router', () => {
    const { result, rerender } = renderHook(() => useRouter(), {
      wrapper: MemoryRouter,
    });
    const router1 = result.current;
    rerender();
    const router2 = result.current;
    expect(router1).toBe(router2);
  });
});
