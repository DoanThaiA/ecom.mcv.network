import type { ImgHTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProductImage } from '@/components/common/ProductImage';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';

interface MockNextImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width'> {
  src: string;
  width?: number;
  loader?: (_options: {
    src: string;
    width: number;
    quality?: number;
  }) => string;
  quality?: number;
  priority?: boolean;
}

vi.mock('next/image', () => ({
  default: ({
    src,
    width = 384,
    height,
    alt,
    loader,
    quality,
    onError,
    sizes,
    loading,
    priority,
  }: MockNextImageProps) => {
    const resolvedSrc = loader ? loader({ src, width, quality }) : src;
    return (
      <img
        src={resolvedSrc}
        width={width}
        height={height}
        alt={alt}
        onError={onError}
        sizes={sizes}
        loading={loading}
        data-has-loader={loader ? 'true' : 'false'}
        data-priority={priority ? 'true' : 'false'}
      />
    );
  },
}));

const SOURCE_URL =
  'https://pos.nvncdn.com/312d68-57499/ps/Chan-vay-Viona.jpg?v=1773115674';

describe('ProductImage CChat CDN integration', () => {
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

  it('routes an allowlisted product image through the CDN', () => {
    render(
      <ProductImage
        src={SOURCE_URL}
        alt="Product"
        width={384}
        height={576}
        quality={100}
      />
    );

    const image = screen.getByRole('img', { name: 'Product' });
    const imageUrl = new URL(image.getAttribute('src') ?? '');

    expect(image).toHaveAttribute('data-has-loader', 'true');
    expect(imageUrl.pathname).toBe('/cchat-images/image');
    expect(imageUrl.searchParams.get('url')).toBe(SOURCE_URL);
    expect(imageUrl.searchParams.get('q')).toBe('75');
  });

  it('keeps the existing Next.js path when the flag is disabled', () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = 'false';

    render(
      <ProductImage
        src={SOURCE_URL}
        alt="Product"
        width={384}
        height={576}
      />
    );

    const image = screen.getByRole('img', { name: 'Product' });
    expect(image).toHaveAttribute('data-has-loader', 'false');
    expect(image).toHaveAttribute('src', SOURCE_URL);
  });

  it('removes the CDN loader when falling back to the local image', () => {
    render(
      <ProductImage
        src={SOURCE_URL}
        alt="Product"
        width={384}
        height={576}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: 'Product' }));

    const fallback = screen.getByRole('img', { name: 'Product' });
    expect(fallback).toHaveAttribute('data-has-loader', 'false');
    expect(fallback).toHaveAttribute('src', DEFAULT_PRODUCT_IMAGE);
  });

  it('preserves responsive and priority image behavior', () => {
    render(
      <ProductImage
        src={SOURCE_URL}
        alt="Product"
        fill
        sizes="(max-width: 640px) 50vw, 20vw"
        loading="eager"
        priority
      />
    );

    const image = screen.getByRole('img', { name: 'Product' });
    expect(image).toHaveAttribute('sizes', '(max-width: 640px) 50vw, 20vw');
    expect(image).not.toHaveAttribute('loading');
    expect(image).toHaveAttribute('data-priority', 'true');
  });

  it('normalizes Nhanh thumbnail path when passed to ProductImage', () => {
    const thumbUrl =
      'https://pos.nvncdn.com/312d68-57499/ps/thumb/Chan-vay-Viona.jpg?v=1773115674';
    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED = 'false';

    render(
      <ProductImage
        src={thumbUrl}
        alt="Product"
        width={384}
        height={576}
      />
    );

    const image = screen.getByRole('img', { name: 'Product' });
    expect(image).toHaveAttribute('src', SOURCE_URL);
  });
});
