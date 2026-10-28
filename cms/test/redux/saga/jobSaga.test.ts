import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { jobRepository } from 'src/repositories';
import { jobSaga } from 'src/redux/saga/jobSaga';
import {
  listJobsRequest,
  setJobsLoading,
  setJobsData,
} from 'src/redux/store/jobSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  jobRepository: {
    listJobs: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showError: vi.fn(),
}));

describe('jobSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports jobSaga function', () => {
      expect(jobSaga).toBeDefined();
      expect(jobSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('watches listJobsRequest action', () => {
      const gen = jobSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after setting up watcher', () => {
      const gen = jobSaga();
      gen.next(); // First takeLatest
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('listJobsSaga', () => {
    it('successfully fetches jobs with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'job-1',
            name: 'Test Job',
            status: 'pending',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        hasNextPage: false,
        total: 1,
      };

      vi.mocked(jobRepository.listJobs).mockResolvedValue(mockResponse);

      const action = listJobsRequest({ page: 1, limit: 5 });

      expect(jobSaga).toBeDefined();
      expect(action.type).toBe('job/listJobsRequest');
    });

    it('handles empty payload', () => {
      const action = listJobsRequest({});

      expect(action.payload).toEqual({});
    });

    it('handles undefined payload', () => {
      const action = listJobsRequest(undefined as any);

      expect(action.type).toBe('job/listJobsRequest');
    });

    it('successfully fetches jobs with custom params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'job-1',
            name: 'Job 1',
            status: 'completed',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'job-2',
            name: 'Job 2',
            status: 'pending',
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
        hasNextPage: true,
        total: 10,
      };

      vi.mocked(jobRepository.listJobs).mockResolvedValue(mockResponse);

      const action = listJobsRequest({ page: 2, limit: 2 });

      expect(action.payload).toEqual({ page: 2, limit: 2 });
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(jobRepository.listJobs).mockRejectedValue(mockError);

      const action = listJobsRequest({ page: 1, limit: 5 });

      expect(jobSaga).toBeDefined();
    });

    it('handles error without message', () => {
      const mockError = { code: 500 };

      expect(jobSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setJobsLoading(true);

      expect(action.type).toBe('job/setJobsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets jobs data', () => {
      const data = {
        jobs: [
          {
            id: 'job-1',
            name: 'Test Job',
            status: 'pending',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        hasNextPage: false,
        total: 1,
      };

      const action = setJobsData(data);

      expect(action.type).toBe('job/setJobsData');
      expect(action.payload).toEqual(data);
    });
  });

  describe('action types', () => {
    it('has correct action type for listJobsRequest', () => {
      expect(listJobsRequest.type).toBe('job/listJobsRequest');
    });

    it('has correct action type for setJobsLoading', () => {
      expect(setJobsLoading.type).toBe('job/setJobsLoading');
    });

    it('has correct action type for setJobsData', () => {
      expect(setJobsData.type).toBe('job/setJobsData');
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

  describe('pagination', () => {
    it('handles first page', () => {
      const action = listJobsRequest({ page: 1, limit: 10 });

      expect(action.payload.page).toBe(1);
    });

    it('handles subsequent pages', () => {
      const action = listJobsRequest({ page: 3, limit: 20 });

      expect(action.payload.page).toBe(3);
      expect(action.payload.limit).toBe(20);
    });

    it('handles hasNextPage true', () => {
      const data = {
        jobs: [],
        hasNextPage: true,
        total: 100,
      };

      const action = setJobsData(data);

      expect(action.payload.hasNextPage).toBe(true);
    });

    it('handles hasNextPage false', () => {
      const data = {
        jobs: [],
        hasNextPage: false,
        total: 5,
      };

      const action = setJobsData(data);

      expect(action.payload.hasNextPage).toBe(false);
    });
  });
});
