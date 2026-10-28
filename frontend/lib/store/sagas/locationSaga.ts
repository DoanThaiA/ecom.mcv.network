/* eslint-disable no-console */
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/lib/config/api';
import {
  fetchCitiesRequest,
  fetchCitiesSuccess,
  fetchCitiesFailure,
  fetchDistrictsRequest,
  fetchDistrictsSuccess,
  fetchDistrictsFailure,
  fetchWardsRequest,
  fetchWardsSuccess,
  fetchWardsFailure,
  LocationOption,
} from '../slices/locationSlice';

// API fetch functions
async function fetchCitiesFromAPI(): Promise<LocationOption[]> {
  const response = await fetch(`${API_BASE_URL}/v1/shop/shipping/locations/cities`);
  if (!response.ok) {
    throw new Error('Failed to fetch cities');
  }
  const data = await response.json();
  return data.data || data || [];
}

async function fetchDistrictsFromAPI(cityId: number): Promise<LocationOption[]> {
  const response = await fetch(
    `${API_BASE_URL}/v1/shop/shipping/locations/districts?cityId=${cityId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch districts');
  }
  const data = await response.json();
  return data.data || data || [];
}

async function fetchWardsFromAPI(districtId: number): Promise<LocationOption[]> {
  const response = await fetch(
    `${API_BASE_URL}/v1/shop/shipping/locations/wards?districtId=${districtId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch wards');
  }
  const data = await response.json();
  return data.data || data || [];
}

// Saga: Fetch cities
function* fetchCitiesSaga() {
  try {
    const cities: LocationOption[] = yield call(fetchCitiesFromAPI);
    yield put(fetchCitiesSuccess(cities));
  } catch (error) {
    console.error('Fetch cities error:', error);
    yield put(fetchCitiesFailure('Failed to load cities'));
  }
}

// Saga: Fetch districts
function* fetchDistrictsSaga(action: PayloadAction<string>) {
  try {
    const cityIdStr = action.payload;
    if (!cityIdStr) {
      yield put(fetchDistrictsSuccess([]));
      return;
    }
    const cityId = parseInt(cityIdStr);
    if (isNaN(cityId)) {
      yield put(fetchDistrictsFailure('Invalid city ID'));
      return;
    }
    const districts: LocationOption[] = yield call(fetchDistrictsFromAPI, cityId);
    yield put(fetchDistrictsSuccess(districts));
  } catch (error) {
    console.error('Fetch districts error:', error);
    yield put(fetchDistrictsFailure('Failed to load districts'));
  }
}

// Saga: Fetch wards
function* fetchWardsSaga(action: PayloadAction<string>) {
  try {
    const districtIdStr = action.payload;
    if (!districtIdStr) {
      yield put(fetchWardsSuccess([]));
      return;
    }
    const districtId = parseInt(districtIdStr);
    if (isNaN(districtId)) {
      yield put(fetchWardsFailure('Invalid district ID'));
      return;
    }
    const wards: LocationOption[] = yield call(fetchWardsFromAPI, districtId);
    yield put(fetchWardsSuccess(wards));
  } catch (error) {
    console.error('Fetch wards error:', error);
    yield put(fetchWardsFailure('Failed to load wards'));
  }
}

// Root saga
export function* locationSaga() {
  yield takeLatest(fetchCitiesRequest.type, fetchCitiesSaga);
  yield takeLatest(fetchDistrictsRequest.type, fetchDistrictsSaga);
  yield takeLatest(fetchWardsRequest.type, fetchWardsSaga);
}
