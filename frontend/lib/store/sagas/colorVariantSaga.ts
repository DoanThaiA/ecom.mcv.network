import { call, put, takeLatest } from 'redux-saga/effects';
import { colorVariantRepository } from '@/lib/repositories/colorVariant.repository';
import {
  fetchColorVariantsRequest,
  fetchColorVariantsSuccess,
} from '../slices/colorVariantSlice';
import type { ColorVariant } from '@/types/colorVariant';

/**
 * Handle fetch color variants
 * Silent on errors - UI falls back to local color mapping
 */
function* handleFetchColorVariants() {
  try {
    const variants: ColorVariant[] = yield call([
      colorVariantRepository,
      colorVariantRepository.getAllColorVariants,
    ]);

    yield put(fetchColorVariantsSuccess(variants));
  } catch {
    // Silent - UI uses getColorHex() fallback
  }
}

/**
 * Color Variant Saga Watcher
 */
export function* colorVariantSaga() {
  yield takeLatest(fetchColorVariantsRequest.type, handleFetchColorVariants);
}
