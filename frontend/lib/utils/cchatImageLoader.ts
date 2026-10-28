import type { ImageLoaderProps } from 'next/image';

const CCHAT_IMAGE_PATH = '/cchat-images/image';
const ALLOWED_SOURCE_HOSTNAME = 'pos.nvncdn.com';
const CDN_QUALITY = '75';
const CDN_FORMAT = 'webp';

function getCchatImageCdnBaseUrl(): URL | null {
  const configuredUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

export function isCchatImageSource(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === 'https:' &&
      url.hostname === ALLOWED_SOURCE_HOSTNAME &&
      url.username === '' &&
      url.password === '' &&
      url.port === ''
    );
  } catch {
    return false;
  }
}

export function shouldUseCchatImageLoader(src: string): boolean {
  return (
    process.env.NEXT_PUBLIC_IMAGE_CDN_ENABLED === 'true' &&
    getCchatImageCdnBaseUrl() !== null &&
    isCchatImageSource(src)
  );
}

export function normalizeNhanhImageUrl(src: string): string {
  if (isCchatImageSource(src)) {
    return src.replace('/ps/thumb/', '/ps/');
  }
  return src;
}

export function cchatImageLoader({ src, width }: ImageLoaderProps): string {
  const baseUrl = getCchatImageCdnBaseUrl();
  if (!baseUrl || !isCchatImageSource(src)) return src;

  const cleanSrc = normalizeNhanhImageUrl(src);
  const url = new URL(CCHAT_IMAGE_PATH, baseUrl);
  url.searchParams.set('url', cleanSrc);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', CDN_QUALITY);
  url.searchParams.set('f', CDN_FORMAT);
  return url.toString();
}
