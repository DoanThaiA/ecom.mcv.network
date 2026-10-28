import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cchatImageLoader,
  isCchatImageSource,
  normalizeNhanhImageUrl,
  shouldUseCchatImageLoader,
} from '@/lib/utils/cchatImageLoader';

const SOURCE_URL =
  'https://pos.nvncdn.com/312d68-57499/ps/Chan-vay-Viona.jpg?v=1773115674';
const THUMB_URL =
  'https://pos.nvncdn.com/312d68-57499/ps/thumb/Chan-vay-Viona.jpg?v=1773115674';

describe('cchatImageLoader', () => {
  const originalEnabled = process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED;
  const originalUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = 'true';
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'https://cdn1.mmenu.io';
  });

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = originalEnabled;
    }

    if (originalUrl === undefined) {
      delete process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
    } else {
      process.env.NEXT_PUBLIC_IMAGE_CDN_URL = originalUrl;
    }
  });

  it('builds the phase 1 CDN URL and preserves the source version', () => {
    const result = cchatImageLoader({
      src: SOURCE_URL,
      width: 384,
      quality: 100,
    });
    const resultUrl = new URL(result);

    expect(resultUrl.origin).toBe('https://cdn1.mmenu.io');
    expect(resultUrl.pathname).toBe('/cchat-images/image');
    expect(resultUrl.searchParams.get('url')).toBe(SOURCE_URL);
    expect(resultUrl.searchParams.get('w')).toBe('384');
    expect(resultUrl.searchParams.get('q')).toBe('75');
    expect(resultUrl.searchParams.get('f')).toBe('webp');
  });

  it('only accepts HTTPS images from the exact NVN hostname', () => {
    expect(isCchatImageSource(SOURCE_URL)).toBe(true);
    expect(isCchatImageSource('http://pos.nvncdn.com/image.jpg')).toBe(false);
    expect(isCchatImageSource('https://cdn.pos.nvncdn.com/image.jpg')).toBe(false);
    expect(isCchatImageSource('https://example.com/image.jpg')).toBe(false);
    expect(isCchatImageSource('/images/fallback.webp')).toBe(false);
  });

  it('uses the CDN only when the flag and HTTPS CDN URL are valid', () => {
    expect(shouldUseCchatImageLoader(SOURCE_URL)).toBe(true);

    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = 'false';
    expect(shouldUseCchatImageLoader(SOURCE_URL)).toBe(false);

    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = 'true';
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'http://cdn1.mmenu.io';
    expect(shouldUseCchatImageLoader(SOURCE_URL)).toBe(false);

    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'not-a-url';
    expect(shouldUseCchatImageLoader(SOURCE_URL)).toBe(false);
  });

  it('strips /ps/thumb/ to /ps/ in cchatImageLoader so CDN receives the full-resolution image', () => {
    const result = cchatImageLoader({
      src: THUMB_URL,
      width: 1200,
      quality: 100,
    });
    const resultUrl = new URL(result);

    expect(resultUrl.origin).toBe('https://cdn1.mmenu.io');
    expect(resultUrl.pathname).toBe('/cchat-images/image');
    expect(resultUrl.searchParams.get('url')).toBe(SOURCE_URL);
    expect(resultUrl.searchParams.get('w')).toBe('1200');
    expect(resultUrl.searchParams.get('q')).toBe('75');
    expect(resultUrl.searchParams.get('f')).toBe('webp');
  });

  it('normalizes Nhanh image URLs by stripping /thumb/ directory', () => {
    expect(normalizeNhanhImageUrl(THUMB_URL)).toBe(SOURCE_URL);
    expect(normalizeNhanhImageUrl(SOURCE_URL)).toBe(SOURCE_URL);
    expect(normalizeNhanhImageUrl('https://example.com/ps/thumb/test.jpg')).toBe(
      'https://example.com/ps/thumb/test.jpg'
    );
  });

  it('returns unsupported sources unchanged as a safety fallback', () => {
    expect(
      cchatImageLoader({
        src: 'https://example.com/image.jpg',
        width: 384,
      })
    ).toBe('https://example.com/image.jpg');
  });
});
