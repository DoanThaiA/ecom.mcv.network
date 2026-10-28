import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import type { ListJobs, JobResponse } from 'src/types/gen/cms/cms/jobs/job';
import type { RootState } from './store';

// ----------------------------------------------------------------------
// State Interface
// ----------------------------------------------------------------------

interface JobState {
  jobs: JobResponse[];
  loading: boolean;
  hasNextPage: boolean;
  total: number;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  hasNextPage: false,
  total: 0,
};

// ----------------------------------------------------------------------
// Payload Types
// ----------------------------------------------------------------------

export type ListJobsPayload = ListJobs;

export interface SetJobsPayload {
  jobs: JobResponse[];
  hasNextPage: boolean;
  total: number;
}

// ----------------------------------------------------------------------
// Saga Actions
// ----------------------------------------------------------------------

export const listJobsRequest = createAction<ListJobsPayload>('job/listJobsRequest');

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------

export const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setJobsData: (state, action: PayloadAction<SetJobsPayload>) => {
      state.jobs = action.payload.jobs;
      state.hasNextPage = action.payload.hasNextPage;
      state.total = action.payload.total;
    },
    clearJobs: (state) => {
      state.jobs = [];
      state.hasNextPage = false;
      state.total = 0;
    },
  },
});

// ----------------------------------------------------------------------
// Actions Export
// ----------------------------------------------------------------------

export const { setJobsLoading, setJobsData, clearJobs } = jobSlice.actions;

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

export const selectJobs = (state: RootState) => state.job.jobs;
export const selectJobsLoading = (state: RootState) => state.job.loading;
export const selectJobsHasNextPage = (state: RootState) => state.job.hasNextPage;
export const selectJobsTotal = (state: RootState) => state.job.total;
