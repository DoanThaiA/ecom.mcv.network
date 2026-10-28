import { describe, it, expect, beforeEach } from 'vitest';
import {
  topicSlice,
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
  getTopicsRequest,
  getTopicByIdRequest,
  createTopicRequest,
  updateTopicRequest,
  deleteTopicRequest,
  addProductsToTopicRequest,
  removeProductsFromTopicRequest,
  updateTopicWithProductsRequest,
  reorderTopicProductsRequest,
  selectTopics,
  selectCurrentTopic,
  selectTopicLoading,
  selectCurrentTopicLoading,
  selectCreateTopicLoading,
  selectUpdateTopicLoading,
  selectDeleteTopicLoading,
  selectAddProductsLoading,
  selectRemoveProductsLoading,
  selectTopicPagination,
  selectTopicSearchQuery,
  selectTopicStatusFilter,
  type TopicState,
} from 'src/redux/store/topicSlice';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';

describe('topicSlice', () => {
  const topicReducer = topicSlice.reducer;

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

  const mockTopic: Topic = {
    id: 'topic1',
    name: 'Topic 1',
    status: 'active',
  } as Topic;

  const mockTopicList: Topic[] = [
    mockTopic,
    {
      id: 'topic2',
      name: 'Topic 2',
      status: 'inactive',
    } as Topic,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setTopicLoading', () => {
      it('sets loading to true', () => {
        const state = topicReducer(initialState, setTopicLoading(true));
        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          loading: true,
        };
        const state = topicReducer(stateWithLoading, setTopicLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setTopicsSuccess', () => {
      it('sets topics and pagination and stops loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          loading: true,
        };
        const state = topicReducer(
          stateWithLoading,
          setTopicsSuccess({
            topics: mockTopicList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.topics).toEqual(mockTopicList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
      });
    });

    describe('setTopicError', () => {
      it('stops loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          loading: true,
        };
        const state = topicReducer(stateWithLoading, setTopicError());
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentTopicLoading', () => {
      it('sets current loading to true', () => {
        const state = topicReducer(initialState, setCurrentTopicLoading(true));
        expect(state.currentLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          currentLoading: true,
        };
        const state = topicReducer(stateWithLoading, setCurrentTopicLoading(false));
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentTopicSuccess', () => {
      it('sets current topic and stops loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          currentLoading: true,
        };
        const state = topicReducer(stateWithLoading, setCurrentTopicSuccess(mockTopic));
        expect(state.currentTopic).toEqual(mockTopic);
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentTopicError', () => {
      it('stops current loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          currentLoading: true,
        };
        const state = topicReducer(stateWithLoading, setCurrentTopicError());
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('clearCurrentTopic', () => {
      it('clears current topic', () => {
        const stateWithTopic: TopicState = {
          ...initialState,
          currentTopic: mockTopic,
        };
        const state = topicReducer(stateWithTopic, clearCurrentTopic());
        expect(state.currentTopic).toBe(null);
      });
    });

    describe('setCreateTopicLoading', () => {
      it('sets create loading to true', () => {
        const state = topicReducer(initialState, setCreateTopicLoading(true));
        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          createLoading: true,
        };
        const state = topicReducer(stateWithLoading, setCreateTopicLoading(false));
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateTopicSuccess', () => {
      it('adds new topic to start of list and stops loading', () => {
        const stateWithTopics: TopicState = {
          ...initialState,
          topics: [mockTopicList[1]],
          createLoading: true,
        };
        const state = topicReducer(stateWithTopics, setCreateTopicSuccess(mockTopic));
        expect(state.topics).toEqual([mockTopic, mockTopicList[1]]);
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateTopicError', () => {
      it('stops create loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          createLoading: true,
        };
        const state = topicReducer(stateWithLoading, setCreateTopicError());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdateTopicLoading', () => {
      it('sets update loading to true', () => {
        const state = topicReducer(initialState, setUpdateTopicLoading(true));
        expect(state.updateLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          updateLoading: true,
        };
        const state = topicReducer(stateWithLoading, setUpdateTopicLoading(false));
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setUpdateTopicSuccess', () => {
      it('updates topic in list and stops loading', () => {
        const stateWithTopics: TopicState = {
          ...initialState,
          topics: mockTopicList,
          updateLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
        const state = topicReducer(stateWithTopics, setUpdateTopicSuccess(updatedTopic));
        expect(state.topics[0].name).toBe('Updated Topic');
        expect(state.updateLoading).toBe(false);
      });

      it('updates current topic if id matches', () => {
        const stateWithCurrent: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          updateLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
        const state = topicReducer(stateWithCurrent, setUpdateTopicSuccess(updatedTopic));
        expect(state.currentTopic?.name).toBe('Updated Topic');
      });

      it('does not update current topic if id does not match', () => {
        const stateWithCurrent: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopicList[1],
          updateLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
        const state = topicReducer(stateWithCurrent, setUpdateTopicSuccess(updatedTopic));
        expect(state.currentTopic?.id).toBe('topic2');
        expect(state.currentTopic?.name).toBe('Topic 2');
      });
    });

    describe('setUpdateTopicError', () => {
      it('stops update loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          updateLoading: true,
        };
        const state = topicReducer(stateWithLoading, setUpdateTopicError());
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeleteTopicLoading', () => {
      it('sets delete loading to true', () => {
        const state = topicReducer(initialState, setDeleteTopicLoading(true));
        expect(state.deleteLoading).toBe(true);
      });

      it('sets delete loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = topicReducer(stateWithLoading, setDeleteTopicLoading(false));
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setDeleteTopicSuccess', () => {
      it('removes topic from list and stops loading', () => {
        const stateWithTopics: TopicState = {
          ...initialState,
          topics: mockTopicList,
          deleteLoading: true,
        };
        const state = topicReducer(stateWithTopics, setDeleteTopicSuccess('topic1'));
        expect(state.topics).toEqual([mockTopicList[1]]);
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current topic if id matches', () => {
        const stateWithCurrent: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          deleteLoading: true,
        };
        const state = topicReducer(stateWithCurrent, setDeleteTopicSuccess('topic1'));
        expect(state.currentTopic).toBe(null);
      });

      it('does not clear current topic if id does not match', () => {
        const stateWithCurrent: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopicList[1],
          deleteLoading: true,
        };
        const state = topicReducer(stateWithCurrent, setDeleteTopicSuccess('topic1'));
        expect(state.currentTopic?.id).toBe('topic2');
      });
    });

    describe('setDeleteTopicError', () => {
      it('stops delete loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = topicReducer(stateWithLoading, setDeleteTopicError());
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setAddProductsLoading', () => {
      it('sets add products loading to true', () => {
        const state = topicReducer(initialState, setAddProductsLoading(true));
        expect(state.addProductsLoading).toBe(true);
      });

      it('sets add products loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          addProductsLoading: true,
        };
        const state = topicReducer(stateWithLoading, setAddProductsLoading(false));
        expect(state.addProductsLoading).toBe(false);
      });
    });

    describe('setAddProductsSuccess', () => {
      it('updates current topic and topic in list and stops loading', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          addProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
        const state = topicReducer(stateWithData, setAddProductsSuccess(updatedTopic));
        expect(state.currentTopic?.name).toBe('Updated Topic');
        expect(state.topics[0].name).toBe('Updated Topic');
        expect(state.addProductsLoading).toBe(false);
      });

      it('does not update current topic if id does not match', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          addProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopicList[1], name: 'Updated' };
        const state = topicReducer(stateWithData, setAddProductsSuccess(updatedTopic));
        expect(state.currentTopic?.id).toBe('topic1');
        expect(state.currentTopic?.name).toBe('Topic 1');
      });

      it('does not update topic in list if not found', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: [mockTopicList[1]],
          addProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated' };
        const state = topicReducer(stateWithData, setAddProductsSuccess(updatedTopic));
        expect(state.topics).toEqual([mockTopicList[1]]);
      });
    });

    describe('setAddProductsError', () => {
      it('stops add products loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          addProductsLoading: true,
        };
        const state = topicReducer(stateWithLoading, setAddProductsError());
        expect(state.addProductsLoading).toBe(false);
      });
    });

    describe('setRemoveProductsLoading', () => {
      it('sets remove products loading to true', () => {
        const state = topicReducer(initialState, setRemoveProductsLoading(true));
        expect(state.removeProductsLoading).toBe(true);
      });

      it('sets remove products loading to false', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          removeProductsLoading: true,
        };
        const state = topicReducer(stateWithLoading, setRemoveProductsLoading(false));
        expect(state.removeProductsLoading).toBe(false);
      });
    });

    describe('setRemoveProductsSuccess', () => {
      it('updates current topic and topic in list and stops loading', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          removeProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
        const state = topicReducer(stateWithData, setRemoveProductsSuccess(updatedTopic));
        expect(state.currentTopic?.name).toBe('Updated Topic');
        expect(state.topics[0].name).toBe('Updated Topic');
        expect(state.removeProductsLoading).toBe(false);
      });

      it('does not update current topic if id does not match', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: mockTopicList,
          currentTopic: mockTopic,
          removeProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopicList[1], name: 'Updated' };
        const state = topicReducer(stateWithData, setRemoveProductsSuccess(updatedTopic));
        expect(state.currentTopic?.id).toBe('topic1');
        expect(state.currentTopic?.name).toBe('Topic 1');
      });

      it('does not update topic in list if not found', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: [mockTopicList[1]],
          removeProductsLoading: true,
        };
        const updatedTopic: Topic = { ...mockTopic, name: 'Updated' };
        const state = topicReducer(stateWithData, setRemoveProductsSuccess(updatedTopic));
        expect(state.topics).toEqual([mockTopicList[1]]);
      });
    });

    describe('setRemoveProductsError', () => {
      it('stops remove products loading', () => {
        const stateWithLoading: TopicState = {
          ...initialState,
          removeProductsLoading: true,
        };
        const state = topicReducer(stateWithLoading, setRemoveProductsError());
        expect(state.removeProductsLoading).toBe(false);
      });
    });

    describe('setSearchQuery', () => {
      it('sets search query', () => {
        const state = topicReducer(initialState, setSearchQuery('test'));
        expect(state.searchQuery).toBe('test');
      });

      it('replaces existing search query', () => {
        const stateWithQuery: TopicState = {
          ...initialState,
          searchQuery: 'old',
        };
        const state = topicReducer(stateWithQuery, setSearchQuery('new'));
        expect(state.searchQuery).toBe('new');
      });
    });

    describe('setStatusFilter', () => {
      it('sets status filter to active', () => {
        const state = topicReducer(initialState, setStatusFilter('active'));
        expect(state.statusFilter).toBe('active');
      });

      it('sets status filter to inactive', () => {
        const state = topicReducer(initialState, setStatusFilter('inactive'));
        expect(state.statusFilter).toBe('inactive');
      });

      it('sets status filter to all', () => {
        const stateWithFilter: TopicState = {
          ...initialState,
          statusFilter: 'active',
        };
        const state = topicReducer(stateWithFilter, setStatusFilter('all'));
        expect(state.statusFilter).toBe('all');
      });
    });

    describe('resetTopicState', () => {
      it('resets topics, loading, pagination, searchQuery, and statusFilter', () => {
        const stateWithData: TopicState = {
          ...initialState,
          topics: mockTopicList,
          loading: true,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          searchQuery: 'test',
          statusFilter: 'active',
          currentTopic: mockTopic,
        };
        const state = topicReducer(stateWithData, resetTopicState());
        expect(state.topics).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.searchQuery).toBe('');
        expect(state.statusFilter).toBe('all');
      });

      it('does not reset currentTopic and other loading states', () => {
        const stateWithData: TopicState = {
          ...initialState,
          currentTopic: mockTopic,
          currentLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
          addProductsLoading: true,
          removeProductsLoading: true,
        };
        const state = topicReducer(stateWithData, resetTopicState());
        expect(state.currentTopic).toEqual(mockTopic);
        expect(state.currentLoading).toBe(true);
        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
        expect(state.addProductsLoading).toBe(true);
        expect(state.removeProductsLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getTopicsRequest', () => {
      it('creates correct action type', () => {
        const action = getTopicsRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('topic/getTopicsRequest');
      });

      it('includes pagination in payload', () => {
        const action = getTopicsRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes search in payload', () => {
        const action = getTopicsRequest({
          search: 'test',
        });
        expect(action.payload.search).toBe('test');
      });

      it('includes status in payload', () => {
        const action = getTopicsRequest({
          status: 'active' as any,
        });
        expect(action.payload.status).toBe('active');
      });
    });

    describe('getTopicByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getTopicByIdRequest({ id: 'topic1' });
        expect(action.type).toBe('topic/getTopicByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getTopicByIdRequest({ id: 'topic1' });
        expect(action.payload.id).toBe('topic1');
      });
    });

    describe('createTopicRequest', () => {
      it('creates correct action type', () => {
        const action = createTopicRequest({
          data: { name: 'New Topic' } as any,
        });
        expect(action.type).toBe('topic/createTopicRequest');
      });

      it('includes data in payload', () => {
        const data = { name: 'New Topic' } as any;
        const action = createTopicRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = createTopicRequest({
          data: { name: 'New Topic' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateTopicRequest', () => {
      it('creates correct action type', () => {
        const action = updateTopicRequest({
          id: 'topic1',
          data: { name: 'Updated Topic' },
        });
        expect(action.type).toBe('topic/updateTopicRequest');
      });

      it('includes id and data in payload', () => {
        const action = updateTopicRequest({
          id: 'topic1',
          data: { name: 'Updated Topic' },
        });
        expect(action.payload.id).toBe('topic1');
        expect(action.payload.data).toEqual({ name: 'Updated Topic' });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateTopicRequest({
          id: 'topic1',
          data: { name: 'Updated' },
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deleteTopicRequest', () => {
      it('creates correct action type', () => {
        const action = deleteTopicRequest({ id: 'topic1' });
        expect(action.type).toBe('topic/deleteTopicRequest');
      });

      it('includes id in payload', () => {
        const action = deleteTopicRequest({ id: 'topic1' });
        expect(action.payload.id).toBe('topic1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = deleteTopicRequest({ id: 'topic1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('addProductsToTopicRequest', () => {
      it('creates correct action type', () => {
        const action = addProductsToTopicRequest({
          topicId: 'topic1',
          products: [{ productId: 'prod1', order: 1 } as any],
        });
        expect(action.type).toBe('topic/addProductsToTopicRequest');
      });

      it('includes topicId and products in payload', () => {
        const products = [{ productId: 'prod1', order: 1 } as any];
        const action = addProductsToTopicRequest({
          topicId: 'topic1',
          products,
        });
        expect(action.payload.topicId).toBe('topic1');
        expect(action.payload.products).toEqual(products);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = addProductsToTopicRequest({
          topicId: 'topic1',
          products: [{ productId: 'prod1', order: 1 } as any],
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('removeProductsFromTopicRequest', () => {
      it('creates correct action type', () => {
        const action = removeProductsFromTopicRequest({
          topicId: 'topic1',
          productIds: ['prod1', 'prod2'],
        });
        expect(action.type).toBe('topic/removeProductsFromTopicRequest');
      });

      it('includes topicId and productIds in payload', () => {
        const action = removeProductsFromTopicRequest({
          topicId: 'topic1',
          productIds: ['prod1', 'prod2'],
        });
        expect(action.payload.topicId).toBe('topic1');
        expect(action.payload.productIds).toEqual(['prod1', 'prod2']);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = removeProductsFromTopicRequest({
          topicId: 'topic1',
          productIds: ['prod1'],
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateTopicWithProductsRequest', () => {
      it('creates correct action type', () => {
        const action = updateTopicWithProductsRequest({
          id: 'topic1',
          data: { name: 'Updated' },
          productDiff: { add: [], remove: [] },
        });
        expect(action.type).toBe('topic/updateTopicWithProductsRequest');
      });

      it('includes id, data, and productDiff in payload', () => {
        const data = { name: 'Updated' };
        const productDiff = { add: [], remove: [] };
        const action = updateTopicWithProductsRequest({
          id: 'topic1',
          data,
          productDiff,
        });
        expect(action.payload.id).toBe('topic1');
        expect(action.payload.data).toEqual(data);
        expect(action.payload.productDiff).toEqual(productDiff);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateTopicWithProductsRequest({
          id: 'topic1',
          data: { name: 'Updated' },
          productDiff: { add: [], remove: [] },
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('reorderTopicProductsRequest', () => {
      it('creates correct action type', () => {
        const action = reorderTopicProductsRequest({
          topicId: 'topic1',
          products: [{ productId: 'prod1', order: 1 }],
        });
        expect(action.type).toBe('topic/reorderTopicProductsRequest');
      });

      it('includes topicId and products in payload', () => {
        const products = [
          { productId: 'prod1', order: 1 },
          { productId: 'prod2', order: 2 },
        ];
        const action = reorderTopicProductsRequest({
          topicId: 'topic1',
          products,
        });
        expect(action.payload.topicId).toBe('topic1');
        expect(action.payload.products).toEqual(products);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = reorderTopicProductsRequest({
          topicId: 'topic1',
          products: [{ productId: 'prod1', order: 1 }],
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectTopics', () => {
      it('returns empty array for initial state', () => {
        expect(selectTopics({ topic: initialState })).toEqual([]);
      });

      it('returns topics when present', () => {
        const state: TopicState = { ...initialState, topics: mockTopicList };
        expect(selectTopics({ topic: state })).toEqual(mockTopicList);
      });
    });

    describe('selectCurrentTopic', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentTopic({ topic: initialState })).toBe(null);
      });

      it('returns current topic when present', () => {
        const state: TopicState = { ...initialState, currentTopic: mockTopic };
        expect(selectCurrentTopic({ topic: state })).toEqual(mockTopic);
      });
    });

    describe('selectTopicLoading', () => {
      it('returns false for initial state', () => {
        expect(selectTopicLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: TopicState = { ...initialState, loading: true };
        expect(selectTopicLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectCurrentTopicLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentTopicLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: TopicState = { ...initialState, currentLoading: true };
        expect(selectCurrentTopicLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectCreateTopicLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCreateTopicLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when creating', () => {
        const state: TopicState = { ...initialState, createLoading: true };
        expect(selectCreateTopicLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectUpdateTopicLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateTopicLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: TopicState = { ...initialState, updateLoading: true };
        expect(selectUpdateTopicLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectDeleteTopicLoading', () => {
      it('returns false for initial state', () => {
        expect(selectDeleteTopicLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when deleting', () => {
        const state: TopicState = { ...initialState, deleteLoading: true };
        expect(selectDeleteTopicLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectAddProductsLoading', () => {
      it('returns false for initial state', () => {
        expect(selectAddProductsLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when adding products', () => {
        const state: TopicState = { ...initialState, addProductsLoading: true };
        expect(selectAddProductsLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectRemoveProductsLoading', () => {
      it('returns false for initial state', () => {
        expect(selectRemoveProductsLoading({ topic: initialState })).toBe(false);
      });

      it('returns true when removing products', () => {
        const state: TopicState = { ...initialState, removeProductsLoading: true };
        expect(selectRemoveProductsLoading({ topic: state })).toBe(true);
      });
    });

    describe('selectTopicPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectTopicPagination({ topic: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: TopicState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectTopicPagination({ topic: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectTopicSearchQuery', () => {
      it('returns empty string for initial state', () => {
        expect(selectTopicSearchQuery({ topic: initialState })).toBe('');
      });

      it('returns current search query', () => {
        const state: TopicState = { ...initialState, searchQuery: 'test' };
        expect(selectTopicSearchQuery({ topic: state })).toBe('test');
      });
    });

    describe('selectTopicStatusFilter', () => {
      it('returns "all" for initial state', () => {
        expect(selectTopicStatusFilter({ topic: initialState })).toBe('all');
      });

      it('returns current status filter', () => {
        const state: TopicState = { ...initialState, statusFilter: 'active' };
        expect(selectTopicStatusFilter({ topic: state })).toBe('active');
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // Create
      let state = topicReducer(initialState, setCreateTopicLoading(true));
      state = topicReducer(state, setCreateTopicSuccess(mockTopic));
      expect(selectTopics({ topic: state })).toEqual([mockTopic]);
      expect(selectCreateTopicLoading({ topic: state })).toBe(false);

      // Read
      state = topicReducer(state, setTopicLoading(true));
      state = topicReducer(
        state,
        setTopicsSuccess({
          topics: mockTopicList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectTopics({ topic: state })).toEqual(mockTopicList);

      // Update
      state = topicReducer(state, setUpdateTopicLoading(true));
      state = topicReducer(state, setCurrentTopicSuccess(mockTopic));
      const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
      state = topicReducer(state, setUpdateTopicSuccess(updatedTopic));
      expect(selectTopics({ topic: state })[0].name).toBe('Updated Topic');

      // Delete
      state = topicReducer(state, setDeleteTopicLoading(true));
      state = topicReducer(state, setDeleteTopicSuccess('topic1'));
      expect(selectTopics({ topic: state })).toEqual([mockTopicList[1]]);
    });

    it('handles product management flow', () => {
      let state = topicReducer(
        initialState,
        setTopicsSuccess({
          topics: mockTopicList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      state = topicReducer(state, setCurrentTopicSuccess(mockTopic));

      // Add products
      state = topicReducer(state, setAddProductsLoading(true));
      const topicWithProducts: Topic = { ...mockTopic, name: 'Topic with Products' };
      state = topicReducer(state, setAddProductsSuccess(topicWithProducts));
      expect(selectCurrentTopic({ topic: state })?.name).toBe('Topic with Products');
      expect(selectTopics({ topic: state })[0].name).toBe('Topic with Products');
      expect(selectAddProductsLoading({ topic: state })).toBe(false);

      // Remove products
      state = topicReducer(state, setRemoveProductsLoading(true));
      const topicWithoutProducts: Topic = { ...mockTopic, name: 'Topic without Products' };
      state = topicReducer(state, setRemoveProductsSuccess(topicWithoutProducts));
      expect(selectCurrentTopic({ topic: state })?.name).toBe('Topic without Products');
      expect(selectTopics({ topic: state })[0].name).toBe('Topic without Products');
      expect(selectRemoveProductsLoading({ topic: state })).toBe(false);
    });

    it('handles independent loading states', () => {
      let state = topicReducer(initialState, setTopicLoading(true));
      state = topicReducer(state, setCurrentTopicLoading(true));
      state = topicReducer(state, setCreateTopicLoading(true));
      state = topicReducer(state, setUpdateTopicLoading(true));
      state = topicReducer(state, setDeleteTopicLoading(true));
      state = topicReducer(state, setAddProductsLoading(true));
      state = topicReducer(state, setRemoveProductsLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);
      expect(state.addProductsLoading).toBe(true);
      expect(state.removeProductsLoading).toBe(true);

      // Each can be stopped independently
      state = topicReducer(state, setTopicLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentLoading).toBe(true);
    });

    it('handles search and filter flow', () => {
      let state = topicReducer(initialState, setSearchQuery('test'));
      state = topicReducer(state, setStatusFilter('active'));

      state = topicReducer(state, setTopicLoading(true));
      state = topicReducer(
        state,
        setTopicsSuccess({
          topics: mockTopicList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      expect(selectTopicSearchQuery({ topic: state })).toBe('test');
      expect(selectTopicStatusFilter({ topic: state })).toBe('active');
      expect(selectTopics({ topic: state })).toEqual(mockTopicList);
    });

    it('handles reset flow', () => {
      let state = topicReducer(
        initialState,
        setTopicsSuccess({
          topics: mockTopicList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = topicReducer(state, setSearchQuery('test'));
      state = topicReducer(state, setStatusFilter('active'));

      state = topicReducer(state, resetTopicState());
      expect(selectTopics({ topic: state })).toEqual([]);
      expect(selectTopicPagination({ topic: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectTopicSearchQuery({ topic: state })).toBe('');
      expect(selectTopicStatusFilter({ topic: state })).toBe('all');
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = topicReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('handles update when topic not in list', () => {
      const stateWithTopics: TopicState = {
        ...initialState,
        topics: [mockTopicList[1]],
      };
      const updatedTopic: Topic = { ...mockTopic, name: 'Updated Topic' };
      const state = topicReducer(stateWithTopics, setUpdateTopicSuccess(updatedTopic));
      expect(state.topics).toEqual([mockTopicList[1]]);
    });

    it('handles delete when topic not in list', () => {
      const stateWithTopics: TopicState = {
        ...initialState,
        topics: [mockTopicList[1]],
      };
      const state = topicReducer(stateWithTopics, setDeleteTopicSuccess('topic1'));
      expect(state.topics).toEqual([mockTopicList[1]]);
    });

    it('handles create with empty list', () => {
      const state = topicReducer(initialState, setCreateTopicSuccess(mockTopic));
      expect(state.topics).toEqual([mockTopic]);
    });

    it('handles add products when topic not in list', () => {
      const stateWithTopics: TopicState = {
        ...initialState,
        topics: [mockTopicList[1]],
      };
      const updatedTopic: Topic = { ...mockTopic, name: 'Updated' };
      const state = topicReducer(stateWithTopics, setAddProductsSuccess(updatedTopic));
      expect(state.topics).toEqual([mockTopicList[1]]);
    });

    it('handles remove products when topic not in list', () => {
      const stateWithTopics: TopicState = {
        ...initialState,
        topics: [mockTopicList[1]],
      };
      const updatedTopic: Topic = { ...mockTopic, name: 'Updated' };
      const state = topicReducer(stateWithTopics, setRemoveProductsSuccess(updatedTopic));
      expect(state.topics).toEqual([mockTopicList[1]]);
    });
  });
});
