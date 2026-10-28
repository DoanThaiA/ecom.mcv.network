import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';
import type { Localization } from 'src/types/gen/shared/shared/common/localization';
import type { CreateTopicRequest, CreateTopicProduct } from 'src/types/gen/cms/cms/topics/topic';
import type { TopicStatus } from 'src/types/gen/shared/shared/common/enums';
import type { ProductDiff } from 'src/sections/topic/utils/product-diff';
import type { CategoryDiff } from 'src/sections/topic/utils/category-diff';
import type { BannerDiff } from 'src/sections/topic/utils/banner-diff';

/**
 * Topic Pagination
 */
export interface TopicPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Topic State
 */
export interface TopicState {
  topics: Topic[];
  currentTopic: Topic | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  addProductsLoading: boolean;
  removeProductsLoading: boolean;
  pagination: TopicPagination;
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

const initialState: TopicState = {
  topics: [],
  currentTopic: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  addProductsLoading: false,
  removeProductsLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchQuery: '',
  statusFilter: 'all',
};

/**
 * Saga Action Payload Types
 */
export type GetTopicsPayload = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TopicStatus;
};

export type GetTopicByIdPayload = {
  id: string;
};

export type CreateTopicPayload = {
  data: CreateTopicRequest;
  onSuccess?: (topic: Topic) => void;
};

export type UpdateTopicPayload = {
  id: string;
  data: {
    name?: string;
    localization?: Localization;
    slug?: string;
    description?: string;
    image?: string;
    order?: number;
    status?: TopicStatus;
  };
  onSuccess?: (topic: Topic) => void;
};

export type DeleteTopicPayload = {
  id: string;
  onSuccess?: () => void;
};

export type AddProductsToTopicPayload = {
  topicId: string;
  products: CreateTopicProduct[];
  onSuccess?: (topic: Topic) => void;
};

export type RemoveProductsFromTopicPayload = {
  topicId: string;
  productIds: string[];
  onSuccess?: (topic: Topic) => void;
};

export type UpdateTopicWithProductsPayload = {
  id: string;
  data: {
    name?: string;
    localization?: Localization;
    order?: number;
    status?: TopicStatus;
  };
  productDiff: ProductDiff;
  categoryDiff: CategoryDiff;
  bannerDiff: BannerDiff;
  onSuccess?: () => void;
};

export type ReorderTopicProductsPayload = {
  topicId: string;
  products: { productId: string; order: number }[];
  onSuccess?: (topic: Topic) => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getTopicsRequest = createAction<GetTopicsPayload>('topic/getTopicsRequest');
export const getTopicByIdRequest = createAction<GetTopicByIdPayload>('topic/getTopicByIdRequest');
export const createTopicRequest = createAction<CreateTopicPayload>('topic/createTopicRequest');
export const updateTopicRequest = createAction<UpdateTopicPayload>('topic/updateTopicRequest');
export const deleteTopicRequest = createAction<DeleteTopicPayload>('topic/deleteTopicRequest');
export const addProductsToTopicRequest = createAction<AddProductsToTopicPayload>(
  'topic/addProductsToTopicRequest'
);
export const removeProductsFromTopicRequest = createAction<RemoveProductsFromTopicPayload>(
  'topic/removeProductsFromTopicRequest'
);
export const updateTopicWithProductsRequest = createAction<UpdateTopicWithProductsPayload>(
  'topic/updateTopicWithProductsRequest'
);
export const reorderTopicProductsRequest = createAction<ReorderTopicProductsPayload>(
  'topic/reorderTopicProductsRequest'
);

/**
 * Topic Slice
 */
export const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    // List topics
    setTopicLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setTopicsSuccess: (
      state,
      action: PayloadAction<{
        topics: Topic[];
        pagination: TopicPagination;
      }>
    ) => {
      state.topics = action.payload.topics;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setTopicError: (state) => {
      state.loading = false;
    },

    // Get single topic by ID
    setCurrentTopicLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentTopicSuccess: (state, action: PayloadAction<Topic>) => {
      state.currentTopic = action.payload;
      state.currentLoading = false;
    },

    setCurrentTopicError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },

    // Create topic
    setCreateTopicLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateTopicSuccess: (state, action: PayloadAction<Topic>) => {
      state.topics.unshift(action.payload);
      state.createLoading = false;
    },

    setCreateTopicError: (state) => {
      state.createLoading = false;
    },

    // Update topic
    setUpdateTopicLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateTopicSuccess: (state, action: PayloadAction<Topic>) => {
      const index = state.topics.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
      if (state.currentTopic?.id === action.payload.id) {
        state.currentTopic = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateTopicError: (state) => {
      state.updateLoading = false;
    },

    // Delete topic
    setDeleteTopicLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteTopicSuccess: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter((t) => t.id !== action.payload);
      if (state.currentTopic?.id === action.payload) {
        state.currentTopic = null;
      }
      state.deleteLoading = false;
    },

    setDeleteTopicError: (state) => {
      state.deleteLoading = false;
    },

    // Add products to topic
    setAddProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.addProductsLoading = action.payload;
    },

    setAddProductsSuccess: (state, action: PayloadAction<Topic>) => {
      if (state.currentTopic?.id === action.payload.id) {
        state.currentTopic = action.payload;
      }
      const index = state.topics.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
      state.addProductsLoading = false;
    },

    setAddProductsError: (state) => {
      state.addProductsLoading = false;
    },

    // Remove products from topic
    setRemoveProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.removeProductsLoading = action.payload;
    },

    setRemoveProductsSuccess: (state, action: PayloadAction<Topic>) => {
      if (state.currentTopic?.id === action.payload.id) {
        state.currentTopic = action.payload;
      }
      const index = state.topics.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
      state.removeProductsLoading = false;
    },

    setRemoveProductsError: (state) => {
      state.removeProductsLoading = false;
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.statusFilter = action.payload;
    },

    // Reset state
    resetTopicState: (state) => {
      state.topics = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.searchQuery = '';
      state.statusFilter = 'all';
    },
  },
});

export const {
  setTopicLoading,
  setTopicsSuccess,
  setTopicError,
  setCurrentTopicLoading,
  setCurrentTopicSuccess,
  setCurrentTopicError,
  clearCurrentTopic,
  setCreateTopicLoading,
  setCreateTopicSuccess,
  setCreateTopicError,
  setUpdateTopicLoading,
  setUpdateTopicSuccess,
  setUpdateTopicError,
  setDeleteTopicLoading,
  setDeleteTopicSuccess,
  setDeleteTopicError,
  setAddProductsLoading,
  setAddProductsSuccess,
  setAddProductsError,
  setRemoveProductsLoading,
  setRemoveProductsSuccess,
  setRemoveProductsError,
  setSearchQuery,
  setStatusFilter,
  resetTopicState,
} = topicSlice.actions;

/**
 * Selectors
 */
export const selectTopics = (state: { topic: TopicState }) => state.topic.topics;

export const selectCurrentTopic = (state: { topic: TopicState }) => state.topic.currentTopic;

export const selectTopicLoading = (state: { topic: TopicState }) => state.topic.loading;

export const selectCurrentTopicLoading = (state: { topic: TopicState }) =>
  state.topic.currentLoading;

export const selectCreateTopicLoading = (state: { topic: TopicState }) => state.topic.createLoading;

export const selectUpdateTopicLoading = (state: { topic: TopicState }) => state.topic.updateLoading;

export const selectDeleteTopicLoading = (state: { topic: TopicState }) => state.topic.deleteLoading;

export const selectAddProductsLoading = (state: { topic: TopicState }) =>
  state.topic.addProductsLoading;

export const selectRemoveProductsLoading = (state: { topic: TopicState }) =>
  state.topic.removeProductsLoading;

export const selectTopicPagination = (state: { topic: TopicState }) => state.topic.pagination;

export const selectTopicSearchQuery = (state: { topic: TopicState }) => state.topic.searchQuery;

export const selectTopicStatusFilter = (state: { topic: TopicState }) => state.topic.statusFilter;

export default topicSlice.reducer;
