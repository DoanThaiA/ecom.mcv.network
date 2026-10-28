import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { showError } from 'src/utils/toast';
import { jobRepository } from 'src/repositories';
import type { ListJobsResponse } from 'src/repositories/job.repository';
import {
  listJobsRequest,
  setJobsLoading,
  setJobsData,
  type ListJobsPayload,
} from '../store/jobSlice';

// ----------------------------------------------------------------------
// List Jobs Saga
// ----------------------------------------------------------------------

function* listJobsSaga(action: PayloadAction<ListJobsPayload>) {
  const { page = 1, limit = 5 } = action.payload || {};

  try {
    yield put(setJobsLoading(true));
    const response: ListJobsResponse = yield call(jobRepository.listJobs, {
      page,
      limit,
    });
    yield put(
      setJobsData({
        jobs: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
      })
    );
  } catch (error) {
    showError(error);
  } finally {
    yield put(setJobsLoading(false));
  }
}

// ----------------------------------------------------------------------
// Watcher
// ----------------------------------------------------------------------

export function* jobSaga() {
  yield takeLatest(listJobsRequest.type, listJobsSaga);
}
