import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopTopicCategory } from '@/types/gen/shared/shared/topics/topic';
import type { BannerMediaType } from '@/types/gen/shared/shared/common/enums';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';

/**
 * Topic Products State - cache products by topic slug
 */
export interface TopicProductsCache {
  products: Product[];
  loading: boolean;
  hasNextPage: boolean;
  page: number;
}

/**
 * Topic Categories State - cache categories by topic slug
 */
export interface TopicCategoriesCache {
  categories: ShopTopicCategory[];
  loading: boolean;
}

/**
 * Topic Banner item from shop API
 */
export interface TopicBannerCacheItem {
  id: string;
  mediaType: BannerMediaType;
  media: { mobile?: string; tablet?: string; desktop?: string };
  link?: string | null;
  order: number;
}

/**
 * Topic Banners State - cache banners by topic slug
 */
export interface TopicBannersCache {
  banners: TopicBannerCacheItem[];
  loading: boolean;
}

export interface TopicState {
  // Cache topic products by slug: { [slug]: TopicProductsCache }
  topicProducts: Record<string, TopicProductsCache>;
  // Cache topic categories by slug: { [slug]: TopicCategoriesCache }
  topicCategories: Record<string, TopicCategoriesCache>;
  // Cache topic banners by slug: { [slug]: TopicBannersCache }
  topicBanners: Record<string, TopicBannersCache>;
}

const initialState: TopicState = {
  topicProducts: {},
  topicCategories: {},
  topicBanners: {},
};

/**
 * Saga Action Payload Types
 */
export type GetTopicProductsPayload = {
  slug: string;
  page?: number;
  limit?: number;
  append?: boolean; // For load more
};

export type GetTopicCategoriesPayload = {
  slug: string;
};

export type GetTopicBannersPayload = {
  slug: string;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getTopicProductsRequest = createAction<GetTopicProductsPayload>(
  'topic/getTopicProductsRequest'
);

export const getTopicCategoriesRequest = createAction<GetTopicCategoriesPayload>(
  'topic/getTopicCategoriesRequest'
);

export const getTopicBannersRequest = createAction<GetTopicBannersPayload>(
  'topic/getTopicBannersRequest'
);

/**
 * Topic Slice
 */
export const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    setTopicProductsLoading: (
      state,
      action: PayloadAction<{ slug: string; loading: boolean }>
    ) => {
      const { slug, loading } = action.payload;
      if (!state.topicProducts[slug]) {
        state.topicProducts[slug] = {
          products: [],
          loading: true,
          hasNextPage: false,
          page: 1,
        };
      }
      state.topicProducts[slug].loading = loading;
    },

    setTopicProductsSuccess: (
      state,
      action: PayloadAction<{
        slug: string;
        products: Product[];
        hasNextPage: boolean;
        page: number;
        append: boolean;
      }>
    ) => {
      const { slug, products, hasNextPage, page, append } = action.payload;

      if (!state.topicProducts[slug]) {
        state.topicProducts[slug] = {
          products: [],
          loading: false,
          hasNextPage: false,
          page: 1,
        };
      }

      if (append) {
        state.topicProducts[slug].products = [
          ...state.topicProducts[slug].products,
          ...products,
        ];
      } else {
        state.topicProducts[slug].products = products;
      }

      state.topicProducts[slug].hasNextPage = hasNextPage;
      state.topicProducts[slug].page = page;
      state.topicProducts[slug].loading = false;
    },

    clearTopicProducts: (state, action: PayloadAction<string>) => {
      delete state.topicProducts[action.payload];
    },

    setTopicCategoriesLoading: (
      state,
      action: PayloadAction<{ slug: string; loading: boolean }>
    ) => {
      const { slug, loading } = action.payload;
      if (!state.topicCategories[slug]) {
        state.topicCategories[slug] = {
          categories: [],
          loading: true,
        };
      }
      state.topicCategories[slug].loading = loading;
    },

    setTopicCategoriesSuccess: (
      state,
      action: PayloadAction<{
        slug: string;
        categories: ShopTopicCategory[];
      }>
    ) => {
      const { slug, categories } = action.payload;

      if (!state.topicCategories[slug]) {
        state.topicCategories[slug] = {
          categories: [],
          loading: false,
        };
      }

      state.topicCategories[slug].categories = categories;
      state.topicCategories[slug].loading = false;
    },

    clearTopicCategories: (state, action: PayloadAction<string>) => {
      delete state.topicCategories[action.payload];
    },

    setTopicBannersLoading: (
      state,
      action: PayloadAction<{ slug: string; loading: boolean }>
    ) => {
      const { slug, loading } = action.payload;
      if (!state.topicBanners[slug]) {
        state.topicBanners[slug] = {
          banners: [],
          loading: true,
        };
      }
      state.topicBanners[slug].loading = loading;
    },

    setTopicBannersSuccess: (
      state,
      action: PayloadAction<{
        slug: string;
        banners: TopicBannerCacheItem[];
      }>
    ) => {
      const { slug, banners } = action.payload;
      if (!state.topicBanners[slug]) {
        state.topicBanners[slug] = {
          banners: [],
          loading: false,
        };
      }
      state.topicBanners[slug].banners = banners;
      state.topicBanners[slug].loading = false;
    },

    clearTopicBanners: (state, action: PayloadAction<string>) => {
      delete state.topicBanners[action.payload];
    },
  },
});

export const {
  setTopicProductsLoading,
  setTopicProductsSuccess,
  clearTopicProducts,
  setTopicCategoriesLoading,
  setTopicCategoriesSuccess,
  clearTopicCategories,
  setTopicBannersLoading,
  setTopicBannersSuccess,
  clearTopicBanners,
} = topicSlice.actions;

export default topicSlice.reducer;

/**
 * Selectors - Memoized with createSelector to prevent unnecessary re-renders
 */
const selectTopicProductsState = (state: { topic: TopicState }) =>
  state.topic.topicProducts;

const selectTopicCategoriesState = (state: { topic: TopicState }) =>
  state.topic.topicCategories;

export const selectTopicProducts = createSelector(
  [selectTopicProductsState, (_: { topic: TopicState }, slug: string) => slug],
  (topicProducts, slug) => topicProducts[slug]?.products || []
);

export const selectTopicProductsLoading = createSelector(
  [selectTopicProductsState, (_: { topic: TopicState }, slug: string) => slug],
  (topicProducts, slug) => topicProducts[slug]?.loading ?? true
);

export const selectTopicProductsHasNextPage = createSelector(
  [selectTopicProductsState, (_: { topic: TopicState }, slug: string) => slug],
  (topicProducts, slug) => topicProducts[slug]?.hasNextPage ?? false
);

export const selectTopicProductsPage = createSelector(
  [selectTopicProductsState, (_: { topic: TopicState }, slug: string) => slug],
  (topicProducts, slug) => topicProducts[slug]?.page ?? 1
);

export const selectTopicProductsCache = createSelector(
  [selectTopicProductsState, (_: { topic: TopicState }, slug: string) => slug],
  (topicProducts, slug) => topicProducts[slug]
);

export const selectTopicCategories = createSelector(
  [selectTopicCategoriesState, (_: { topic: TopicState }, slug: string) => slug],
  (topicCategories, slug) => topicCategories[slug]?.categories || []
);

export const selectTopicCategoriesLoading = createSelector(
  [selectTopicCategoriesState, (_: { topic: TopicState }, slug: string) => slug],
  (topicCategories, slug) => topicCategories[slug]?.loading ?? false
);

const selectTopicBannersState = (state: { topic: TopicState }) =>
  state.topic.topicBanners;

export const selectTopicBanners = createSelector(
  [selectTopicBannersState, (_: { topic: TopicState }, slug: string) => slug],
  (topicBanners, slug) => topicBanners[slug]?.banners || []
);

export const selectTopicBannersLoading = createSelector(
  [selectTopicBannersState, (_: { topic: TopicState }, slug: string) => slug],
  (topicBanners, slug) => topicBanners[slug]?.loading ?? false
);
