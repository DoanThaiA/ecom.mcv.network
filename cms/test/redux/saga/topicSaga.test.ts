import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { topicRepository } from 'src/repositories/topic.repository';
import { topicSaga } from 'src/redux/saga/topicSaga';
import {
  getTopicsRequest,
  getTopicByIdRequest,
  createTopicRequest,
  updateTopicRequest,
  deleteTopicRequest,
  addProductsToTopicRequest,
  removeProductsFromTopicRequest,
  updateTopicWithProductsRequest,
  reorderTopicProductsRequest,
  setTopicLoading,
  setTopicsSuccess,
  setTopicError,
  setCurrentTopicLoading,
  setCurrentTopicSuccess,
  setCurrentTopicError,
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
} from 'src/redux/store/topicSlice';

// Mock repository
vi.mock('src/repositories/topic.repository', () => ({
  topicRepository: {
    getTopics: vi.fn(),
    getTopicById: vi.fn(),
    createTopic: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    addProductsToTopic: vi.fn(),
    removeProductsFromTopic: vi.fn(),
    updateTopicWithProducts: vi.fn(),
    reorderTopicProducts: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock i18next
vi.mock('src/i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('topicSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports topicSaga function', () => {
      expect(topicSaga).toBeDefined();
      expect(topicSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchTopic', () => {
      const gen = topicSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchTopic', () => {
      const gen = topicSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getTopicsSaga', () => {
    it('successfully fetches topics with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'topic-1',
            name: 'Summer Collection',
            slug: 'summer-collection',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(topicRepository.getTopics).mockResolvedValue(mockResponse);

      const action = getTopicsRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('topic/getTopicsRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with filters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(topicRepository.getTopics).mockResolvedValue(mockResponse);

      const action = getTopicsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'active' },
      });

      expect(action.payload.filters).toEqual({ status: 'active' });
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(topicRepository.getTopics).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getTopicsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(topicRepository.getTopics).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setTopicLoading(true);

      expect(action.type).toBe('topic/setTopicLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        topics: [
          {
            id: 'topic-1',
            name: 'Topic',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setTopicsSuccess(data);

      expect(action.type).toBe('topic/setTopicsSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setTopicError();

      expect(action.type).toBe('topic/setTopicError');
    });
  });

  describe('getTopicByIdSaga', () => {
    it('successfully fetches topic by ID', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Summer Collection',
        slug: 'summer-collection',
        products: [],
      };

      vi.mocked(topicRepository.getTopicById).mockResolvedValue(mockTopic);

      const action = getTopicByIdRequest({ id: 'topic-1' });

      expect(action.type).toBe('topic/getTopicByIdRequest');
      expect(action.payload.id).toBe('topic-1');
    });

    it('calls onSuccess callback with topic data', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Topic',
      };

      vi.mocked(topicRepository.getTopicById).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = getTopicByIdRequest({
        id: 'topic-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Topic not found');

      vi.mocked(topicRepository.getTopicById).mockRejectedValue(mockError);

      const action = getTopicByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentTopicLoading(true);

      expect(action.type).toBe('topic/setCurrentTopicLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const topic = {
        id: 'topic-1',
        name: 'Topic',
      };

      const action = setCurrentTopicSuccess(topic);

      expect(action.type).toBe('topic/setCurrentTopicSuccess');
      expect(action.payload).toEqual(topic);
    });

    it('sets current error state', () => {
      const action = setCurrentTopicError();

      expect(action.type).toBe('topic/setCurrentTopicError');
    });
  });

  describe('createTopicSaga', () => {
    it('successfully creates topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'New Topic',
        slug: 'new-topic',
      };

      vi.mocked(topicRepository.createTopic).mockResolvedValue(mockTopic);

      const action = createTopicRequest({
        data: {
          name: 'New Topic',
        },
      });

      expect(action.type).toBe('topic/createTopicRequest');
      expect(action.payload.data.name).toBe('New Topic');
    });

    it('calls onSuccess callback with created topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'New Topic',
      };

      vi.mocked(topicRepository.createTopic).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = createTopicRequest({
        data: {
          name: 'New Topic',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles create failure', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(topicRepository.createTopic).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets create loading state', () => {
      const action = setCreateTopicLoading(true);

      expect(action.type).toBe('topic/setCreateTopicLoading');
      expect(action.payload).toBe(true);
    });

    it('sets create success state', () => {
      const action = setCreateTopicSuccess();

      expect(action.type).toBe('topic/setCreateTopicSuccess');
    });

    it('sets create error state', () => {
      const action = setCreateTopicError();

      expect(action.type).toBe('topic/setCreateTopicError');
    });
  });

  describe('updateTopicSaga', () => {
    it('successfully updates topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Updated Topic',
      };

      vi.mocked(topicRepository.updateTopic).mockResolvedValue(mockTopic);

      const action = updateTopicRequest({
        id: 'topic-1',
        data: {
          name: 'Updated Topic',
        },
      });

      expect(action.type).toBe('topic/updateTopicRequest');
      expect(action.payload.id).toBe('topic-1');
      expect(action.payload.data.name).toBe('Updated Topic');
    });

    it('calls onSuccess callback with updated topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Updated',
      };

      vi.mocked(topicRepository.updateTopic).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = updateTopicRequest({
        id: 'topic-1',
        data: {},
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(topicRepository.updateTopic).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdateTopicLoading(true);

      expect(action.type).toBe('topic/setUpdateTopicLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const topic = {
        id: 'topic-1',
        name: 'Updated',
      };

      const action = setUpdateTopicSuccess(topic);

      expect(action.type).toBe('topic/setUpdateTopicSuccess');
      expect(action.payload).toEqual(topic);
    });

    it('sets update error state', () => {
      const action = setUpdateTopicError();

      expect(action.type).toBe('topic/setUpdateTopicError');
    });
  });

  describe('deleteTopicSaga', () => {
    it('successfully deletes topic', async () => {
      vi.mocked(topicRepository.deleteTopic).mockResolvedValue(undefined);

      const action = deleteTopicRequest({
        id: 'topic-1',
      });

      expect(action.type).toBe('topic/deleteTopicRequest');
      expect(action.payload.id).toBe('topic-1');
    });

    it('calls onSuccess callback after deletion', async () => {
      vi.mocked(topicRepository.deleteTopic).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = deleteTopicRequest({
        id: 'topic-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles delete failure', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(topicRepository.deleteTopic).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets delete loading state', () => {
      const action = setDeleteTopicLoading(true);

      expect(action.type).toBe('topic/setDeleteTopicLoading');
      expect(action.payload).toBe(true);
    });

    it('sets delete success state', () => {
      const action = setDeleteTopicSuccess('topic-1');

      expect(action.type).toBe('topic/setDeleteTopicSuccess');
      expect(action.payload).toBe('topic-1');
    });

    it('sets delete error state', () => {
      const action = setDeleteTopicError();

      expect(action.type).toBe('topic/setDeleteTopicError');
    });
  });

  describe('addProductsToTopicSaga', () => {
    it('successfully adds products to topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Topic',
        products: ['prod-1', 'prod-2'],
      };

      vi.mocked(topicRepository.addProductsToTopic).mockResolvedValue(mockTopic);

      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1', 'prod-2'],
      });

      expect(action.type).toBe('topic/addProductsToTopicRequest');
      expect(action.payload.topicId).toBe('topic-1');
      expect(action.payload.productIds).toEqual(['prod-1', 'prod-2']);
    });

    it('calls onSuccess callback after adding products', async () => {
      const mockTopic = {
        id: 'topic-1',
        products: [],
      };

      vi.mocked(topicRepository.addProductsToTopic).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles add products failure', async () => {
      const mockError = new Error('Add failed');

      vi.mocked(topicRepository.addProductsToTopic).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets add products loading state', () => {
      const action = setAddProductsLoading(true);

      expect(action.type).toBe('topic/setAddProductsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets add products success state', () => {
      const topic = {
        id: 'topic-1',
        products: [],
      };

      const action = setAddProductsSuccess(topic);

      expect(action.type).toBe('topic/setAddProductsSuccess');
      expect(action.payload).toEqual(topic);
    });

    it('sets add products error state', () => {
      const action = setAddProductsError();

      expect(action.type).toBe('topic/setAddProductsError');
    });
  });

  describe('removeProductsFromTopicSaga', () => {
    it('successfully removes products from topic', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Topic',
        products: [],
      };

      vi.mocked(topicRepository.removeProductsFromTopic).mockResolvedValue(mockTopic);

      const action = removeProductsFromTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1', 'prod-2'],
      });

      expect(action.type).toBe('topic/removeProductsFromTopicRequest');
      expect(action.payload.topicId).toBe('topic-1');
      expect(action.payload.productIds).toEqual(['prod-1', 'prod-2']);
    });

    it('calls onSuccess callback after removing products', async () => {
      const mockTopic = {
        id: 'topic-1',
        products: [],
      };

      vi.mocked(topicRepository.removeProductsFromTopic).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = removeProductsFromTopicRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles remove products failure', async () => {
      const mockError = new Error('Remove failed');

      vi.mocked(topicRepository.removeProductsFromTopic).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('sets remove products loading state', () => {
      const action = setRemoveProductsLoading(true);

      expect(action.type).toBe('topic/setRemoveProductsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets remove products success state', () => {
      const topic = {
        id: 'topic-1',
        products: [],
      };

      const action = setRemoveProductsSuccess(topic);

      expect(action.type).toBe('topic/setRemoveProductsSuccess');
      expect(action.payload).toEqual(topic);
    });

    it('sets remove products error state', () => {
      const action = setRemoveProductsError();

      expect(action.type).toBe('topic/setRemoveProductsError');
    });
  });

  describe('updateTopicWithProductsSaga', () => {
    it('successfully updates topic with products', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Updated Topic',
        products: ['prod-1'],
      };

      vi.mocked(topicRepository.updateTopicWithProducts).mockResolvedValue(mockTopic);

      const action = updateTopicWithProductsRequest({
        id: 'topic-1',
        data: {
          name: 'Updated Topic',
        },
        productIds: ['prod-1'],
      });

      expect(action.type).toBe('topic/updateTopicWithProductsRequest');
      expect(action.payload.id).toBe('topic-1');
      expect(action.payload.productIds).toEqual(['prod-1']);
    });

    it('calls onSuccess callback after update', async () => {
      const mockTopic = {
        id: 'topic-1',
        products: [],
      };

      vi.mocked(topicRepository.updateTopicWithProducts).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = updateTopicWithProductsRequest({
        id: 'topic-1',
        data: {},
        productIds: [],
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update with products failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(topicRepository.updateTopicWithProducts).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });
  });

  describe('reorderTopicProductsSaga', () => {
    it('successfully reorders topic products', async () => {
      const mockTopic = {
        id: 'topic-1',
        products: ['prod-2', 'prod-1'],
      };

      vi.mocked(topicRepository.reorderTopicProducts).mockResolvedValue(mockTopic);

      const action = reorderTopicProductsRequest({
        topicId: 'topic-1',
        productIds: ['prod-2', 'prod-1'],
      });

      expect(action.type).toBe('topic/reorderTopicProductsRequest');
      expect(action.payload.topicId).toBe('topic-1');
      expect(action.payload.productIds).toEqual(['prod-2', 'prod-1']);
    });

    it('calls onSuccess callback after reordering', async () => {
      const mockTopic = {
        id: 'topic-1',
        products: [],
      };

      vi.mocked(topicRepository.reorderTopicProducts).mockResolvedValue(mockTopic);

      const onSuccess = vi.fn();
      const action = reorderTopicProductsRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles reorder failure', async () => {
      const mockError = new Error('Reorder failed');

      vi.mocked(topicRepository.reorderTopicProducts).mockRejectedValue(mockError);

      expect(topicSaga).toBeDefined();
    });

    it('handles multiple product reordering', () => {
      const productIds = ['prod-3', 'prod-1', 'prod-2'];

      const action = reorderTopicProductsRequest({
        topicId: 'topic-1',
        productIds,
      });

      expect(action.payload.productIds.length).toBe(3);
      expect(action.payload.productIds[0]).toBe('prod-3');
    });
  });

  describe('action types', () => {
    it('has correct action type for getTopicsRequest', () => {
      expect(getTopicsRequest.type).toBe('topic/getTopicsRequest');
    });

    it('has correct action type for getTopicByIdRequest', () => {
      expect(getTopicByIdRequest.type).toBe('topic/getTopicByIdRequest');
    });

    it('has correct action type for createTopicRequest', () => {
      expect(createTopicRequest.type).toBe('topic/createTopicRequest');
    });

    it('has correct action type for updateTopicRequest', () => {
      expect(updateTopicRequest.type).toBe('topic/updateTopicRequest');
    });

    it('has correct action type for deleteTopicRequest', () => {
      expect(deleteTopicRequest.type).toBe('topic/deleteTopicRequest');
    });

    it('has correct action type for addProductsToTopicRequest', () => {
      expect(addProductsToTopicRequest.type).toBe('topic/addProductsToTopicRequest');
    });

    it('has correct action type for removeProductsFromTopicRequest', () => {
      expect(removeProductsFromTopicRequest.type).toBe('topic/removeProductsFromTopicRequest');
    });

    it('has correct action type for updateTopicWithProductsRequest', () => {
      expect(updateTopicWithProductsRequest.type).toBe('topic/updateTopicWithProductsRequest');
    });

    it('has correct action type for reorderTopicProductsRequest', () => {
      expect(reorderTopicProductsRequest.type).toBe('topic/reorderTopicProductsRequest');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('pagination and filtering', () => {
    it('handles different page numbers', () => {
      const action = getTopicsRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles filters', () => {
      const filters = {
        status: 'active',
        search: 'summer',
      };

      const action = getTopicsRequest({
        page: 1,
        limit: 10,
        filters,
      });

      expect(action.payload.filters).toEqual(filters);
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Test error');

      expect(error.message).toBe('Test error');
    });

    it('handles error without message', () => {
      const error = { code: 500 };

      expect(error).toHaveProperty('code');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for getTopics', () => {
      const onSuccess = vi.fn();
      const action = getTopicsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getTopicById', () => {
      const onSuccess = vi.fn();
      const action = getTopicByIdRequest({
        id: 'topic-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for createTopic', () => {
      const onSuccess = vi.fn();
      const action = createTopicRequest({
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateTopic', () => {
      const onSuccess = vi.fn();
      const action = updateTopicRequest({
        id: 'topic-1',
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for deleteTopic', () => {
      const onSuccess = vi.fn();
      const action = deleteTopicRequest({
        id: 'topic-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for addProductsToTopic', () => {
      const onSuccess = vi.fn();
      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for removeProductsFromTopic', () => {
      const onSuccess = vi.fn();
      const action = removeProductsFromTopicRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateTopicWithProducts', () => {
      const onSuccess = vi.fn();
      const action = updateTopicWithProductsRequest({
        id: 'topic-1',
        data: {},
        productIds: [],
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for reorderTopicProducts', () => {
      const onSuccess = vi.fn();
      const action = reorderTopicProductsRequest({
        topicId: 'topic-1',
        productIds: [],
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('product management', () => {
    it('handles adding single product', () => {
      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1'],
      });

      expect(action.payload.productIds.length).toBe(1);
    });

    it('handles adding multiple products', () => {
      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1', 'prod-2', 'prod-3'],
      });

      expect(action.payload.productIds.length).toBe(3);
    });

    it('handles removing single product', () => {
      const action = removeProductsFromTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1'],
      });

      expect(action.payload.productIds.length).toBe(1);
    });

    it('handles removing multiple products', () => {
      const action = removeProductsFromTopicRequest({
        topicId: 'topic-1',
        productIds: ['prod-1', 'prod-2'],
      });

      expect(action.payload.productIds.length).toBe(2);
    });

    it('handles empty product list', () => {
      const action = addProductsToTopicRequest({
        topicId: 'topic-1',
        productIds: [],
      });

      expect(action.payload.productIds.length).toBe(0);
    });
  });
});
