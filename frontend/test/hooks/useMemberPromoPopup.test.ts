import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMemberPromoPopup } from '@/hooks/useMemberPromoPopup';
import { storageService } from '@/lib/services/storage.service';

vi.mock('@/lib/services/storage.service', () => ({
  storageService: {
    isMemberPromoDismissed: vi.fn(),
    setMemberPromoDismissed: vi.fn(),
  },
}));

describe('useMemberPromoPopup while the popup is disabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { isAuthenticated: false, isMounted: false },
    { isAuthenticated: false, isMounted: true },
    { isAuthenticated: true, isMounted: false },
    { isAuthenticated: true, isMounted: true },
  ])(
    'keeps showPromoPopup false for auth=$isAuthenticated and mounted=$isMounted',
    ({ isAuthenticated, isMounted }) => {
      const { result } = renderHook(() =>
        useMemberPromoPopup(isAuthenticated, isMounted)
      );

      expect(result.current.showPromoPopup).toBe(false);
    }
  );

  it('remains false when authentication and mount state change', () => {
    const { result, rerender } = renderHook(
      ({ isAuthenticated, isMounted }) =>
        useMemberPromoPopup(isAuthenticated, isMounted),
      {
        initialProps: { isAuthenticated: false, isMounted: false },
      }
    );

    expect(result.current.showPromoPopup).toBe(false);

    rerender({ isAuthenticated: false, isMounted: true });
    expect(result.current.showPromoPopup).toBe(false);

    rerender({ isAuthenticated: true, isMounted: true });
    expect(result.current.showPromoPopup).toBe(false);
  });

  it('persists dismissal once when handleClosePromoPopup is called', () => {
    const { result } = renderHook(() => useMemberPromoPopup(false, true));

    act(() => {
      result.current.handleClosePromoPopup();
    });

    expect(storageService.setMemberPromoDismissed).toHaveBeenCalledOnce();
    expect(result.current.showPromoPopup).toBe(false);
  });

  it('does not read dismissed state', () => {
    renderHook(() => useMemberPromoPopup(false, true));

    expect(storageService.isMemberPromoDismissed).not.toHaveBeenCalled();
  });

  it('does not register a scroll listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useMemberPromoPopup(false, true));

    expect(
      addEventListenerSpy.mock.calls.some(([eventName]) => eventName === 'scroll')
    ).toBe(false);
  });

  it('does not start timers', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    renderHook(() => useMemberPromoPopup(false, true));

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});
