import { REVIEW_CONSTANTS } from '@/lib/constants/review';

export const validateRating = (rating: number): string | undefined => {
  if (rating < 1 || rating > 5) return 'ratingRequired';
  return undefined;
};

export const validateComment = (comment: string): string | undefined => {
  const trimmed = comment.trim();
  if (trimmed.length === 0) return 'commentRequired';
  if (trimmed.length > REVIEW_CONSTANTS.MAX_COMMENT_LENGTH)
    return 'commentTooLong';
  return undefined;
};

export const validateHeight = (height: string): string | undefined => {
  if (!height || height.trim() === '') return 'heightRequired';
  const num = parseFloat(height);
  if (
    isNaN(num) ||
    num < REVIEW_CONSTANTS.MIN_HEIGHT ||
    num > REVIEW_CONSTANTS.MAX_HEIGHT
  ) {
    return 'heightInvalid';
  }
  return undefined;
};

export const validateWeight = (weight: string): string | undefined => {
  if (!weight || weight.trim() === '') return 'weightRequired';
  const num = parseFloat(weight);
  if (
    isNaN(num) ||
    num < REVIEW_CONSTANTS.MIN_WEIGHT ||
    num > REVIEW_CONSTANTS.MAX_WEIGHT
  ) {
    return 'weightInvalid';
  }
  return undefined;
};

export const validateImages = (
  images: File[],
  currentCount = 0
): string | undefined => {
  const totalCount = currentCount + images.length;
  if (totalCount > REVIEW_CONSTANTS.MAX_IMAGES) return 'tooManyImages';

  // Check file types and sizes
  for (const file of images) {
    const isImage = (REVIEW_CONSTANTS.ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
    const isVideo = (REVIEW_CONSTANTS.ACCEPTED_VIDEO_TYPES as readonly string[]).includes(file.type);

    // Check if file type is accepted
    if (!isImage && !isVideo) {
      return 'invalidFileType';
    }

    // Check file size based on type
    if (isImage && file.size > REVIEW_CONSTANTS.MAX_IMAGE_SIZE) {
      return 'imageSizeExceeded';
    }

    if (isVideo && file.size > REVIEW_CONSTANTS.MAX_VIDEO_SIZE) {
      return 'videoSizeExceeded';
    }
  }

  return undefined;
};
