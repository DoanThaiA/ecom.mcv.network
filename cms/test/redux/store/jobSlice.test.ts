import { describe, it, expect } from 'vitest';

import {
  jobSlice,
  setJobsLoading,
  setJobsData,
  clearJobs,
  listJobsRequest,
  selectJobs,
  selectJobsLoading,
  selectJobsHasNextPage,
  selectJobsTotal,
} from 'src/redux/store/jobSlice';
import type { JobResponse } from 'src/types/gen/cms/cms/jobs/job';

const jobReducer = jobSlice.reducer;

describe('jobSlice', () => {
  const initialState = {
    jobs: [],
    loading: false,
    hasNextPage: false,
    total: 0,
  };

  const mockJob: JobResponse = {
    id: 'job-1',
    title: 'Software Engineer',
    description: 'Full-stack developer position',
    location: 'Remote',
    type: 'Full-time',
    status: 'Open',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockJobs: JobResponse[] = [
    mockJob,
    {
      id: 'job-2',
      title: 'Product Manager',
      description: 'Lead product development',
      location: 'New York',
      type: 'Full-time',
      status: 'Open',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'job-3',
      title: 'UX Designer',
      description: 'Design user experiences',
      location: 'San Francisco',
      type: 'Contract',
      status: 'Closed',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('setJobsLoading', () => {
      it('sets loading to true', () => {
        const state = jobReducer(initialState, setJobsLoading(true));

        expect(state.loading).toBe(true);
        expect(state.jobs).toEqual([]);
      });

      it('sets loading to false', () => {
        const loadingState = {
          ...initialState,
          loading: true,
        };

        const state = jobReducer(loadingState, setJobsLoading(false));

        expect(state.loading).toBe(false);
      });

      it('does not affect other state properties', () => {
        const stateWithData = {
          jobs: mockJobs,
          loading: false,
          hasNextPage: true,
          total: 10,
        };

        const state = jobReducer(stateWithData, setJobsLoading(true));

        expect(state.loading).toBe(true);
        expect(state.jobs).toEqual(mockJobs);
        expect(state.hasNextPage).toBe(true);
        expect(state.total).toBe(10);
      });
    });

    describe('setJobsData', () => {
      it('sets jobs data with pagination info', () => {
        const payload = {
          jobs: mockJobs,
          hasNextPage: true,
          total: 10,
        };

        const state = jobReducer(initialState, setJobsData(payload));

        expect(state.jobs).toEqual(mockJobs);
        expect(state.hasNextPage).toBe(true);
        expect(state.total).toBe(10);
      });

      it('sets jobs data without next page', () => {
        const payload = {
          jobs: mockJobs,
          hasNextPage: false,
          total: 3,
        };

        const state = jobReducer(initialState, setJobsData(payload));

        expect(state.jobs).toEqual(mockJobs);
        expect(state.hasNextPage).toBe(false);
        expect(state.total).toBe(3);
      });

      it('handles empty jobs array', () => {
        const payload = {
          jobs: [],
          hasNextPage: false,
          total: 0,
        };

        const state = jobReducer(initialState, setJobsData(payload));

        expect(state.jobs).toEqual([]);
        expect(state.hasNextPage).toBe(false);
        expect(state.total).toBe(0);
      });

      it('replaces existing jobs data', () => {
        const stateWithData = {
          jobs: mockJobs,
          loading: false,
          hasNextPage: true,
          total: 10,
        };

        const newJobs: JobResponse[] = [
          {
            id: 'job-4',
            title: 'New Job',
            description: 'New position',
            location: 'Remote',
            type: 'Part-time',
            status: 'Open',
            createdAt: '2024-01-04T00:00:00Z',
          },
        ];

        const payload = {
          jobs: newJobs,
          hasNextPage: false,
          total: 1,
        };

        const state = jobReducer(stateWithData, setJobsData(payload));

        expect(state.jobs).toEqual(newJobs);
        expect(state.jobs).not.toEqual(mockJobs);
        expect(state.hasNextPage).toBe(false);
        expect(state.total).toBe(1);
      });

      it('handles large datasets', () => {
        const largeJobsList = Array.from({ length: 100 }, (_, i) => ({
          id: `job-${i}`,
          title: `Job ${i}`,
          description: `Description ${i}`,
          location: 'Remote',
          type: 'Full-time',
          status: 'Open',
          createdAt: '2024-01-01T00:00:00Z',
        }));

        const payload = {
          jobs: largeJobsList,
          hasNextPage: true,
          total: 1000,
        };

        const state = jobReducer(initialState, setJobsData(payload));

        expect(state.jobs).toHaveLength(100);
        expect(state.hasNextPage).toBe(true);
        expect(state.total).toBe(1000);
      });
    });

    describe('clearJobs', () => {
      it('clears all jobs data', () => {
        const stateWithData = {
          jobs: mockJobs,
          loading: false,
          hasNextPage: true,
          total: 10,
        };

        const state = jobReducer(stateWithData, clearJobs());

        expect(state.jobs).toEqual([]);
        expect(state.hasNextPage).toBe(false);
        expect(state.total).toBe(0);
      });

      it('does not affect loading state', () => {
        const stateWithData = {
          jobs: mockJobs,
          loading: true,
          hasNextPage: true,
          total: 10,
        };

        const state = jobReducer(stateWithData, clearJobs());

        expect(state.jobs).toEqual([]);
        expect(state.loading).toBe(true);
      });

      it('works on already empty state', () => {
        const state = jobReducer(initialState, clearJobs());

        expect(state.jobs).toEqual([]);
        expect(state.hasNextPage).toBe(false);
        expect(state.total).toBe(0);
      });
    });
  });

  describe('saga actions', () => {
    describe('listJobsRequest', () => {
      it('creates correct action type', () => {
        const action = listJobsRequest({
          page: 1,
          limit: 10,
        });

        expect(action.type).toBe('job/listJobsRequest');
      });

      it('includes pagination in payload', () => {
        const payload = {
          page: 2,
          limit: 20,
        };

        const action = listJobsRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes filters in payload', () => {
        const payload = {
          page: 1,
          limit: 10,
          filters: {
            status: 'Open',
            type: 'Full-time',
          },
        };

        const action = listJobsRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes sort in payload', () => {
        const payload = {
          page: 1,
          limit: 10,
          sort: {
            createdAt: -1,
          },
        };

        const action = listJobsRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes all parameters', () => {
        const payload = {
          page: 3,
          limit: 25,
          filters: {
            status: 'Closed',
            location: 'Remote',
          },
          sort: {
            title: 1,
          },
        };

        const action = listJobsRequest(payload);

        expect(action.payload).toEqual(payload);
      });
    });
  });

  describe('selectors', () => {
    describe('selectJobs', () => {
      it('returns empty array for initial state', () => {
        const state = { job: initialState };

        const jobs = selectJobs(state);

        expect(jobs).toEqual([]);
      });

      it('returns jobs when present', () => {
        const state = {
          job: {
            jobs: mockJobs,
            loading: false,
            hasNextPage: false,
            total: 3,
          },
        };

        const jobs = selectJobs(state);

        expect(jobs).toEqual(mockJobs);
        expect(jobs).toHaveLength(3);
      });
    });

    describe('selectJobsLoading', () => {
      it('returns false for initial state', () => {
        const state = { job: initialState };

        const loading = selectJobsLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          job: {
            ...initialState,
            loading: true,
          },
        };

        const loading = selectJobsLoading(state);

        expect(loading).toBe(true);
      });

      it('returns false when not loading', () => {
        const state = {
          job: {
            jobs: mockJobs,
            loading: false,
            hasNextPage: false,
            total: 3,
          },
        };

        const loading = selectJobsLoading(state);

        expect(loading).toBe(false);
      });
    });

    describe('selectJobsHasNextPage', () => {
      it('returns false for initial state', () => {
        const state = { job: initialState };

        const hasNextPage = selectJobsHasNextPage(state);

        expect(hasNextPage).toBe(false);
      });

      it('returns true when has next page', () => {
        const state = {
          job: {
            jobs: mockJobs,
            loading: false,
            hasNextPage: true,
            total: 10,
          },
        };

        const hasNextPage = selectJobsHasNextPage(state);

        expect(hasNextPage).toBe(true);
      });

      it('returns false when no next page', () => {
        const state = {
          job: {
            jobs: mockJobs,
            loading: false,
            hasNextPage: false,
            total: 3,
          },
        };

        const hasNextPage = selectJobsHasNextPage(state);

        expect(hasNextPage).toBe(false);
      });
    });

    describe('selectJobsTotal', () => {
      it('returns 0 for initial state', () => {
        const state = { job: initialState };

        const total = selectJobsTotal(state);

        expect(total).toBe(0);
      });

      it('returns correct total', () => {
        const state = {
          job: {
            jobs: mockJobs,
            loading: false,
            hasNextPage: true,
            total: 100,
          },
        };

        const total = selectJobsTotal(state);

        expect(total).toBe(100);
      });

      it('returns total even when jobs array is empty', () => {
        const state = {
          job: {
            jobs: [],
            loading: false,
            hasNextPage: true,
            total: 50,
          },
        };

        const total = selectJobsTotal(state);

        expect(total).toBe(50);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete job listing flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectJobs({ job: state })).toEqual([]);
      expect(selectJobsLoading({ job: state })).toBe(false);

      // Step 1: Start loading
      state = jobReducer(state, setJobsLoading(true));
      expect(selectJobsLoading({ job: state })).toBe(true);

      // Step 2: Receive jobs data
      const payload = {
        jobs: mockJobs,
        hasNextPage: true,
        total: 10,
      };
      state = jobReducer(state, setJobsData(payload));
      expect(selectJobs({ job: state })).toEqual(mockJobs);
      expect(selectJobsHasNextPage({ job: state })).toBe(true);
      expect(selectJobsTotal({ job: state })).toBe(10);

      // Step 3: Stop loading
      state = jobReducer(state, setJobsLoading(false));
      expect(selectJobsLoading({ job: state })).toBe(false);
      expect(selectJobs({ job: state })).toEqual(mockJobs);
    });

    it('handles pagination flow', () => {
      // Page 1
      let state = jobReducer(initialState, setJobsLoading(true));
      state = jobReducer(state, setJobsData({
        jobs: mockJobs.slice(0, 2),
        hasNextPage: true,
        total: 3,
      }));
      state = jobReducer(state, setJobsLoading(false));

      expect(selectJobs({ job: state })).toHaveLength(2);
      expect(selectJobsHasNextPage({ job: state })).toBe(true);

      // Page 2 (last page)
      state = jobReducer(state, setJobsLoading(true));
      state = jobReducer(state, setJobsData({
        jobs: mockJobs.slice(2, 3),
        hasNextPage: false,
        total: 3,
      }));
      state = jobReducer(state, setJobsLoading(false));

      expect(selectJobs({ job: state })).toHaveLength(1);
      expect(selectJobsHasNextPage({ job: state })).toBe(false);
    });

    it('handles refresh flow', () => {
      // Initial load
      let state = jobReducer(initialState, setJobsData({
        jobs: mockJobs,
        hasNextPage: false,
        total: 3,
      }));

      expect(selectJobs({ job: state })).toHaveLength(3);

      // Refresh - clear and reload
      state = jobReducer(state, clearJobs());
      expect(selectJobs({ job: state })).toEqual([]);

      state = jobReducer(state, setJobsLoading(true));
      state = jobReducer(state, setJobsData({
        jobs: mockJobs,
        hasNextPage: false,
        total: 3,
      }));
      state = jobReducer(state, setJobsLoading(false));

      expect(selectJobs({ job: state })).toEqual(mockJobs);
    });

    it('handles empty results', () => {
      let state = jobReducer(initialState, setJobsLoading(true));
      state = jobReducer(state, setJobsData({
        jobs: [],
        hasNextPage: false,
        total: 0,
      }));
      state = jobReducer(state, setJobsLoading(false));

      expect(selectJobs({ job: state })).toEqual([]);
      expect(selectJobsHasNextPage({ job: state })).toBe(false);
      expect(selectJobsTotal({ job: state })).toBe(0);
      expect(selectJobsLoading({ job: state })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = jobReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = jobReducer(state, setJobsLoading(true));
      expect(state.loading).toBe(true);

      state = jobReducer(state, setJobsLoading(false));
      expect(state.loading).toBe(false);

      state = jobReducer(state, setJobsLoading(true));
      expect(state.loading).toBe(true);

      state = jobReducer(state, setJobsLoading(true));
      expect(state.loading).toBe(true);
    });

    it('handles multiple consecutive data updates', () => {
      let state = initialState;

      state = jobReducer(state, setJobsData({
        jobs: mockJobs.slice(0, 1),
        hasNextPage: true,
        total: 3,
      }));
      expect(selectJobs({ job: state })).toHaveLength(1);

      state = jobReducer(state, setJobsData({
        jobs: mockJobs.slice(0, 2),
        hasNextPage: true,
        total: 3,
      }));
      expect(selectJobs({ job: state })).toHaveLength(2);

      state = jobReducer(state, setJobsData({
        jobs: mockJobs,
        hasNextPage: false,
        total: 3,
      }));
      expect(selectJobs({ job: state })).toHaveLength(3);
    });

    it('handles clear on empty state', () => {
      const state = jobReducer(initialState, clearJobs());

      expect(state).toEqual(initialState);
    });

    it('preserves jobs during loading state changes', () => {
      let state = jobReducer(initialState, setJobsData({
        jobs: mockJobs,
        hasNextPage: false,
        total: 3,
      }));

      const originalJobs = state.jobs;

      state = jobReducer(state, setJobsLoading(true));
      expect(state.jobs).toEqual(originalJobs);

      state = jobReducer(state, setJobsLoading(false));
      expect(state.jobs).toEqual(originalJobs);
    });
  });
});
