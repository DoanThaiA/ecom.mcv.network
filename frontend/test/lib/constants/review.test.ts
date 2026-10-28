import { describe, it, expect } from 'vitest';
import { REVIEW_CONSTANTS } from '@/lib/constants/review';

describe('review', () => {
  describe('REVIEW_CONSTANTS', () => {
    it('has MAX_IMAGES constant', () => {
      expect(REVIEW_CONSTANTS.MAX_IMAGES).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_IMAGES).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_IMAGES).toBeGreaterThan(0);
    });

    it('has MAX_IMAGE_SIZE constant in bytes', () => {
      expect(REVIEW_CONSTANTS.MAX_IMAGE_SIZE).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_IMAGE_SIZE).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024); // 5MB
    });

    it('has MAX_VIDEO_SIZE constant in bytes', () => {
      expect(REVIEW_CONSTANTS.MAX_VIDEO_SIZE).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_VIDEO_SIZE).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_VIDEO_SIZE).toBe(50 * 1024 * 1024); // 50MB
    });

    it('has MIN_COMMENT_LENGTH constant', () => {
      expect(REVIEW_CONSTANTS.MIN_COMMENT_LENGTH).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MIN_COMMENT_LENGTH).toBe('number');
      expect(REVIEW_CONSTANTS.MIN_COMMENT_LENGTH).toBeGreaterThan(0);
    });

    it('has MAX_COMMENT_LENGTH constant', () => {
      expect(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_COMMENT_LENGTH).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH).toBeGreaterThan(
        REVIEW_CONSTANTS.MIN_COMMENT_LENGTH
      );
    });

    it('has MIN_HEIGHT constant', () => {
      expect(REVIEW_CONSTANTS.MIN_HEIGHT).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MIN_HEIGHT).toBe('number');
      expect(REVIEW_CONSTANTS.MIN_HEIGHT).toBeGreaterThan(0);
    });

    it('has MAX_HEIGHT constant', () => {
      expect(REVIEW_CONSTANTS.MAX_HEIGHT).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_HEIGHT).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_HEIGHT).toBeGreaterThan(
        REVIEW_CONSTANTS.MIN_HEIGHT
      );
    });

    it('has MIN_WEIGHT constant', () => {
      expect(REVIEW_CONSTANTS.MIN_WEIGHT).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MIN_WEIGHT).toBe('number');
      expect(REVIEW_CONSTANTS.MIN_WEIGHT).toBeGreaterThan(0);
    });

    it('has MAX_WEIGHT constant', () => {
      expect(REVIEW_CONSTANTS.MAX_WEIGHT).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.MAX_WEIGHT).toBe('number');
      expect(REVIEW_CONSTANTS.MAX_WEIGHT).toBeGreaterThan(
        REVIEW_CONSTANTS.MIN_WEIGHT
      );
    });

    it('has ACCEPTED_IMAGE_TYPES array', () => {
      expect(REVIEW_CONSTANTS.ACCEPTED_IMAGE_TYPES).toBeDefined();
      expect(Array.isArray(REVIEW_CONSTANTS.ACCEPTED_IMAGE_TYPES)).toBe(true);
      expect(REVIEW_CONSTANTS.ACCEPTED_IMAGE_TYPES.length).toBeGreaterThan(0);
    });

    it('ACCEPTED_IMAGE_TYPES contains valid MIME types', () => {
      REVIEW_CONSTANTS.ACCEPTED_IMAGE_TYPES.forEach((type) => {
        expect(type).toMatch(/^image\//);
      });
    });

    it('has ACCEPTED_VIDEO_TYPES array', () => {
      expect(REVIEW_CONSTANTS.ACCEPTED_VIDEO_TYPES).toBeDefined();
      expect(Array.isArray(REVIEW_CONSTANTS.ACCEPTED_VIDEO_TYPES)).toBe(true);
      expect(REVIEW_CONSTANTS.ACCEPTED_VIDEO_TYPES.length).toBeGreaterThan(0);
    });

    it('ACCEPTED_VIDEO_TYPES contains valid MIME types', () => {
      REVIEW_CONSTANTS.ACCEPTED_VIDEO_TYPES.forEach((type) => {
        expect(type).toMatch(/^video\//);
      });
    });

    it('has DEFAULT_PAGE_SIZE constant', () => {
      expect(REVIEW_CONSTANTS.DEFAULT_PAGE_SIZE).toBeDefined();
      expect(typeof REVIEW_CONSTANTS.DEFAULT_PAGE_SIZE).toBe('number');
      expect(REVIEW_CONSTANTS.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    });

    it('MAX_VIDEO_SIZE is larger than MAX_IMAGE_SIZE', () => {
      expect(REVIEW_CONSTANTS.MAX_VIDEO_SIZE).toBeGreaterThan(
        REVIEW_CONSTANTS.MAX_IMAGE_SIZE
      );
    });
  });
});
