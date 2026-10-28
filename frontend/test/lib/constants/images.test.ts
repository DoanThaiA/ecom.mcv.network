import { describe, it, expect } from 'vitest';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';

describe('images', () => {
  describe('DEFAULT_PRODUCT_IMAGE', () => {
    it('is defined', () => {
      expect(DEFAULT_PRODUCT_IMAGE).toBeDefined();
    });

    it('is a string', () => {
      expect(typeof DEFAULT_PRODUCT_IMAGE).toBe('string');
    });

    it('points to assets/images folder', () => {
      expect(DEFAULT_PRODUCT_IMAGE).toContain('/assets/images/');
    });

    it('is a valid path', () => {
      expect(DEFAULT_PRODUCT_IMAGE).toMatch(/^\/assets\/images\/.*\.(png|jpg|jpeg|svg|webp)$/);
    });
  });
});
