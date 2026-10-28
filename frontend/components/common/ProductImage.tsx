'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';
import {
  cchatImageLoader,
  normalizeNhanhImageUrl,
  shouldUseCchatImageLoader,
} from '@/lib/utils/cchatImageLoader';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * ProductImage - A wrapper around Next.js Image with fallback handling
 *
 * Features:
 * - Automatic format optimization via Next.js Image (avif/webp)
 * - Fallback to DEFAULT_PRODUCT_IMAGE on error
 */
export function ProductImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className,
  quality = 80,
  loading = 'lazy',
  priority = false,
  onError,
  style,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  }, [hasError, onError]);

  const normalizedSrc = useMemo(() => {
    if (hasError || !src || src.trim() === '') {
      return DEFAULT_PRODUCT_IMAGE;
    }
    return normalizeNhanhImageUrl(src);
  }, [src, hasError]);

  const useCchatImageCdn = shouldUseCchatImageLoader(normalizedSrc);

  const imageProps: ImageProps = {
    src: normalizedSrc,
    alt,
    className,
    quality,
    loading: priority ? undefined : loading,
    priority,
    onError: handleError,
    style,
    loader: useCchatImageCdn ? cchatImageLoader : undefined,
  };

  if (fill) {
    return <Image {...imageProps} fill sizes={sizes} />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
    />
  );
}
