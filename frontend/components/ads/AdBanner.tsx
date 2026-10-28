'use client';

import { IMAGE_SIZES } from '@/lib/constants';
import { Box, Text } from '@radix-ui/themes';
import Image from 'next/image';

interface AdBannerProps {
  imageUrl?: string;
  href?: string;
}

export function AdBanner({ imageUrl, href }: AdBannerProps) {
  const content = (
    <Box
      className="relative"
      style={{
        width: '100%',
        height: '250px',
        backgroundColor: '#D1D5DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Advertisement"
          fill
          sizes={IMAGE_SIZES.adBanner}
          style={{
            objectFit: 'cover',
          }}
        />
      ) : (
        <Text size="8" weight="bold" style={{ color: '#6B7280' }}>
          ADS
        </Text>
      )}
    </Box>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }

  return content;
}
