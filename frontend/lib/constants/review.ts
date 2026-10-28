export const REVIEW_CONSTANTS = {
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 500,
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 250,
  MIN_WEIGHT: 20,
  MAX_WEIGHT: 200,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'], // MP4 and MOV
  DEFAULT_PAGE_SIZE: 3,
} as const;
