'use client';

import { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import type { ReviewRating } from '@/lib/utils/reviewConverter';

interface StarRatingProps {
  value: ReviewRating | 0;
  onChange?: (_rating: ReviewRating) => void;
  disabled?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  readOnly?: boolean;
}

const sizeMap = {
  tiny: 13,
  small: 16,
  medium: 24,
  large: 32,
};

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = 'medium',
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const stars = [1, 2, 3, 4, 5] as const;
  const starSize = sizeMap[size];
  const isInteractive = !readOnly && !disabled && onChange;

  const handleClick = (star: ReviewRating) => {
    if (isInteractive && onChange) {
      onChange(star);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, star: ReviewRating) => {
    if (!isInteractive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onChange) onChange(star);
    } else if (e.key === 'ArrowRight' && star < 5) {
      e.preventDefault();
      if (onChange) onChange((star + 1) as ReviewRating);
    } else if (e.key === 'ArrowLeft' && star > 1) {
      e.preventDefault();
      if (onChange) onChange((star - 1) as ReviewRating);
    }
  };

  return (
    <Flex gap="1" align="center">
      {stars.map((star) => {
        const isFilled = (hoverRating || value) >= star;
        const Icon = isFilled ? StarFilledIcon : StarIcon;

        if (readOnly) {
          return (
            <Box key={star}>
              <Icon
                width={starSize}
                height={starSize}
                color={isFilled ? '#FAA63E' : '#D1D5DB'}
              />
            </Box>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            disabled={disabled}
            className={`${
              isInteractive
                ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FAA63E] focus:ring-offset-1 rounded transition-transform hover:scale-110'
                : 'cursor-default'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            tabIndex={isInteractive ? 0 : -1}
          >
            <Icon
              width={starSize}
              height={starSize}
              color={isFilled ? '#FAA63E' : '#D1D5DB'}
            />
          </button>
        );
      })}
    </Flex>
  );
}
