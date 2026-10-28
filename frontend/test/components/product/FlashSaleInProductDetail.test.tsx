import { act, render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashSaleInProductDetail } from '@/components/product/FlashSaleInProductDetail';

vi.mock('@/lib/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isIntersecting: false,
  }),
}));

vi.mock('@/lib/hooks/useScrollToHash', () => ({
  useScrollToHash: vi.fn(),
}));

describe('FlashSaleInProductDetail', () => {
  const now = new Date('2024-01-01T12:00:00Z');

  const renderFlashSale = (
    props: Partial<React.ComponentProps<typeof FlashSaleInProductDetail>> = {}
  ) =>
    render(
      <Theme>
        <FlashSaleInProductDetail
          title="Flash Sale"
          seeAllText="See All"
          endsInText="Ends in"
          endTime={new Date('2024-01-01T12:00:10Z')}
          {...props}
        />
      </Theme>
    );

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the overlay and supplied countdown label', () => {
    renderFlashSale();

    expect(
      screen.getByRole('img', { name: 'Flash Sale Content Overlay' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ends in:')).toBeInTheDocument();
  });

  it.each([
    ['Date', new Date('2024-01-01T12:00:10Z')],
    ['date string', '2024-01-01T12:00:10Z'],
  ])('starts a countdown for a future %s', (_kind, endTime) => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    renderFlashSale({ endTime });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(setIntervalSpy).toHaveBeenCalledOnce();
  });

  it('ticks the countdown after one second', () => {
    renderFlashSale();
    expect(screen.getByText('10')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument();
  });

  it('reaches 00:00:00 at expiry', () => {
    renderFlashSale({ endTime: new Date('2024-01-01T12:00:02Z') });
    expect(screen.getByText('02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getAllByText('00')).toHaveLength(3);
  });

  it('keeps an invalid date at 00:00:00', () => {
    renderFlashSale({ endTime: 'not-a-date' });

    expect(screen.getAllByText('00')).toHaveLength(3);
  });

  it('renders no countdown and starts no interval when showTimer is false', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    renderFlashSale({ showTimer: false });

    expect(screen.queryByText('Ends in:')).not.toBeInTheDocument();
    expect(screen.queryByText(':')).not.toBeInTheDocument();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('clears the countdown interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderFlashSale();

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
