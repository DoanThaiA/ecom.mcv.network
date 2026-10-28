'use client';

import { Box, Text, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Gallery layout - based on 640px design width
// Heights: double rows = 320px, single rows = 426px
// Gaps: 16px between rows, 8px between images in same row
const GALLERY_ROWS = [
  // Row 1: 2 images 50-50 (320px each in design)
  {
    type: 'double',
    height: 320,
    images: [
      { src: '/assets/images/gallery-row1-left.png', alt: 'CCHAT Store' },
      { src: '/assets/images/gallery-row1-right.png', alt: 'CCHAT Store' },
    ],
  },
  // Row 2: 1 full width image
  {
    type: 'single',
    height: 426,
    images: [
      { src: '/assets/images/gallery-row2-full.png', alt: 'CCHAT Store' },
    ],
  },
  // Row 3: 66%-34% (425px-215px in design)
  {
    type: 'double-66-34',
    height: 320,
    images: [
      { src: '/assets/images/gallery-row3-left.png', alt: 'CCHAT Store' },
      { src: '/assets/images/gallery-row3-right.png', alt: 'CCHAT Store' },
    ],
  },
  // Row 4: 2 images 50-50
  {
    type: 'double',
    height: 320,
    images: [
      { src: '/assets/images/gallery-row4-left.png', alt: 'CCHAT Store' },
      { src: '/assets/images/gallery-row4-right.png', alt: 'CCHAT Store' },
    ],
  },
  // Row 5: 1 full width image
  {
    type: 'single',
    height: 426,
    images: [
      { src: '/assets/images/gallery-row5-full.png', alt: 'CCHAT Store' },
    ],
  },
  // Row 6: 34%-66% (215px-425px in design)
  {
    type: 'double-34-66',
    height: 320,
    images: [
      { src: '/assets/images/gallery-row6-left.png', alt: 'CCHAT Store' },
      { src: '/assets/images/gallery-row6-right.png', alt: 'CCHAT Store' },
    ],
  },
];

export function GallerySection() {
  const t = useTranslations('locations');

  return (
    <Box>
      {/* Title */}
      <Flex align="start" className="py-6 gap-4">
        <Text className="flex-1 text-black font-semibold text-2xl leading-8">
          {t('galleryTitle')}
        </Text>
      </Flex>

      {/* Gallery Grid - gap-4 = 16px between rows */}
      <Flex direction="column" gap="4" className="pb-8">
        {GALLERY_ROWS.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            className="w-full overflow-hidden"
            style={{ height: row.height }}
          >
            {row.type === 'single' && (
              <Box className="relative w-full h-full">
                <Image
                  src={row.images[0].src}
                  alt={row.images[0].alt}
                  fill
                  className="object-cover"
                  sizes="800px"
                  quality={100}
                                  />
              </Box>
            )}

            {row.type === 'double' && (
              <Flex className="h-full gap-2">
                {row.images.map((img, imgIndex) => (
                  <Box key={imgIndex} className="relative flex-1 h-full">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="400px"
                      quality={100}
                                          />
                  </Box>
                ))}
              </Flex>
            )}

            {row.type === 'double-66-34' && (
              <Flex className="h-full gap-2">
                <Box
                  className="relative h-full"
                  style={{ width: 'calc(66.4% - 4px)' }}
                >
                  <Image
                    src={row.images[0].src}
                    alt={row.images[0].alt}
                    fill
                    className="object-cover"
                    sizes="500px"
                    quality={100}
                                      />
                </Box>
                <Box
                  className="relative h-full"
                  style={{ width: 'calc(33.6% - 4px)' }}
                >
                  <Image
                    src={row.images[1].src}
                    alt={row.images[1].alt}
                    fill
                    className="object-cover"
                    sizes="300px"
                    quality={100}
                                      />
                </Box>
              </Flex>
            )}

            {row.type === 'double-34-66' && (
              <Flex className="h-full gap-2">
                <Box
                  className="relative h-full"
                  style={{ width: 'calc(33.6% - 4px)' }}
                >
                  <Image
                    src={row.images[0].src}
                    alt={row.images[0].alt}
                    fill
                    className="object-cover"
                    sizes="300px"
                    quality={100}
                                      />
                </Box>
                <Box
                  className="relative h-full"
                  style={{ width: 'calc(66.4% - 4px)' }}
                >
                  <Image
                    src={row.images[1].src}
                    alt={row.images[1].alt}
                    fill
                    className="object-cover"
                    sizes="500px"
                    quality={100}
                                      />
                </Box>
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
