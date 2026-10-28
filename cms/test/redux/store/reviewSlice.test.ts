import { describe, it, expect } from 'vitest';

import reviewReducer, {
  getReviewsRequest,
  getReviewsSuccess,
  getReviewsFailure,
  toggleVisibilityRequest,
  toggleVisibilitySuccess,
  toggleVisibilityFailure,
  setFilters,
  resetReviewState,
  selectReviews,
  selectReviewLoading,
  selectReviewPagination,
  selectReviewFilters,
} from 'src/redux/store/reviewSlice';
import type { CmsProductReview, ReviewFilters } from 'src/types/reviews';

describe('reviewSlice', () => {
  const initialState = {
    reviews: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    filters: {
      sortBy: 'newest' as const,
    },
  };

  const mockReview: CmsProductReview = {
    reviewId: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Great product!',
    status: 'approved',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockReviews: CmsProductReview[] = [
    mockReview,
    {
      reviewId: 'review-2',
      productId: 'product-1',
      userId: 'user-2',
      userName: 'Jane Smith',
      rating: 4,
      comment: 'Good quality',
      status: 'pending',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      reviewId: 'review-3',
      productId: 'product-2',
      userId: 'user-3',
      userName: 'Bob Wilson',
      rating: 3,
      comment: 'Average',
      status: 'rejected',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('getReviewsRequest', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError = {
          ...initialState,
          error: 'Previous error',
        };

        const state = reviewReducer(
          stateWithError,
          getReviewsRequest({ page: 1, limit: 10 })
        );

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('does not affect reviews or pagination', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
          pagination: {
            total: 3,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };

        const state = reviewReducer(
          stateWithData,
          getReviewsRequest({ page: 2, limit: 10 })
        );

        expect(state.reviews).toEqual(mockReviews);
        expect(state.pagination.total).toBe(3);
      });
    });

    describe('getReviewsSuccess', () => {
      it('sets reviews and pagination data', () => {
        const payload = {
          data: mockReviews,
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        const state = reviewReducer(initialState, getReviewsSuccess(payload));

        expect(state.loading).toBe(false);
        expect(state.reviews).toEqual(mockReviews);
        expect(state.pagination).toEqual({
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        });
      });

      it('replaces existing reviews', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
        };

        const newReviews: CmsProductReview[] = [
          {
            reviewId: 'review-4',
            productId: 'product-3',
            userId: 'user-4',
            userName: 'Alice Brown',
            rating: 5,
            comment: 'Excellent!',
            status: 'approved',
            createdAt: '2024-01-04T00:00:00Z',
          },
        ];

        const payload = {
          data: newReviews,
          total: 1,
          page: 2,
          limit: 10,
          totalPages: 2,
        };

        const state = reviewReducer(stateWithData, getReviewsSuccess(payload));

        expect(state.reviews).toEqual(newReviews);
        expect(state.reviews).not.toEqual(mockReviews);
      });

      it('handles empty reviews array', () => {
        const payload = {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };

        const state = reviewReducer(initialState, getReviewsSuccess(payload));

        expect(state.reviews).toEqual([]);
        expect(state.pagination.total).toBe(0);
      });
    });

    describe('getReviewsFailure', () => {
      it('sets error and stops loading', () => {
        const loadingState = {
          ...initialState,
          loading: true,
        };

        const state = reviewReducer(loadingState, getReviewsFailure('Failed to load reviews'));

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to load reviews');
      });

      it('does not affect reviews or pagination', () => {
        const stateWithData = {
          ...initialState,
          loading: true,
          reviews: mockReviews,
          pagination: {
            total: 3,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };

        const state = reviewReducer(stateWithData, getReviewsFailure('Error'));

        expect(state.reviews).toEqual(mockReviews);
        expect(state.pagination.total).toBe(3);
      });
    });

    describe('toggleVisibilityRequest', () => {
      it('sets loading to true', () => {
        const state = reviewReducer(
          initialState,
          toggleVisibilityRequest({
            reviewId: 'review-1',
            productId: 'product-1',
          })
        );

        expect(state.loading).toBe(true);
      });

      it('does not affect reviews', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
        };

        const state = reviewReducer(
          stateWithData,
          toggleVisibilityRequest({
            reviewId: 'review-1',
            productId: 'product-1',
            visible: true,
          })
        );

        expect(state.reviews).toEqual(mockReviews);
      });
    });

    describe('toggleVisibilitySuccess', () => {
      it('updates review status and stops loading', () => {
        const stateWithData = {
          ...initialState,
          loading: true,
          reviews: mockReviews,
        };

        const state = reviewReducer(
          stateWithData,
          toggleVisibilitySuccess({
            reviewId: 'review-1',
            productId: 'product-1',
            newStatus: 'rejected',
          })
        );

        expect(state.loading).toBe(false);
        const updatedReview = state.reviews.find((r) => r.reviewId === 'review-1');
        expect(updatedReview?.status).toBe('rejected');
      });

      it('does not update other reviews', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
        };

        const state = reviewReducer(
          stateWithData,
          toggleVisibilitySuccess({
            reviewId: 'review-1',
            productId: 'product-1',
            newStatus: 'approved',
          })
        );

        const otherReviews = state.reviews.filter((r) => r.reviewId !== 'review-1');
        const originalOthers = mockReviews.filter((r) => r.reviewId !== 'review-1');
        expect(otherReviews).toEqual(originalOthers);
      });

      it('handles review not found gracefully', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
        };

        const state = reviewReducer(
          stateWithData,
          toggleVisibilitySuccess({
            reviewId: 'nonexistent',
            productId: 'product-1',
            newStatus: 'approved',
          })
        );

        expect(state.reviews).toEqual(mockReviews);
      });

      it('matches both reviewId and productId', () => {
        const stateWithData = {
          ...initialState,
          reviews: [
            {
              ...mockReview,
              reviewId: 'review-1',
              productId: 'product-1',
              status: 'pending',
            },
            {
              ...mockReview,
              reviewId: 'review-1',
              productId: 'product-2',
              status: 'pending',
            },
          ],
        };

        const state = reviewReducer(
          stateWithData,
          toggleVisibilitySuccess({
            reviewId: 'review-1',
            productId: 'product-1',
            newStatus: 'approved',
          })
        );

        const review1 = state.reviews.find(
          (r) => r.reviewId === 'review-1' && r.productId === 'product-1'
        );
        const review2 = state.reviews.find(
          (r) => r.reviewId === 'review-1' && r.productId === 'product-2'
        );

        expect(review1?.status).toBe('approved');
        expect(review2?.status).toBe('pending');
      });
    });

    describe('toggleVisibilityFailure', () => {
      it('sets error and stops loading', () => {
        const loadingState = {
          ...initialState,
          loading: true,
        };

        const state = reviewReducer(
          loadingState,
          toggleVisibilityFailure('Failed to toggle visibility')
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to toggle visibility');
      });

      it('does not affect reviews', () => {
        const stateWithData = {
          ...initialState,
          loading: true,
          reviews: mockReviews,
        };

        const state = reviewReducer(stateWithData, toggleVisibilityFailure('Error'));

        expect(state.reviews).toEqual(mockReviews);
      });
    });

    describe('setFilters', () => {
      it('sets filter values', () => {
        const filters: ReviewFilters = {
          sortBy: 'oldest',
          rating: 5,
          status: 'approved',
        };

        const state = reviewReducer(initialState, setFilters(filters));

        expect(state.filters).toEqual(filters);
      });

      it('replaces existing filters', () => {
        const stateWithFilters = {
          ...initialState,
          filters: {
            sortBy: 'newest' as const,
            rating: 4,
          },
        };

        const newFilters: ReviewFilters = {
          sortBy: 'highest_rating',
          status: 'pending',
        };

        const state = reviewReducer(stateWithFilters, setFilters(newFilters));

        expect(state.filters).toEqual(newFilters);
      });

      it('handles partial filters', () => {
        const filters: ReviewFilters = {
          sortBy: 'lowest_rating',
        };

        const state = reviewReducer(initialState, setFilters(filters));

        expect(state.filters.sortBy).toBe('lowest_rating');
      });

      it('does not affect other state', () => {
        const stateWithData = {
          ...initialState,
          reviews: mockReviews,
          loading: true,
          pagination: {
            total: 3,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };

        const state = reviewReducer(stateWithData, setFilters({ sortBy: 'oldest' }));

        expect(state.reviews).toEqual(mockReviews);
        expect(state.loading).toBe(true);
        expect(state.pagination.total).toBe(3);
      });
    });

    describe('resetReviewState', () => {
      it('resets all state to initial values', () => {
        const activeState = {
          reviews: mockReviews,
          loading: true,
          error: 'Some error',
          pagination: {
            total: 10,
            page: 2,
            limit: 20,
            totalPages: 5,
          },
          filters: {
            sortBy: 'oldest' as const,
            rating: 5,
            status: 'approved' as const,
          },
        };

        const state = reviewReducer(activeState, resetReviewState());

        expect(state).toEqual(initialState);
      });

      it('works on already empty state', () => {
        const state = reviewReducer(initialState, resetReviewState());

        expect(state).toEqual(initialState);
      });
    });
  });

  describe('selectors', () => {
    describe('selectReviews', () => {
      it('returns empty array for initial state', () => {
        const state = { review: initialState };

        const reviews = selectReviews(state);

        expect(reviews).toEqual([]);
      });

      it('returns reviews when present', () => {
        const state = {
          review: {
            ...initialState,
            reviews: mockReviews,
          },
        };

        const reviews = selectReviews(state);

        expect(reviews).toEqual(mockReviews);
        expect(reviews).toHaveLength(3);
      });
    });

    describe('selectReviewLoading', () => {
      it('returns false for initial state', () => {
        const state = { review: initialState };

        const loading = selectReviewLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          review: {
            ...initialState,
            loading: true,
          },
        };

        const loading = selectReviewLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectReviewPagination', () => {
      it('returns initial pagination for initial state', () => {
        const state = { review: initialState };

        const pagination = selectReviewPagination(state);

        expect(pagination).toEqual({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state = {
          review: {
            ...initialState,
            pagination: {
              total: 50,
              page: 3,
              limit: 20,
              totalPages: 3,
            },
          },
        };

        const pagination = selectReviewPagination(state);

        expect(pagination).toEqual({
          total: 50,
          page: 3,
          limit: 20,
          totalPages: 3,
        });
      });
    });

    describe('selectReviewFilters', () => {
      it('returns default filters for initial state', () => {
        const state = { review: initialState };

        const filters = selectReviewFilters(state);

        expect(filters).toEqual({
          sortBy: 'newest',
        });
      });

      it('returns current filters', () => {
        const customFilters: ReviewFilters = {
          sortBy: 'highest_rating',
          rating: 5,
          status: 'approved',
        };

        const state = {
          review: {
            ...initialState,
            filters: customFilters,
          },
        };

        const filters = selectReviewFilters(state);

        expect(filters).toEqual(customFilters);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete review fetch flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectReviews({ review: state })).toEqual([]);
      expect(selectReviewLoading({ review: state })).toBe(false);

      // Step 1: Start loading
      state = reviewReducer(state, getReviewsRequest({ page: 1, limit: 10 }));
      expect(selectReviewLoading({ review: state })).toBe(true);

      // Step 2: Receive data
      const payload = {
        data: mockReviews,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      state = reviewReducer(state, getReviewsSuccess(payload));
      expect(selectReviews({ review: state })).toEqual(mockReviews);
      expect(selectReviewLoading({ review: state })).toBe(false);
      expect(selectReviewPagination({ review: state }).total).toBe(3);
    });

    it('handles review fetch error flow', () => {
      let state = reviewReducer(initialState, getReviewsRequest({ page: 1, limit: 10 }));
      expect(selectReviewLoading({ review: state })).toBe(true);

      state = reviewReducer(state, getReviewsFailure('Network error'));
      expect(selectReviewLoading({ review: state })).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('handles toggle visibility flow', () => {
      // Setup: Reviews loaded
      let state = reviewReducer(
        initialState,
        getReviewsSuccess({
          data: mockReviews,
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );

      // Toggle visibility
      state = reviewReducer(
        state,
        toggleVisibilityRequest({
          reviewId: 'review-2',
          productId: 'product-1',
          visible: true,
        })
      );
      expect(selectReviewLoading({ review: state })).toBe(true);

      state = reviewReducer(
        state,
        toggleVisibilitySuccess({
          reviewId: 'review-2',
          productId: 'product-1',
          newStatus: 'approved',
        })
      );
      expect(selectReviewLoading({ review: state })).toBe(false);

      const updatedReview = selectReviews({ review: state }).find(
        (r) => r.reviewId === 'review-2'
      );
      expect(updatedReview?.status).toBe('approved');
    });

    it('handles pagination flow', () => {
      // Page 1
      let state = reviewReducer(
        initialState,
        getReviewsSuccess({
          data: mockReviews.slice(0, 2),
          total: 3,
          page: 1,
          limit: 2,
          totalPages: 2,
        })
      );

      expect(selectReviews({ review: state })).toHaveLength(2);
      expect(selectReviewPagination({ review: state }).page).toBe(1);

      // Page 2
      state = reviewReducer(
        state,
        getReviewsSuccess({
          data: mockReviews.slice(2, 3),
          total: 3,
          page: 2,
          limit: 2,
          totalPages: 2,
        })
      );

      expect(selectReviews({ review: state })).toHaveLength(1);
      expect(selectReviewPagination({ review: state }).page).toBe(2);
    });

    it('handles filter change and refresh', () => {
      // Initial load
      let state = reviewReducer(
        initialState,
        getReviewsSuccess({
          data: mockReviews,
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );

      // Change filters
      state = reviewReducer(state, setFilters({ sortBy: 'highest_rating', rating: 5 }));
      expect(selectReviewFilters({ review: state }).sortBy).toBe('highest_rating');
      expect(selectReviewFilters({ review: state }).rating).toBe(5);

      // Reload with new filters
      const filteredReviews = mockReviews.filter((r) => r.rating === 5);
      state = reviewReducer(
        state,
        getReviewsSuccess({
          data: filteredReviews,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );

      expect(selectReviews({ review: state })).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = reviewReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive errors', () => {
      let state = reviewReducer(initialState, getReviewsFailure('Error 1'));
      expect(state.error).toBe('Error 1');

      state = reviewReducer(state, getReviewsFailure('Error 2'));
      expect(state.error).toBe('Error 2');
    });

    it('clears error on new request', () => {
      let state = reviewReducer(initialState, getReviewsFailure('Previous error'));
      expect(state.error).toBe('Previous error');

      state = reviewReducer(state, getReviewsRequest({ page: 1, limit: 10 }));
      expect(state.error).toBe(null);
    });

    it('handles empty data after having data', () => {
      let state = reviewReducer(
        initialState,
        getReviewsSuccess({
          data: mockReviews,
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );

      expect(selectReviews({ review: state })).toHaveLength(3);

      state = reviewReducer(
        state,
        getReviewsSuccess({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        })
      );

      expect(selectReviews({ review: state })).toEqual([]);
    });

    it('preserves reviews through loading states', () => {
      let state = reviewReducer(
        initialState,
        getReviewsSuccess({
          data: mockReviews,
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );

      const originalReviews = state.reviews;

      state = reviewReducer(
        state,
        toggleVisibilityRequest({ reviewId: 'review-1', productId: 'product-1' })
      );
      expect(state.reviews).toEqual(originalReviews);
    });
  });
});
