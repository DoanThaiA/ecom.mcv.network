import { describe, it, expect } from 'vitest';
import {
  validateRating,
  validateComment,
  validateHeight,
  validateWeight,
  validateImages,
} from '@/lib/utils/reviewValidation';
import { REVIEW_CONSTANTS } from '@/lib/constants/review';

describe('validateRating', () => {
  it('returns undefined for valid ratings', () => {
    expect(validateRating(1)).toBeUndefined();
    expect(validateRating(2)).toBeUndefined();
    expect(validateRating(3)).toBeUndefined();
    expect(validateRating(4)).toBeUndefined();
    expect(validateRating(5)).toBeUndefined();
  });

  it('returns error for rating below 1', () => {
    expect(validateRating(0)).toBe('ratingRequired');
    expect(validateRating(-1)).toBe('ratingRequired');
  });

  it('returns error for rating above 5', () => {
    expect(validateRating(6)).toBe('ratingRequired');
    expect(validateRating(10)).toBe('ratingRequired');
  });

  it('handles decimal ratings', () => {
    expect(validateRating(3.5)).toBeUndefined();
    expect(validateRating(0.5)).toBe('ratingRequired');
    expect(validateRating(5.5)).toBe('ratingRequired');
  });
});

describe('validateComment', () => {
  it('returns undefined for valid comments', () => {
    expect(validateComment('This is a valid comment')).toBeUndefined();
    expect(validateComment('a'.repeat(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH))).toBeUndefined();
  });

  it('returns error for empty comment', () => {
    expect(validateComment('')).toBe('commentRequired');
  });

  it('returns error for whitespace-only comment', () => {
    expect(validateComment('   ')).toBe('commentRequired');
    expect(validateComment('\t\n  ')).toBe('commentRequired');
  });

  it('returns error for comment exceeding max length', () => {
    const tooLong = 'a'.repeat(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH + 1);
    expect(validateComment(tooLong)).toBe('commentTooLong');
  });

  it('trims whitespace before validation', () => {
    expect(validateComment('  valid comment  ')).toBeUndefined();
  });

  it('handles exactly max length', () => {
    const exactMax = 'a'.repeat(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH);
    expect(validateComment(exactMax)).toBeUndefined();
  });
});

describe('validateHeight', () => {
  it('returns undefined for valid heights', () => {
    expect(validateHeight('170')).toBeUndefined();
    expect(validateHeight('150')).toBeUndefined();
    expect(validateHeight(REVIEW_CONSTANTS.MIN_HEIGHT.toString())).toBeUndefined();
    expect(validateHeight(REVIEW_CONSTANTS.MAX_HEIGHT.toString())).toBeUndefined();
  });

  it('returns error for empty height', () => {
    expect(validateHeight('')).toBe('heightRequired');
    expect(validateHeight('   ')).toBe('heightRequired');
  });

  it('returns error for non-numeric height', () => {
    expect(validateHeight('abc')).toBe('heightInvalid');
    // Note: '170cm' is parsed as 170 by parseFloat, which is valid
  });

  it('returns error for height below minimum', () => {
    expect(validateHeight((REVIEW_CONSTANTS.MIN_HEIGHT - 1).toString())).toBe('heightInvalid');
    expect(validateHeight('0')).toBe('heightInvalid');
  });

  it('returns error for height above maximum', () => {
    expect(validateHeight((REVIEW_CONSTANTS.MAX_HEIGHT + 1).toString())).toBe('heightInvalid');
    expect(validateHeight('300')).toBe('heightInvalid');
  });

  it('handles decimal heights', () => {
    expect(validateHeight('170.5')).toBeUndefined();
  });

  it('handles whitespace', () => {
    expect(validateHeight('  170  ')).toBeUndefined();
  });
});

describe('validateWeight', () => {
  it('returns undefined for valid weights', () => {
    expect(validateWeight('65')).toBeUndefined();
    expect(validateWeight('70')).toBeUndefined();
    expect(validateWeight(REVIEW_CONSTANTS.MIN_WEIGHT.toString())).toBeUndefined();
    expect(validateWeight(REVIEW_CONSTANTS.MAX_WEIGHT.toString())).toBeUndefined();
  });

  it('returns error for empty weight', () => {
    expect(validateWeight('')).toBe('weightRequired');
    expect(validateWeight('   ')).toBe('weightRequired');
  });

  it('returns error for non-numeric weight', () => {
    expect(validateWeight('abc')).toBe('weightInvalid');
    // Note: '65kg' is parsed as 65 by parseFloat, which is valid
  });

  it('returns error for weight below minimum', () => {
    expect(validateWeight((REVIEW_CONSTANTS.MIN_WEIGHT - 1).toString())).toBe('weightInvalid');
    expect(validateWeight('0')).toBe('weightInvalid');
  });

  it('returns error for weight above maximum', () => {
    expect(validateWeight((REVIEW_CONSTANTS.MAX_WEIGHT + 1).toString())).toBe('weightInvalid');
    expect(validateWeight('300')).toBe('weightInvalid');
  });

  it('handles decimal weights', () => {
    expect(validateWeight('65.5')).toBeUndefined();
  });

  it('handles whitespace', () => {
    expect(validateWeight('  65  ')).toBeUndefined();
  });
});

describe('validateImages', () => {
  const createMockFile = (type: string, size: number): File => {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], 'test.jpg', { type });
  };

  it('returns undefined for valid images', () => {
    const images = [
      createMockFile('image/jpeg', 1024 * 1024),
      createMockFile('image/png', 2 * 1024 * 1024),
    ];
    expect(validateImages(images)).toBeUndefined();
  });

  it('returns undefined for valid videos', () => {
    const videos = [
      createMockFile('video/mp4', 10 * 1024 * 1024),
      createMockFile('video/quicktime', 20 * 1024 * 1024),
    ];
    expect(validateImages(videos)).toBeUndefined();
  });

  it('returns error for too many images', () => {
    const images = Array(REVIEW_CONSTANTS.MAX_IMAGES + 1).fill(null).map(() =>
      createMockFile('image/jpeg', 1024 * 1024)
    );
    expect(validateImages(images)).toBe('tooManyImages');
  });

  it('respects currentCount parameter', () => {
    const images = [
      createMockFile('image/jpeg', 1024 * 1024),
    ];
    expect(validateImages(images, REVIEW_CONSTANTS.MAX_IMAGES)).toBe('tooManyImages');
  });

  it('returns error for invalid file type', () => {
    const images = [
      createMockFile('application/pdf', 1024 * 1024),
    ];
    expect(validateImages(images)).toBe('invalidFileType');
  });

  it('returns error for image exceeding size limit', () => {
    const images = [
      createMockFile('image/jpeg', REVIEW_CONSTANTS.MAX_IMAGE_SIZE + 1),
    ];
    expect(validateImages(images)).toBe('imageSizeExceeded');
  });

  it('returns error for video exceeding size limit', () => {
    const videos = [
      createMockFile('video/mp4', REVIEW_CONSTANTS.MAX_VIDEO_SIZE + 1),
    ];
    expect(validateImages(videos)).toBe('videoSizeExceeded');
  });

  it('handles empty array', () => {
    expect(validateImages([])).toBeUndefined();
  });

  it('handles exactly max images', () => {
    const images = Array(REVIEW_CONSTANTS.MAX_IMAGES).fill(null).map(() =>
      createMockFile('image/jpeg', 1024 * 1024)
    );
    expect(validateImages(images)).toBeUndefined();
  });

  it('validates multiple files and returns first error', () => {
    const images = [
      createMockFile('image/jpeg', 1024 * 1024),
      createMockFile('application/pdf', 1024 * 1024),
      createMockFile('image/png', REVIEW_CONSTANTS.MAX_IMAGE_SIZE + 1),
    ];
    // Should return first error encountered
    expect(validateImages(images)).toBe('invalidFileType');
  });

  it('handles image at exactly max size', () => {
    const images = [
      createMockFile('image/jpeg', REVIEW_CONSTANTS.MAX_IMAGE_SIZE),
    ];
    expect(validateImages(images)).toBeUndefined();
  });

  it('handles video at exactly max size', () => {
    const videos = [
      createMockFile('video/mp4', REVIEW_CONSTANTS.MAX_VIDEO_SIZE),
    ];
    expect(validateImages(videos)).toBeUndefined();
  });

  it('handles mixed valid images and videos', () => {
    const files = [
      createMockFile('image/jpeg', 1024 * 1024),
      createMockFile('video/mp4', 10 * 1024 * 1024),
      createMockFile('image/png', 2 * 1024 * 1024),
    ];
    expect(validateImages(files)).toBeUndefined();
  });

  it('checks image/jpg type', () => {
    const images = [
      createMockFile('image/jpg', 1024 * 1024),
    ];
    expect(validateImages(images)).toBeUndefined();
  });
});
