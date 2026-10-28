import { describe, it, expect, vi } from 'vitest';
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
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('returns router object', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('has back method', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current.back).toBeDefined();
    expect(typeof result.current.back).toBe('function');
  });

  it('has forward method', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current.forward).toBeDefined();
    expect(typeof result.current.forward).toBe('function');
  });

  it('has refresh method', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('has push method', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current.push).toBeDefined();
    expect(typeof result.current.push).toBe('function');
  });

  it('has replace method', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(result.current.replace).toBeDefined();
    expect(typeof result.current.replace).toBe('function');
  });

  it('back calls navigate with -1', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.back();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('forward calls navigate with 1', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.forward();
    expect(mockNavigate).toHaveBeenCalledWith(1);
  });

  it('refresh calls navigate with 0', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.refresh();
    expect(mockNavigate).toHaveBeenCalledWith(0);
  });

  it('push calls navigate with href', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.push('/test');
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('replace calls navigate with href and replace option', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.replace('/test');
    expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: true });
  });

  it('push handles different paths', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.push('/products');
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    
    result.current.push('/users/123');
    expect(mockNavigate).toHaveBeenCalledWith('/users/123');
  });

  it('replace handles different paths', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.replace('/products');
    expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    
    result.current.replace('/users/123');
    expect(mockNavigate).toHaveBeenCalledWith('/users/123', { replace: true });
  });

  it('returns memoized router object', () => {
    const { result, rerender } = renderHook(() => useRouter(), { wrapper });
    const firstRouter = result.current;
    rerender();
    expect(result.current).toBe(firstRouter);
  });

  it('router object has 5 methods', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    expect(Object.keys(result.current)).toHaveLength(5);
  });

  it('handles empty string path in push', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.push('');
    expect(mockNavigate).toHaveBeenCalledWith('');
  });

  it('handles empty string path in replace', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.replace('');
    expect(mockNavigate).toHaveBeenCalledWith('', { replace: true });
  });

  it('handles paths with query params', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.push('/search?q=test');
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test');
  });

  it('handles paths with hash', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.push('/docs#section');
    expect(mockNavigate).toHaveBeenCalledWith('/docs#section');
  });

  it('handles multiple navigation calls', () => {
    const { result } = renderHook(() => useRouter(), { wrapper });
    result.current.back();
    result.current.forward();
    result.current.refresh();
    result.current.push('/test');
    result.current.replace('/test2');
    
    expect(mockNavigate).toHaveBeenCalledTimes(5);
  });
});
