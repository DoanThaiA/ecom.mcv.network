import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  scrollElementHorizontallyIntoView,
  scrollWindowToTopInstantly,
} from '@/lib/utils/dom';

const createRect = (left: number, right: number): DOMRect =>
  ({
    bottom: 20,
    height: 20,
    left,
    right,
    top: 0,
    width: right - left,
    x: left,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

describe('DOM scroll utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resets the viewport instantly', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollWindowToTopInstantly();

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  it('scrolls a horizontal rail left when the element is clipped', () => {
    const container = document.createElement('div');
    const element = document.createElement('button');

    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 200 },
      scrollLeft: { configurable: true, value: 40, writable: true },
    });
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(
      createRect(100, 300),
    );
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
      createRect(80, 120),
    );

    scrollElementHorizontallyIntoView(container, element);

    expect(container.scrollLeft).toBe(20);
  });

  it('scrolls a horizontal rail right when the element is clipped', () => {
    const container = document.createElement('div');
    const element = document.createElement('button');

    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 200 },
      scrollLeft: { configurable: true, value: 40, writable: true },
    });
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(
      createRect(100, 300),
    );
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
      createRect(280, 340),
    );

    scrollElementHorizontallyIntoView(container, element);

    expect(container.scrollLeft).toBe(80);
  });

  it('does not scroll when the element is already visible', () => {
    const container = document.createElement('div');
    const element = document.createElement('button');

    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 200 },
      scrollLeft: { configurable: true, value: 40, writable: true },
    });
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(
      createRect(100, 300),
    );
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
      createRect(140, 220),
    );

    scrollElementHorizontallyIntoView(container, element);

    expect(container.scrollLeft).toBe(40);
  });

  it('ignores hidden rails', () => {
    const container = document.createElement('div');
    const element = document.createElement('button');

    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 0 },
      scrollLeft: { configurable: true, value: 40, writable: true },
    });

    scrollElementHorizontallyIntoView(container, element);

    expect(container.scrollLeft).toBe(40);
  });
});
