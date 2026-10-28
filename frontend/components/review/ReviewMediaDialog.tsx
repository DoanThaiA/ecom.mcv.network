'use client';

import { useState } from 'react';
import { Box, Dialog, Flex, Text } from '@radix-ui/themes';
import { Cross2Icon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { FrontendReview as Review } from '@/lib/utils/reviewConverter';

interface ReviewMediaDialogProps {
  review: Review;
  initialMediaIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewMediaDialog({
  review,
  initialMediaIndex,
  open,
  onOpenChange,
}: ReviewMediaDialogProps) {
  const t = useTranslations('reviews');
  const [currentIndex, setCurrentIndex] = useState(initialMediaIndex);

  if (!review.images || review.images.length === 0) {
    return null;
  }

  const currentMedia = review.images[currentIndex];
  const totalMedia = review.images.length;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalMedia - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalMedia - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="max-w-[600px] p-0 bg-white rounded-2xl"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          onOpenChange(false);
        }}
      >
        {/* Header */}
        <Flex
          justify="between"
          align="center"
          className="px-6 py-4 border-b border-[#F0F0F0]"
        >
          <Text size="4" weight="bold" className="text-black">
            {t('dialog.title')}
          </Text>
          <button
            onClick={() => onOpenChange(false)}
            className="text-[#999999] hover:text-black transition-colors"
            aria-label={t('dialog.close')}
          >
            <Cross2Icon className="w-6 h-6" />
          </button>
        </Flex>

        <Dialog.Title className="sr-only">{t('dialog.title')}</Dialog.Title>

        {/* Content */}
        <Box className="p-6">
          {/* Media Display - Image or Video */}
          <Box className="relative w-full aspect-square bg-[#AFAFAF] rounded-lg overflow-hidden mb-4">
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                className="w-full h-full object-contain"
                autoPlay
              />
            ) : (
              <Image
                src={currentMedia.url}
                alt={`Review media ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            )}
          </Box>

          {/* Navigation Controls */}
          {totalMedia > 1 && (
            <Flex justify="center" align="center" gap="4" className="mb-4">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-colors bg-white"
                aria-label={t('dialog.previous')}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <Text size="2" className="text-[#666666]">
                {currentIndex + 1} / {totalMedia}
              </Text>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-colors bg-white"
                aria-label={t('dialog.next')}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </Flex>
          )}

          {/* Thumbnail Gallery */}
          {totalMedia > 1 && (
            <Flex gap="2" wrap="wrap" justify="center">
              {review.images.map((media, index) => (
                <button
                  key={media.id || index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all bg-[#AFAFAF] ${
                    index === currentIndex
                      ? 'ring-2 ring-black'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={
                      media.type === 'video'
                        ? media.thumbnail || media.url
                        : media.url
                    }
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </Flex>
          )}
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}
