import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePathname } from 'src/routes/hooks/use-pathname';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({
    pathname: '/test-path',
  })),
}));

describe('usePathname', () => {
  it('exports usePathname function', () => {
    expect(usePathname).toBeDefined();
    expect(typeof usePathname).toBe('function');
  });

  it('returns current pathname', () => {
    const { result } = renderHook(() => usePathname());
    expect(result.current).toBe('/test-path');
  });

  it('returns string type', () => {
    const { result } = renderHook(() => usePathname());
    expect(typeof result.current).toBe('string');
  });

  it('uses useLocation hook', async () => {
    const { useLocation } = await import('react-router-dom');
    renderHook(() => usePathname());
    expect(useLocation).toHaveBeenCalled();
  });

  it('memoizes pathname', () => {
    const { result, rerender } = renderHook(() => usePathname());
    const firstResult = result.current;
    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('handles different pathname values', async () => {
    const { useLocation } = await import('react-router-dom');
    vi.mocked(useLocation).mockReturnValue({ pathname: '/another-path' } as any);
    const { result } = renderHook(() => usePathname());
    expect(result.current).toBe('/another-path');
  });

  it('handles root pathname', async () => {
    const { useLocation } = await import('react-router-dom');
    vi.mocked(useLocation).mockReturnValue({ pathname: '/' } as any);
    const { result } = renderHook(() => usePathname());
    expect(result.current).toBe('/');
  });

  it('handles nested pathname', async () => {
    const { useLocation } = await import('react-router-dom');
    vi.mocked(useLocation).mockReturnValue({ pathname: '/users/123/profile' } as any);
    const { result } = renderHook(() => usePathname());
    expect(result.current).toBe('/users/123/profile');
  });

  it('is a custom React hook', () => {
    expect(usePathname.name).toBe('usePathname');
  });
});
