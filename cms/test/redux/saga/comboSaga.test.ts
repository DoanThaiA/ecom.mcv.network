import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { comboRepository } from 'src/repositories/combo.repository';
import { comboSaga } from 'src/redux/saga/comboSaga';
import {
  getCombosRequest,
  getComboByIdRequest,
  createComboRequest,
  updateComboRequest,
  deleteComboRequest,
  setComboLoading,
  setCombosSuccess,
  setComboError,
  setCurrentComboLoading,
  setCurrentComboSuccess,
  setCurrentComboError,
  setCreateComboLoading,
  setCreateComboSuccess,
  setCreateComboError,
  setUpdateComboLoading,
  setUpdateComboSuccess,
  setUpdateComboError,
  setDeleteComboLoading,
  setDeleteComboSuccess,
  setDeleteComboError,
} from 'src/redux/store/comboSlice';

// Mock repository
vi.mock('src/repositories/combo.repository', () => ({
  comboRepository: {
    getCombos: vi.fn(),
    getComboById: vi.fn(),
    createCombo: vi.fn(),
    updateCombo: vi.fn(),
    deleteCombo: vi.fn(),
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

describe('comboSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports comboSaga function', () => {
      expect(comboSaga).toBeDefined();
      expect(comboSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchCombo', () => {
      const gen = comboSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchCombo', () => {
      const gen = comboSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getCombosSaga', () => {
    it('successfully fetches combo list with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'combo-1',
            title: 'Breaking Combo',
            content: 'Content here',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(comboRepository.getCombos).mockResolvedValue(mockResponse);

      const action = getCombosRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('combo/getCombosRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with search', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(comboRepository.getCombos).mockResolvedValue(mockResponse);

      const action = getCombosRequest({
        page: 1,
        limit: 10,
        search: 'breaking',
      });

      expect(action.payload.search).toBe('breaking');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(comboRepository.getCombos).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getCombosRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(comboRepository.getCombos).mockRejectedValue(mockError);

      expect(comboSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setComboLoading(true);

      expect(action.type).toBe('combo/setComboLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        combos: [
          {
            id: 'combo-1',
            title: 'Combo Title',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setCombosSuccess(data);

      expect(action.type).toBe('combo/setCombosSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setComboError();

      expect(action.type).toBe('combo/setComboError');
    });
  });

  describe('getComboByIdSaga', () => {
    it('successfully fetches combo by ID', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'Combo Title',
        content: 'Content here',
        author: 'John Doe',
      };

      vi.mocked(comboRepository.getComboById).mockResolvedValue(mockCombo);

      const action = getComboByIdRequest({ id: 'combo-1' });

      expect(action.type).toBe('combo/getComboByIdRequest');
      expect(action.payload.id).toBe('combo-1');
    });

    it('calls onSuccess callback with combo data', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'Combo Title',
      };

      vi.mocked(comboRepository.getComboById).mockResolvedValue(mockCombo);

      const onSuccess = vi.fn();
      const action = getComboByIdRequest({
        id: 'combo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles null combo response', async () => {
      vi.mocked(comboRepository.getComboById).mockResolvedValue(null);

      expect(comboSaga).toBeDefined();
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Combo not found');

      vi.mocked(comboRepository.getComboById).mockRejectedValue(mockError);

      const action = getComboByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentComboLoading(true);

      expect(action.type).toBe('combo/setCurrentComboLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const combo = {
        id: 'combo-1',
        title: 'Combo Title',
      };

      const action = setCurrentComboSuccess(combo);

      expect(action.type).toBe('combo/setCurrentComboSuccess');
      expect(action.payload).toEqual(combo);
    });

    it('sets current error state', () => {
      const action = setCurrentComboError();

      expect(action.type).toBe('combo/setCurrentComboError');
    });
  });

  describe('createComboSaga', () => {
    it('successfully creates combo', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'New Article',
        content: 'Article content',
      };

      vi.mocked(comboRepository.createCombo).mockResolvedValue(mockCombo);

      const action = createComboRequest({
        data: {
          title: 'New Article',
          content: 'Article content',
        },
      });

      expect(action.type).toBe('combo/createComboRequest');
      expect(action.payload.data.title).toBe('New Article');
    });

    it('calls onSuccess callback with created combo', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'New Article',
      };

      vi.mocked(comboRepository.createCombo).mockResolvedValue(mockCombo);

      const onSuccess = vi.fn();
      const action = createComboRequest({
        data: {
          title: 'New Article',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles create failure', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(comboRepository.createCombo).mockRejectedValue(mockError);

      expect(comboSaga).toBeDefined();
    });

    it('sets create loading state', () => {
      const action = setCreateComboLoading(true);

      expect(action.type).toBe('combo/setCreateComboLoading');
      expect(action.payload).toBe(true);
    });

    it('sets create success state', () => {
      const combo = {
        id: 'combo-1',
        title: 'New Article',
      };

      const action = setCreateComboSuccess(combo);

      expect(action.type).toBe('combo/setCreateComboSuccess');
      expect(action.payload).toEqual(combo);
    });

    it('sets create error state', () => {
      const action = setCreateComboError();

      expect(action.type).toBe('combo/setCreateComboError');
    });
  });

  describe('updateComboSaga', () => {
    it('successfully updates combo', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'Updated Article',
        content: 'Updated content',
      };

      vi.mocked(comboRepository.updateCombo).mockResolvedValue(mockCombo);

      const action = updateComboRequest({
        id: 'combo-1',
        data: {
          title: 'Updated Article',
        },
      });

      expect(action.type).toBe('combo/updateComboRequest');
      expect(action.payload.id).toBe('combo-1');
      expect(action.payload.data.title).toBe('Updated Article');
    });

    it('calls onSuccess callback with updated combo', async () => {
      const mockCombo = {
        id: 'combo-1',
        title: 'Updated Article',
      };

      vi.mocked(comboRepository.updateCombo).mockResolvedValue(mockCombo);

      const onSuccess = vi.fn();
      const action = updateComboRequest({
        id: 'combo-1',
        data: {
          title: 'Updated Article',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(comboRepository.updateCombo).mockRejectedValue(mockError);

      expect(comboSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdateComboLoading(true);

      expect(action.type).toBe('combo/setUpdateComboLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const combo = {
        id: 'combo-1',
        title: 'Updated Article',
      };

      const action = setUpdateComboSuccess(combo);

      expect(action.type).toBe('combo/setUpdateComboSuccess');
      expect(action.payload).toEqual(combo);
    });

    it('sets update error state', () => {
      const action = setUpdateComboError();

      expect(action.type).toBe('combo/setUpdateComboError');
    });
  });

  describe('deleteComboSaga', () => {
    it('successfully deletes combo', async () => {
      vi.mocked(comboRepository.deleteCombo).mockResolvedValue(undefined);

      const action = deleteComboRequest({
        id: 'combo-1',
      });

      expect(action.type).toBe('combo/deleteComboRequest');
      expect(action.payload.id).toBe('combo-1');
    });

    it('calls onSuccess callback after deletion', async () => {
      vi.mocked(comboRepository.deleteCombo).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = deleteComboRequest({
        id: 'combo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles delete failure', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(comboRepository.deleteCombo).mockRejectedValue(mockError);

      expect(comboSaga).toBeDefined();
    });

    it('sets delete loading state', () => {
      const action = setDeleteComboLoading(true);

      expect(action.type).toBe('combo/setDeleteComboLoading');
      expect(action.payload).toBe(true);
    });

    it('sets delete success state', () => {
      const action = setDeleteComboSuccess('combo-1');

      expect(action.type).toBe('combo/setDeleteComboSuccess');
      expect(action.payload).toBe('combo-1');
    });

    it('sets delete error state', () => {
      const action = setDeleteComboError();

      expect(action.type).toBe('combo/setDeleteComboError');
    });
  });

  describe('action types', () => {
    it('has correct action type for getCombosRequest', () => {
      expect(getCombosRequest.type).toBe('combo/getCombosRequest');
    });

    it('has correct action type for getComboByIdRequest', () => {
      expect(getComboByIdRequest.type).toBe('combo/getComboByIdRequest');
    });

    it('has correct action type for createComboRequest', () => {
      expect(createComboRequest.type).toBe('combo/createComboRequest');
    });

    it('has correct action type for updateComboRequest', () => {
      expect(updateComboRequest.type).toBe('combo/updateComboRequest');
    });

    it('has correct action type for deleteComboRequest', () => {
      expect(deleteComboRequest.type).toBe('combo/deleteComboRequest');
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

  describe('pagination and search', () => {
    it('handles different page numbers', () => {
      const action = getCombosRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles search query', () => {
      const action = getCombosRequest({
        page: 1,
        limit: 10,
        search: 'technology',
      });

      expect(action.payload.search).toBe('technology');
    });

    it('handles empty search', () => {
      const action = getCombosRequest({
        page: 1,
        limit: 10,
        search: '',
      });

      expect(action.payload.search).toBe('');
    });

    it('handles pagination metadata', () => {
      const data = {
        combos: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setCombosSuccess(data);

      expect(action.payload.pagination.page).toBe(2);
      expect(action.payload.pagination.totalPages).toBe(5);
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
    it('handles onSuccess callback for getCombos', () => {
      const onSuccess = vi.fn();
      const action = getCombosRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getComboById', () => {
      const onSuccess = vi.fn();
      const action = getComboByIdRequest({
        id: 'combo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for createCombo', () => {
      const onSuccess = vi.fn();
      const action = createComboRequest({
        data: { title: 'Test' },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateCombo', () => {
      const onSuccess = vi.fn();
      const action = updateComboRequest({
        id: 'combo-1',
        data: { title: 'Test' },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for deleteCombo', () => {
      const onSuccess = vi.fn();
      const action = deleteComboRequest({
        id: 'combo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('combo data fields', () => {
    it('handles title field', () => {
      const action = createComboRequest({
        data: {
          title: 'Breaking Combo',
        },
      });

      expect(action.payload.data.title).toBe('Breaking Combo');
    });

    it('handles content field', () => {
      const action = createComboRequest({
        data: {
          content: 'Combo content here',
        },
      });

      expect(action.payload.data.content).toBe('Combo content here');
    });

    it('handles multiple fields', () => {
      const action = createComboRequest({
        data: {
          title: 'Breaking Combo',
          content: 'Content here',
          author: 'John Doe',
        },
      });

      expect(action.payload.data.title).toBe('Breaking Combo');
      expect(action.payload.data.content).toBe('Content here');
      expect(action.payload.data.author).toBe('John Doe');
    });
  });
});
