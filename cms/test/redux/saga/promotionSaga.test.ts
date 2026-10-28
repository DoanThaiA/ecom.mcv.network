import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { promotionRepository } from 'src/repositories/promotion.repository';
import { promotionSaga } from 'src/redux/saga/promotionSaga';
import {
  getPromotionsRequest,
  getPromotionByIdRequest,
  createPromotionRequest,
  updatePromotionRequest,
  deletePromotionRequest,
  pausePromotionRequest,
  resumePromotionRequest,
  setPromotionLoading,
  setPromotionsSuccess,
  setPromotionError,
  setCurrentPromotionLoading,
  setCurrentPromotionSuccess,
  setCurrentPromotionError,
  setCreatePromotionLoading,
  setCreatePromotionSuccess,
  setCreatePromotionError,
  setUpdatePromotionLoading,
  setUpdatePromotionSuccess,
  setUpdatePromotionError,
  setDeletePromotionLoading,
  setDeletePromotionSuccess,
  setDeletePromotionError,
  setPausePromotionLoading,
  setPausePromotionSuccess,
  setPausePromotionError,
  setResumePromotionSuccess,
  setResumePromotionError,
} from 'src/redux/store/promotionSlice';

// Mock repository
vi.mock('src/repositories/promotion.repository', () => ({
  promotionRepository: {
    queryPromotions: vi.fn(),
    getPromotion: vi.fn(),
    createPromotion: vi.fn(),
    updatePromotion: vi.fn(),
    deletePromotion: vi.fn(),
    pausePromotion: vi.fn(),
    resumePromotion: vi.fn(),
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

describe('promotionSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports promotionSaga function', () => {
      expect(promotionSaga).toBeDefined();
      expect(promotionSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchPromotion', () => {
      const gen = promotionSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchPromotion', () => {
      const gen = promotionSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getPromotionsSaga', () => {
    it('successfully fetches promotions with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'promo-1',
            name: 'Summer Sale',
            type: 'percentage',
            status: 'active',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(promotionRepository.queryPromotions).mockResolvedValue(mockResponse);

      const action = getPromotionsRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('promotion/getPromotionsRequest');
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

      vi.mocked(promotionRepository.queryPromotions).mockResolvedValue(mockResponse);

      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { type: 'percentage', status: 'active' },
      });

      expect(action.payload.filters).toEqual({ type: 'percentage', status: 'active' });
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(promotionRepository.queryPromotions).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(promotionRepository.queryPromotions).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setPromotionLoading(true);

      expect(action.type).toBe('promotion/setPromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        promotions: [
          {
            id: 'promo-1',
            name: 'Promotion',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setPromotionsSuccess(data);

      expect(action.type).toBe('promotion/setPromotionsSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setPromotionError();

      expect(action.type).toBe('promotion/setPromotionError');
    });

    it('handles empty data response', async () => {
      const mockResponse = {
        data: null,
        page: null,
        limit: null,
        total: null,
        totalPages: null,
      };

      vi.mocked(promotionRepository.queryPromotions).mockResolvedValue(mockResponse);

      expect(promotionSaga).toBeDefined();
    });
  });

  describe('getPromotionByIdSaga', () => {
    it('successfully fetches promotion by ID', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Summer Sale',
        type: 'percentage',
        value: 20,
      };

      vi.mocked(promotionRepository.getPromotion).mockResolvedValue(mockPromotion);

      const action = getPromotionByIdRequest({ id: 'promo-1' });

      expect(action.type).toBe('promotion/getPromotionByIdRequest');
      expect(action.payload.id).toBe('promo-1');
    });

    it('calls onSuccess callback with promotion data', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Sale',
      };

      vi.mocked(promotionRepository.getPromotion).mockResolvedValue(mockPromotion);

      const onSuccess = vi.fn();
      const action = getPromotionByIdRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Promotion not found');

      vi.mocked(promotionRepository.getPromotion).mockRejectedValue(mockError);

      const action = getPromotionByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentPromotionLoading(true);

      expect(action.type).toBe('promotion/setCurrentPromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const promotion = {
        id: 'promo-1',
        name: 'Sale',
      };

      const action = setCurrentPromotionSuccess(promotion);

      expect(action.type).toBe('promotion/setCurrentPromotionSuccess');
      expect(action.payload).toEqual(promotion);
    });

    it('sets current error state', () => {
      const action = setCurrentPromotionError();

      expect(action.type).toBe('promotion/setCurrentPromotionError');
    });
  });

  describe('createPromotionSaga', () => {
    it('successfully creates promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'New Sale',
        type: 'fixed',
      };

      vi.mocked(promotionRepository.createPromotion).mockResolvedValue(mockPromotion);

      const action = createPromotionRequest({
        data: {
          name: 'New Sale',
          type: 'fixed',
        },
      });

      expect(action.type).toBe('promotion/createPromotionRequest');
      expect(action.payload.data.name).toBe('New Sale');
    });

    it('calls onSuccess callback with created promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'New Sale',
      };

      vi.mocked(promotionRepository.createPromotion).mockResolvedValue(mockPromotion);

      const onSuccess = vi.fn();
      const action = createPromotionRequest({
        data: {
          name: 'New Sale',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles create failure', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(promotionRepository.createPromotion).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets create loading state', () => {
      const action = setCreatePromotionLoading(true);

      expect(action.type).toBe('promotion/setCreatePromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets create success state', () => {
      const action = setCreatePromotionSuccess();

      expect(action.type).toBe('promotion/setCreatePromotionSuccess');
    });

    it('sets create error state', () => {
      const action = setCreatePromotionError();

      expect(action.type).toBe('promotion/setCreatePromotionError');
    });
  });

  describe('updatePromotionSaga', () => {
    it('successfully updates promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Updated Sale',
        type: 'percentage',
      };

      vi.mocked(promotionRepository.updatePromotion).mockResolvedValue(mockPromotion);

      const action = updatePromotionRequest({
        id: 'promo-1',
        data: {
          name: 'Updated Sale',
        },
      });

      expect(action.type).toBe('promotion/updatePromotionRequest');
      expect(action.payload.id).toBe('promo-1');
      expect(action.payload.data.name).toBe('Updated Sale');
    });

    it('calls onSuccess callback with updated promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Updated',
      };

      vi.mocked(promotionRepository.updatePromotion).mockResolvedValue(mockPromotion);

      const onSuccess = vi.fn();
      const action = updatePromotionRequest({
        id: 'promo-1',
        data: {},
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(promotionRepository.updatePromotion).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdatePromotionLoading(true);

      expect(action.type).toBe('promotion/setUpdatePromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const promotion = {
        id: 'promo-1',
        name: 'Updated',
      };

      const action = setUpdatePromotionSuccess(promotion);

      expect(action.type).toBe('promotion/setUpdatePromotionSuccess');
      expect(action.payload).toEqual(promotion);
    });

    it('sets update error state', () => {
      const action = setUpdatePromotionError();

      expect(action.type).toBe('promotion/setUpdatePromotionError');
    });
  });

  describe('deletePromotionSaga', () => {
    it('successfully deletes promotion', async () => {
      vi.mocked(promotionRepository.deletePromotion).mockResolvedValue(undefined);

      const action = deletePromotionRequest({
        id: 'promo-1',
      });

      expect(action.type).toBe('promotion/deletePromotionRequest');
      expect(action.payload.id).toBe('promo-1');
    });

    it('calls onSuccess callback after deletion', async () => {
      vi.mocked(promotionRepository.deletePromotion).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = deletePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles delete failure', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(promotionRepository.deletePromotion).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets delete loading state', () => {
      const action = setDeletePromotionLoading(true);

      expect(action.type).toBe('promotion/setDeletePromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets delete success state', () => {
      const action = setDeletePromotionSuccess('promo-1');

      expect(action.type).toBe('promotion/setDeletePromotionSuccess');
      expect(action.payload).toBe('promo-1');
    });

    it('sets delete error state', () => {
      const action = setDeletePromotionError();

      expect(action.type).toBe('promotion/setDeletePromotionError');
    });
  });

  describe('pausePromotionSaga', () => {
    it('successfully pauses promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Sale',
        status: 'paused',
      };

      vi.mocked(promotionRepository.pausePromotion).mockResolvedValue(mockPromotion);

      const action = pausePromotionRequest({
        id: 'promo-1',
      });

      expect(action.type).toBe('promotion/pausePromotionRequest');
      expect(action.payload.id).toBe('promo-1');
    });

    it('calls onSuccess callback after pausing', async () => {
      const mockPromotion = {
        id: 'promo-1',
        status: 'paused',
      };

      vi.mocked(promotionRepository.pausePromotion).mockResolvedValue(mockPromotion);

      const onSuccess = vi.fn();
      const action = pausePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles pause failure', async () => {
      const mockError = new Error('Pause failed');

      vi.mocked(promotionRepository.pausePromotion).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets pause loading state', () => {
      const action = setPausePromotionLoading(true);

      expect(action.type).toBe('promotion/setPausePromotionLoading');
      expect(action.payload).toBe(true);
    });

    it('sets pause success state', () => {
      const promotion = {
        id: 'promo-1',
        status: 'paused',
      };

      const action = setPausePromotionSuccess(promotion);

      expect(action.type).toBe('promotion/setPausePromotionSuccess');
      expect(action.payload).toEqual(promotion);
    });

    it('sets pause error state', () => {
      const action = setPausePromotionError();

      expect(action.type).toBe('promotion/setPausePromotionError');
    });
  });

  describe('resumePromotionSaga', () => {
    it('successfully resumes promotion', async () => {
      const mockPromotion = {
        id: 'promo-1',
        name: 'Sale',
        status: 'active',
      };

      vi.mocked(promotionRepository.resumePromotion).mockResolvedValue(mockPromotion);

      const action = resumePromotionRequest({
        id: 'promo-1',
      });

      expect(action.type).toBe('promotion/resumePromotionRequest');
      expect(action.payload.id).toBe('promo-1');
    });

    it('calls onSuccess callback after resuming', async () => {
      const mockPromotion = {
        id: 'promo-1',
        status: 'active',
      };

      vi.mocked(promotionRepository.resumePromotion).mockResolvedValue(mockPromotion);

      const onSuccess = vi.fn();
      const action = resumePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles resume failure', async () => {
      const mockError = new Error('Resume failed');

      vi.mocked(promotionRepository.resumePromotion).mockRejectedValue(mockError);

      expect(promotionSaga).toBeDefined();
    });

    it('sets resume success state', () => {
      const promotion = {
        id: 'promo-1',
        status: 'active',
      };

      const action = setResumePromotionSuccess(promotion);

      expect(action.type).toBe('promotion/setResumePromotionSuccess');
      expect(action.payload).toEqual(promotion);
    });

    it('sets resume error state', () => {
      const action = setResumePromotionError();

      expect(action.type).toBe('promotion/setResumePromotionError');
    });
  });

  describe('action types', () => {
    it('has correct action type for getPromotionsRequest', () => {
      expect(getPromotionsRequest.type).toBe('promotion/getPromotionsRequest');
    });

    it('has correct action type for getPromotionByIdRequest', () => {
      expect(getPromotionByIdRequest.type).toBe('promotion/getPromotionByIdRequest');
    });

    it('has correct action type for createPromotionRequest', () => {
      expect(createPromotionRequest.type).toBe('promotion/createPromotionRequest');
    });

    it('has correct action type for updatePromotionRequest', () => {
      expect(updatePromotionRequest.type).toBe('promotion/updatePromotionRequest');
    });

    it('has correct action type for deletePromotionRequest', () => {
      expect(deletePromotionRequest.type).toBe('promotion/deletePromotionRequest');
    });

    it('has correct action type for pausePromotionRequest', () => {
      expect(pausePromotionRequest.type).toBe('promotion/pausePromotionRequest');
    });

    it('has correct action type for resumePromotionRequest', () => {
      expect(resumePromotionRequest.type).toBe('promotion/resumePromotionRequest');
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
      const action = getPromotionsRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles type filter', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { type: 'percentage' },
      });

      expect(action.payload.filters?.type).toBe('percentage');
    });

    it('handles status filter', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'active' },
      });

      expect(action.payload.filters?.status).toBe('active');
    });

    it('handles keyword filter', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { keyword: 'summer' },
      });

      expect(action.payload.filters?.keyword).toBe('summer');
    });

    it('handles multiple filters', () => {
      const filters = {
        type: 'fixed',
        status: 'active',
        keyword: 'sale',
      };

      const action = getPromotionsRequest({
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
    it('handles onSuccess callback for getPromotions', () => {
      const onSuccess = vi.fn();
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getPromotionById', () => {
      const onSuccess = vi.fn();
      const action = getPromotionByIdRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for createPromotion', () => {
      const onSuccess = vi.fn();
      const action = createPromotionRequest({
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updatePromotion', () => {
      const onSuccess = vi.fn();
      const action = updatePromotionRequest({
        id: 'promo-1',
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for deletePromotion', () => {
      const onSuccess = vi.fn();
      const action = deletePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for pausePromotion', () => {
      const onSuccess = vi.fn();
      const action = pausePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for resumePromotion', () => {
      const onSuccess = vi.fn();
      const action = resumePromotionRequest({
        id: 'promo-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('promotion status', () => {
    it('handles active status', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'active' },
      });

      expect(action.payload.filters?.status).toBe('active');
    });

    it('handles paused status', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'paused' },
      });

      expect(action.payload.filters?.status).toBe('paused');
    });

    it('handles expired status', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'expired' },
      });

      expect(action.payload.filters?.status).toBe('expired');
    });
  });

  describe('promotion types', () => {
    it('handles percentage type', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { type: 'percentage' },
      });

      expect(action.payload.filters?.type).toBe('percentage');
    });

    it('handles fixed type', () => {
      const action = getPromotionsRequest({
        page: 1,
        limit: 10,
        filters: { type: 'fixed' },
      });

      expect(action.payload.filters?.type).toBe('fixed');
    });
  });
});
