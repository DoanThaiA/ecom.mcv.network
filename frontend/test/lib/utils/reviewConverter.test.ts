import { describe, it, expect } from 'vitest';
import {
  convertGeneratedReviewToFrontend,
  convertPayloadToDto,
} from '@/lib/utils/reviewConverter';
import type {
  Review as GeneratedReview,
} from '@/types/gen/shared/shared/reviews/review';
import { MediaType, FitLevel } from '@/types/gen/shared/shared/reviews/review';
import type { CreateReviewPayload } from '@/lib/utils/reviewConverter';

describe('convertGeneratedReviewToFrontend', () => {
  it('converts generated review with all fields to frontend format', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: {
        userId: 'user-1',
        fullName: 'John Doe',
      },
      orderSnapshot: {
        orderId: 'order-1',
        orderNumber: 'ORD-001',
      },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Test Product',
          productImage: 'https://example.com/image.jpg',
          variantId: 'variant-1',
          rating: 5,
          content: 'Great product!',
          heightCm: 170,
          weightKg: 65,
          fitLevel: FitLevel.FIT_LEVEL_FIT,
          quantity: 2,
          media: [
            {
              url: 'https://example.com/review1.jpg',
              type: MediaType.MEDIA_TYPE_IMAGE,
              thumbnail: 'https://example.com/thumb1.jpg',
            },
          ],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'review-123',
      userId: 'user-1',
      userName: 'John Doe',
      productId: 'product-1',
      productName: 'Test Product',
      productImage: 'https://example.com/image.jpg',
      variantId: 'variant-1',
      rating: 5,
      comment: 'Great product!',
      height: 170,
      weight: 65,
      productFit: FitLevel.FIT_LEVEL_FIT,
      images: [
        {
          id: '',
          url: 'https://example.com/review1.jpg',
          type: 'image',
          thumbnail: 'https://example.com/thumb1.jpg',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      isVerifiedPurchase: true,
      orderId: 'order-1',
      orderNumber: 'ORD-001',
      quantity: 2,
    });
  });

  it.each([
    ['image', 'image'],
    ['video', 'video'],
  ] as const)(
    'maps %s media from the raw REST response to %s',
    (apiType, expectedType) => {
      const restReviewPayload = {
        id: `review-rest-${apiType}`,
        user: { userId: 'user-1', fullName: 'John' },
        productReviews: [
          {
            productId: 'product-1',
            productName: 'Product',
            rating: 5,
            media: [
              {
                url: `https://example.com/review.${apiType === 'image' ? 'jpg' : 'mp4'}`,
                type: apiType,
              },
            ],
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
      } as unknown as GeneratedReview;

      const result = convertGeneratedReviewToFrontend(restReviewPayload);

      expect(result[0].images![0].type).toBe(expectedType);
    }
  );

  it('handles multiple product reviews', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: {
        userId: 'user-1',
        fullName: 'John Doe',
      },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product 1',
          rating: 5,
          media: [],
        },
        {
          productId: 'product-2',
          productName: 'Product 2',
          rating: 4,
          media: [],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result).toHaveLength(2);
    expect(result[0].productId).toBe('product-1');
    expect(result[1].productId).toBe('product-2');
  });

  it('handles missing optional fields', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: {},
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product',
          rating: 3,
          media: [],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('');
    expect(result[0].userName).toBe('');
    expect(result[0].comment).toBeUndefined();
    expect(result[0].height).toBeUndefined();
    expect(result[0].weight).toBeUndefined();
    expect(result[0].productFit).toBeUndefined();
    expect(result[0].variantId).toBeUndefined();
    expect(result[0].productImage).toBeUndefined();
  });

  it('converts video media type correctly', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: { userId: 'user-1', fullName: 'John' },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product',
          rating: 5,
          media: [
            {
              url: 'https://example.com/video.mp4',
              type: MediaType.MEDIA_TYPE_VIDEO,
              thumbnail: 'https://example.com/thumb.jpg',
            },
          ],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result[0].images).toHaveLength(1);
    expect(result[0].images![0].type).toBe('video');
  });

  it('handles Date objects for timestamps', () => {
    const createdDate = new Date('2024-01-01T00:00:00Z');
    const updatedDate = new Date('2024-01-02T00:00:00Z');

    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: { userId: 'user-1', fullName: 'John' },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product',
          rating: 5,
          media: [],
        },
      ],
      createdAt: createdDate as any,
      updatedAt: updatedDate as any,
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result[0].createdAt).toBe(createdDate.toISOString());
    expect(result[0].updatedAt).toBe(updatedDate.toISOString());
  });

  it('handles missing createdAt with current date', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: { userId: 'user-1', fullName: 'John' },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product',
          rating: 5,
          media: [],
        },
      ],
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result[0].createdAt).toBeDefined();
    expect(new Date(result[0].createdAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('handles empty productReviews array', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: { userId: 'user-1', fullName: 'John' },
      productReviews: [],
      createdAt: '2024-01-01T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result).toEqual([]);
  });

  it('marks all reviews as verified purchases', () => {
    const generatedReview: GeneratedReview = {
      id: 'review-123',
      user: { userId: 'user-1', fullName: 'John' },
      productReviews: [
        {
          productId: 'product-1',
          productName: 'Product',
          rating: 5,
          media: [],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    } as GeneratedReview;

    const result = convertGeneratedReviewToFrontend(generatedReview);

    expect(result[0].isVerifiedPurchase).toBe(true);
  });
});

describe('convertPayloadToDto', () => {
  it('converts complete payload to DTO', () => {
    const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
      orderNumber: 'ORD-001',
      productId: 'product-1',
      variantId: 'variant-1',
      rating: 5,
      comment: 'Great product!',
      height: 170,
      weight: 65,
      productFit: 0, // Use numeric value instead of enum
      images: ['file-1', 'file-2'],
    };

    const result = convertPayloadToDto(payload);

    expect(result).toEqual({
      orderNumber: 'ORD-001',
      productReviews: [
        {
          productId: 'product-1',
          variantId: 'variant-1',
          rating: 5,
          heightCm: 170,
          weightKg: 65,
          fitLevel: 0,
          content: 'Great product!',
          mediaIds: ['file-1', 'file-2'],
        },
      ],
    });
  });

  it('handles minimal payload', () => {
    const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
      orderNumber: 'ORD-001',
      productId: 'product-1',
      rating: 3,
    };

    const result = convertPayloadToDto(payload);

    expect(result.orderNumber).toBe('ORD-001');
    expect(result.productReviews).toHaveLength(1);
    expect(result.productReviews[0]).toEqual({
      productId: 'product-1',
      variantId: undefined,
      rating: 3,
      heightCm: 0,
      weightKg: 0,
      fitLevel: 0,
      content: undefined,
      mediaIds: [],
    });
  });

  it('converts null variantId to undefined', () => {
    const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
      orderNumber: 'ORD-001',
      productId: 'product-1',
      variantId: null,
      rating: 4,
    };

    const result = convertPayloadToDto(payload);

    expect(result.productReviews[0].variantId).toBeUndefined();
  });

  it('handles empty images array', () => {
    const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
      orderNumber: 'ORD-001',
      productId: 'product-1',
      rating: 5,
      images: [],
    };

    const result = convertPayloadToDto(payload);

    expect(result.productReviews[0].mediaIds).toEqual([]);
  });

  it('handles missing optional numeric fields', () => {
    const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
      orderNumber: 'ORD-001',
      productId: 'product-1',
      rating: 5,
    };

    const result = convertPayloadToDto(payload);

    expect(result.productReviews[0].heightCm).toBe(0);
    expect(result.productReviews[0].weightKg).toBe(0);
    expect(result.productReviews[0].fitLevel).toBe(0);
  });

  it('handles all rating values', () => {
    const ratings: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    ratings.forEach((rating) => {
      const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
        orderNumber: 'ORD-001',
        productId: 'product-1',
        rating,
      };

      const result = convertPayloadToDto(payload);
      expect(result.productReviews[0].rating).toBe(rating);
    });
  });
});
