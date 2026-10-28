'use client';

import { Box } from '@radix-ui/themes';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

interface ProductDescriptionGalleryProps { images: string[]; alt: string; }

export function ProductDescriptionGallery({ images, alt }: ProductDescriptionGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onSelect = useCallback(() => { if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap()); }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  if (!images.length) return null;
  const multiple = images.length > 1;

  return (
    <Box data-description-block="gallery" className="w-full">
      <Box ref={emblaRef} className="aspect-[4/3] overflow-hidden rounded-lg" data-testid="description-gallery-frame">
        <Box className="flex h-full">
          {images.map((src, index) => (
            <Box key={`${src}-${index}`} className="min-w-0 flex-[0_0_100%]">
              <img src={src} alt={`${alt} ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-contain" />
            </Box>
          ))}
        </Box>
      </Box>
      {multiple && (
        <Box className="mt-3 flex items-center justify-center gap-2">
          {images.map((_, index) => <button key={index} type="button" aria-label={`${index + 1}`} aria-current={selectedIndex === index} className={`h-1.5 rounded-full transition-all ${selectedIndex === index ? 'w-5 bg-black' : 'w-1.5 bg-gray-300'}`} onClick={() => emblaApi?.scrollTo(index)} />)}
        </Box>
      )}
    </Box>
  );
}
