import { describe, it, expect } from 'vitest';
import {
  ReviewStatus,
  FitLevel,
  getReviewStatusColor,
  getRatingColor,
  getFitLevelKey,
  type CmsProductReview,
  type ReviewMedia,
  type ReviewFilters,
  type GetReviewsRequest,
  type GetReviewsResponse,
  type ToggleVisibilityRequest,
} from 'src/types/reviews';

describe('types/reviews', () => {
  describe('Type Exports', () => {
    it('exports ReviewStatus enum', () => {
      expect(ReviewStatus).toBeDefined();
    });

    it('exports FitLevel enum', () => {
      expect(FitLevel).toBeDefined();
    });
  });

  describe('getReviewStatusColor', () => {
    it('returns success for visible status', () => {
      expect(getReviewStatusColor('visible')).toBe('success');
    });

    it('returns error for hidden status', () => {
      expect(getReviewStatusColor('hidden')).toBe('error');
    });

    it('returns default for unknown status', () => {
      expect(getReviewStatusColor('unknown')).toBe('default');
    });

    it('returns default for empty status', () => {
      expect(getReviewStatusColor('')).toBe('default');
    });
  });

  describe('getRatingColor', () => {
    it('returns green for rating >= 4', () => {
      expect(getRatingColor(5)).toBe('#22C55E');
      expect(getRatingColor(4)).toBe('#22C55E');
    });

    it('returns yellow for rating >= 3 and < 4', () => {
      expect(getRatingColor(3)).toBe('#F59E0B');
      expect(getRatingColor(3.5)).toBe('#F59E0B');
    });

    it('returns red for rating < 3', () => {
      expect(getRatingColor(2)).toBe('#EF4444');
      expect(getRatingColor(1)).toBe('#EF4444');
      expect(getRatingColor(0)).toBe('#EF4444');
    });

    it('handles edge case 4.0', () => {
      expect(getRatingColor(4.0)).toBe('#22C55E');
    });

    it('handles edge case 3.0', () => {
      expect(getRatingColor(3.0)).toBe('#F59E0B');
    });
  });

  describe('getFitLevelKey', () => {
    it('returns fitLevelTight for level 3', () => {
      expect(getFitLevelKey(3)).toBe('fitLevelTight');
    });

    it('returns fitLevelFit for level 1', () => {
      expect(getFitLevelKey(1)).toBe('fitLevelFit');
    });

    it('returns fitLevelLoose for level 2', () => {
      expect(getFitLevelKey(2)).toBe('fitLevelLoose');
    });

    it('returns fitLevelFit for unknown level', () => {
      expect(getFitLevelKey(0)).toBe('fitLevelFit');
      expect(getFitLevelKey(999)).toBe('fitLevelFit');
    });
  });

  describe('Type Definitions', () => {
    it('CmsProductReview type is valid', () => {
      const review: CmsProductReview = {
        reviewId: '123',
        productId: 'p1',
        variantId: 'v1',
        productName: 'Test Product',
        productImage: 'https://example.com/image.jpg',
        rating: 5,
        heightCm: 170,
        weightKg: 65,
        fitLevel: 1,
        content: 'Great product',
        media: [],
        status: 'visible',
        orderNumber: 'ORD123',
        nhanhOrderId: 456,
        userName: 'John Doe',
        createdAt: '2024-01-01',
        orderId: 'o1',
      };
      expect(review).toBeDefined();
    });

    it('ReviewMedia type is valid', () => {
      const media: ReviewMedia = {
        url: 'https://example.com/image.jpg',
        type: 'image',
        thumbnail: 'https://example.com/thumb.jpg',
      };
      expect(media).toBeDefined();
    });

    it('ReviewFilters type is valid', () => {
      const filters: ReviewFilters = {
        keyword: 'test',
        status: 'visible',
        rating: 5,
        fitLevel: 1,
        height: 170,
        weight: 65,
        sortBy: 'newest',
      };
      expect(filters).toBeDefined();
    });

    it('GetReviewsRequest type is valid', () => {
      const request: GetReviewsRequest = {
        page: 1,
        limit: 10,
        filters: { keyword: 'test' },
      };
      expect(request).toBeDefined();
    });

    it('GetReviewsResponse type is valid', () => {
      const response: GetReviewsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });

    it('ToggleVisibilityRequest type is valid', () => {
      const request: ToggleVisibilityRequest = {
        visible: true,
      };
      expect(request).toBeDefined();
    });
  });
});
