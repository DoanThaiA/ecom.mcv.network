import type { Product } from '@/types/gen/shared/shared/products/product';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';

/**
 * Recommendation State
 */
export interface RecommendationState {
  products: Product[];
  loading: boolean;
  hasLoaded: boolean; // Prevent re-fetching
  // Cross-sell state
  crossSellProducts: Product[];
  crossSellLoading: boolean;
  crossSellProductIds: string; // Cache key - joined productIds
}

const initialState: RecommendationState = {
  products: [],
  loading: false,
  hasLoaded: false,
  // Cross-sell initial state
  crossSellProducts: [],
  crossSellLoading: false,
  crossSellProductIds: '',
};

/**
 * Saga Action Payload Types
 */
export type GetRecommendationsPayload = {
  limit?: number;
};

export type GetCrossSellPayload = {
  productIds: string[];
  limit?: number;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getRecommendationsRequest = createAction<GetRecommendationsPayload>(
  'recommendation/getRecommendationsRequest'
);

export const getCrossSellRequest = createAction<GetCrossSellPayload>(
  'recommendation/getCrossSellRequest'
);

/**
 * Recommendation Slice
 */
export const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setRecommendationsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setRecommendationsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.hasLoaded = true;
    },

    clearRecommendations: (state) => {
      state.products = [];
      state.loading = false;
      state.hasLoaded = false;
    },

    // Cross-sell actions
    setCrossSellLoading: (state, action: PayloadAction<boolean>) => {
      state.crossSellLoading = action.payload;
    },

    setCrossSellSuccess: (state, action: PayloadAction<{ products: Product[]; productIds: string }>) => {
      state.crossSellProducts = action.payload.products;
      state.crossSellProductIds = action.payload.productIds;
      state.crossSellLoading = false;
    },

    clearCrossSell: (state) => {
      state.crossSellProducts = [];
      state.crossSellLoading = false;
      state.crossSellProductIds = '';
    },
  },
});

export const {
  setRecommendationsLoading,
  setRecommendationsSuccess,
  clearRecommendations,
  setCrossSellLoading,
  setCrossSellSuccess,
  clearCrossSell,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;

/**
 * Selectors - Memoized with createSelector to prevent unnecessary re-renders
 */
const selectRecommendationState = (state: { recommendation: RecommendationState }) =>
  state.recommendation;

export const selectRecommendedProducts = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.products
);

export const selectRecommendationsLoading = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.loading
);

export const selectRecommendationsHasLoaded = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.hasLoaded
);

// Cross-sell selectors
export const selectCrossSellProducts = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.crossSellProducts
);

export const selectCrossSellLoading = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.crossSellLoading
);

export const selectCrossSellProductIds = createSelector(
  [selectRecommendationState],
  (recommendation) => recommendation.crossSellProductIds
);
