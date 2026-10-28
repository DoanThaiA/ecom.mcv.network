import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PageTitleProvider, usePageTitle } from 'src/contexts/page-title-context';

describe('PageTitleContext', () => {
  describe('PageTitleProvider', () => {
    it('provides context to children', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('title');
      expect(result.current).toHaveProperty('setTitle');
    });

    it('initializes with empty title', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      expect(result.current.title).toBe('');
    });

    it('updates title when setTitle is called', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      act(() => { result.current.setTitle('New Title'); });
      expect(result.current.title).toBe('New Title');
    });

    it('replaces title on subsequent calls', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      act(() => { result.current.setTitle('First'); });
      expect(result.current.title).toBe('First');
      act(() => { result.current.setTitle('Second'); });
      expect(result.current.title).toBe('Second');
    });

    it('handles empty string title', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      act(() => { result.current.setTitle('Test'); });
      act(() => { result.current.setTitle(''); });
      expect(result.current.title).toBe('');
    });

    it('memoizes context value', () => {
      const { result, rerender } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      const firstSetTitle = result.current.setTitle;
      rerender();
      expect(result.current.setTitle).toBe(firstSetTitle);
    });
  });

  describe('usePageTitle', () => {
    it('throws error when used outside provider', () => {
      expect(() => { renderHook(() => usePageTitle()); }).toThrow('usePageTitle must be used within PageTitleProvider');
    });

    it('returns context when inside provider', () => {
      const { result } = renderHook(() => usePageTitle(), { wrapper: PageTitleProvider });
      expect(result.current).toBeDefined();
      expect(typeof result.current.setTitle).toBe('function');
      expect(typeof result.current.title).toBe('string');
    });
  });
});
