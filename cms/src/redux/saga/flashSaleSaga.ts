import type { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { flashSaleRepository } from 'src/repositories/flash-sale.repository';
import type { FlashSaleResponse as FlashSale } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type { QueryFlashSalesResponse } from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import { showError, showSuccess } from 'src/utils/toast';

import {
  createFlashSaleRequest,
  deleteFlashSaleRequest,
  getFlashSaleByIdRequest,
  getFlashSalesRequest,
  toggleFlashSaleRequest,
  updateFlashSaleRequest,
  addFlashSaleProductRequest,
  bulkAddFlashSaleProductsRequest,
  bulkUpdateFlashSaleProductsRequest,
  updateFlashSaleProductRequest,
  removeFlashSaleProductRequest,
  bulkRemoveFlashSaleProductsRequest,
  toggleFlashSaleProductRequest,
  coordinatedBulkUpdateFlashSaleRequest,
  getFlashSaleProductIdsRequest,
  upsertFlashSaleProductsRequest,
  setCreateFlashSaleError,
  setCreateFlashSaleLoading,
  setCreateFlashSaleSuccess,
  setCurrentFlashSaleError,
  setCurrentFlashSaleLoading,
  setCurrentFlashSaleSuccess,
  setDeleteFlashSaleError,
  setDeleteFlashSaleLoading,
  setDeleteFlashSaleSuccess,
  setFlashSaleError,
  setFlashSaleLoading,
  setFlashSalesSuccess,
  setUpdateFlashSaleError,
  setUpdateFlashSaleLoading,
  setUpdateFlashSaleSuccess,
  setToggleFlashSaleLoading,
  setToggleFlashSaleSuccess,
  setToggleFlashSaleError,
  setAddProductLoading,
  setAddProductSuccess,
  setAddProductError,
  setBulkAddProgress,
  setBulkAddResult,
  upsertFlashSaleProductsSuccess,
  upsertFlashSaleProductsFailure,
  setUpdateProductLoading,
  setUpdateProductSuccess,
  setUpdateProductError,
  setRemoveProductLoading,
  setRemoveProductSuccess,
  setRemoveProductError,
  setToggleProductLoading,
  setToggleProductSuccess,
  setToggleProductError,
  setProductIdsLoading,
  setFlashSaleProductIdsSuccess,
  setFlashSaleProductIdsError,
  type CreateFlashSalePayload,
  type DeleteFlashSalePayload,
  type GetFlashSaleByIdPayload,
  type GetFlashSalesPayload,
  type UpdateFlashSalePayload,
  type ToggleFlashSalePayload,
  type AddFlashSaleProductPayload,
  type UpdateFlashSaleProductPayload,
  type BulkAddFlashSaleProductsPayload,
  type BulkUpdateFlashSaleProductsPayload,
  type RemoveFlashSaleProductPayload,
  type BulkRemoveFlashSaleProductsPayload,
  type ToggleFlashSaleProductPayload,
  type CoordinatedBulkUpdateFlashSalePayload,
  type GetFlashSaleProductIdsPayload,
  type UpsertFlashSaleProductsPayload,
} from '../store/flashSaleSlice';
import type {
  BulkAddFlashSaleProductsResponse,
  BulkUpsertFlashSaleProductsResponse,
  FailedProduct,
  FlashSaleProductIdResponse,
} from 'src/repositories/flash-sale.repository';

/**
 * Get Flash Sales Saga
 * Fetches flash sales with filters and pagination
 */
function* getFlashSalesSaga(action: PayloadAction<GetFlashSalesPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setFlashSaleLoading(true));

    const response: QueryFlashSalesResponse = yield call(flashSaleRepository.queryFlashSales, {
      page,
      limit,
      filters,
      sort,
    });

    yield put(
      setFlashSalesSuccess({
        flashSales: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setFlashSaleError());
    showError(error);
  }
}

/**
 * Get Flash Sale By ID Saga
 * Fetches a single flash sale by ID with products (server-side pagination)
 */
function* getFlashSaleByIdSaga(action: PayloadAction<GetFlashSaleByIdPayload>) {
  const { id, page, limit, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setCurrentFlashSaleLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.getFlashSale, {
      flashSaleId: id,
      page,
      limit,
      filters,
      sort: sort ?? [],
    });

    yield put(setCurrentFlashSaleSuccess(flashSale));

    if (onSuccess) {
      onSuccess(flashSale);
    }
  } catch (error) {
    yield put(setCurrentFlashSaleError());
    showError(error);
  }
}

/**
 * Get Flash Sale Product IDs Saga
 * Fetches all product IDs with order numbers for a flash sale
 */
function* getFlashSaleProductIdsSaga(action: PayloadAction<GetFlashSaleProductIdsPayload>) {
  const { flashSaleId } = action.payload;

  try {
    yield put(setProductIdsLoading(true));

    const productIds: FlashSaleProductIdResponse[] = yield call(
      flashSaleRepository.getFlashSaleProductIds,
      flashSaleId
    );

    yield put(setFlashSaleProductIdsSuccess(productIds));
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to fetch product IDs';
    yield put(setFlashSaleProductIdsError(errorMessage));
    showError(error);
  }
}

/**
 * Create Flash Sale Saga
 * Creates a new flash sale
 */
function* createFlashSaleSaga(action: PayloadAction<CreateFlashSalePayload>) {
  const { name, startTime, endTime, isEnabled, onSuccess } = action.payload;

  try {
    yield put(setCreateFlashSaleLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.createFlashSale, {
      name,
      startTime,
      endTime,
      ...(isEnabled !== undefined && { isEnabled }),
    });

    yield put(setCreateFlashSaleSuccess());
    showSuccess(i18next.t('createFlashSaleSuccess'));

    if (onSuccess) {
      onSuccess(flashSale);
    }
  } catch (error) {
    yield put(setCreateFlashSaleError());
    showError(error);
  }
}

/**
 * Update Flash Sale Saga
 * Updates an existing flash sale
 */
function* updateFlashSaleSaga(action: PayloadAction<UpdateFlashSalePayload>) {
  const { flashSaleId, name, startTime, endTime, isEnabled, onSuccess } = action.payload;

  try {
    yield put(setUpdateFlashSaleLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.updateFlashSale, {
      flashSaleId,
      name,
      startTime,
      endTime,
      isEnabled,
    });

    yield put(setUpdateFlashSaleSuccess(flashSale));
    showSuccess(i18next.t('updateFlashSaleSuccess'));

    if (onSuccess) {
      onSuccess(flashSale);
    }
  } catch (error) {
    yield put(setUpdateFlashSaleError());
    showError(error);
  }
}

/**
 * Delete Flash Sale Saga
 * Deletes a flash sale
 */
function* deleteFlashSaleSaga(action: PayloadAction<DeleteFlashSalePayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteFlashSaleLoading(true));

    yield call(flashSaleRepository.deleteFlashSale, id);

    yield put(setDeleteFlashSaleSuccess(id));
    showSuccess(i18next.t('deleteFlashSaleSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteFlashSaleError());
    showError(error);
  }
}

/**
 * Toggle Flash Sale Saga
 * Toggles the enabled status of a flash sale
 */
function* toggleFlashSaleSaga(action: PayloadAction<ToggleFlashSalePayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setToggleFlashSaleLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.toggleFlashSale, id);

    yield put(setToggleFlashSaleSuccess(flashSale));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setToggleFlashSaleError());
    showError(error);
  }
}

/**
 * Add Flash Sale Product Saga
 * Adds a product to flash sale
 */
function* addFlashSaleProductSaga(action: PayloadAction<AddFlashSaleProductPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setAddProductLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.addFlashSaleProduct, data);

    yield put(setAddProductSuccess(flashSale));
    showSuccess(i18next.t('addFlashSaleProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAddProductError());
    showError(error);
  }
}

/**
 * Update Flash Sale Product Saga
 * Updates a product in flash sale
 */
function* updateFlashSaleProductSaga(action: PayloadAction<UpdateFlashSaleProductPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.updateFlashSaleProduct, data);

    yield put(setUpdateProductSuccess(flashSale));
    showSuccess(i18next.t('updateFlashSaleProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateProductError());
    showError(error);
  }
}

const BULK_ADD_CHUNK_SIZE = 200;

/**
 * Bulk Add Flash Sale Products Saga
 * Splits products into chunks of BULK_ADD_CHUNK_SIZE and sends sequentially.
 * Dispatches progress updates after each chunk.
 */
function* bulkAddFlashSaleProductsSaga(action: PayloadAction<BulkAddFlashSaleProductsPayload>) {
  const { data, onSuccess } = action.payload;
  const { flashSaleId, products } = data;
  const totalProducts = products.length;

  try {
    yield put(setAddProductLoading(true));
    yield put(setBulkAddProgress({ current: 0, total: totalProducts }));

    let totalAdded = 0;
    let totalFailed = 0;
    const allFailedProducts: FailedProduct[] = [];

    for (let i = 0; i < totalProducts; i += BULK_ADD_CHUNK_SIZE) {
      const chunk = products.slice(i, i + BULK_ADD_CHUNK_SIZE);

      const result: BulkAddFlashSaleProductsResponse = yield call(
        flashSaleRepository.bulkAddFlashSaleProducts,
        { flashSaleId, products: chunk }
      );

      totalAdded += result.addedCount;
      totalFailed += result.failedCount;
      allFailedProducts.push(...result.failedProducts);

      const processed = Math.min(i + chunk.length, totalProducts);
      yield put(setBulkAddProgress({ current: processed, total: totalProducts }));
    }

    yield put(setBulkAddProgress(null));

    // Re-fetch the flash sale to get updated state
    const flashSale: FlashSale = yield call(() =>
      flashSaleRepository.getFlashSale({ flashSaleId, page: 1, limit: 10, sort: [] })
    );

    yield put(setAddProductSuccess(flashSale));

    if (totalFailed > 0) {
      yield put(
        setBulkAddResult({
          addedCount: totalAdded,
          failedCount: totalFailed,
          failedProducts: allFailedProducts,
        })
      );
    } else {
      showSuccess(i18next.t('addFlashSaleProductSuccess'));
      if (onSuccess) {
        onSuccess(flashSale);
      }
    }
  } catch (error) {
    yield put(setBulkAddProgress(null));
    yield put(setAddProductError());
    showError(error);
  }
}

/**
 * Bulk Update Flash Sale Products Saga
 * Updates multiple products in flash sale at once
 */
function* bulkUpdateFlashSaleProductsSaga(
  action: PayloadAction<BulkUpdateFlashSaleProductsPayload>
) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductLoading(true));

    const flashSale: FlashSale = yield call(flashSaleRepository.bulkUpdateFlashSaleProducts, data);

    yield put(setUpdateProductSuccess(flashSale));
    showSuccess(i18next.t('updateFlashSaleProductSuccess'));

    if (onSuccess) {
      onSuccess(flashSale);
    }
  } catch (error) {
    yield put(setUpdateProductError());
    showError(error);
  }
}

/**
 * Upsert Flash Sale Products Saga
 * Add or update multiple products in flash sale with single PUT call
 */
function* upsertFlashSaleProductsSaga(action: PayloadAction<UpsertFlashSaleProductsPayload>) {
  const { flashSaleId, data, onSuccess } = action.payload;

  try {
    const response: BulkUpsertFlashSaleProductsResponse = yield call(
      flashSaleRepository.upsertFlashSaleProducts,
      flashSaleId,
      data
    );

    yield put(upsertFlashSaleProductsSuccess(response));

    // Show success toast
    if (response.upsertedCount > 0) {
      if (response.failedCount === 0) {
        // All succeeded
        showSuccess(
          i18next.t('flashSaleProductsUpsertedSuccessfully', {
            count: response.upsertedCount,
          })
        );
      } else {
        // Partial success - warning toast will be shown
        // The BulkAddResultDialog will display the details
      }
    } else if (response.failedCount > 0) {
      // All failed
      showError(i18next.t('flashSaleProductsUpsertFailed'));
    }

    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    yield put(upsertFlashSaleProductsFailure());
    showError(error);
  }
}

/**
 * Remove Flash Sale Product Saga
 * Removes a product from flash sale
 */
function* removeFlashSaleProductSaga(action: PayloadAction<RemoveFlashSaleProductPayload>) {
  const { flashSaleId, productId, onSuccess } = action.payload;

  try {
    yield put(setRemoveProductLoading(true));

    const flashSale: FlashSale = yield call(
      flashSaleRepository.removeFlashSaleProduct,
      flashSaleId,
      productId
    );

    yield put(setRemoveProductSuccess(flashSale));
    showSuccess(i18next.t('removeFlashSaleProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setRemoveProductError());
    showError(error);
  }
}

/**
 * Bulk Remove Flash Sale Products Saga
 * Removes multiple products from flash sale in a single request
 */
function* bulkRemoveFlashSaleProductsSaga(
  action: PayloadAction<BulkRemoveFlashSaleProductsPayload>
) {
  const { flashSaleId, productIds, onSuccess } = action.payload;

  try {
    yield put(setRemoveProductLoading(true));

    const flashSale: FlashSale = yield call(
      flashSaleRepository.bulkRemoveFlashSaleProducts,
      flashSaleId,
      productIds
    );

    yield put(setRemoveProductSuccess(flashSale));
    showSuccess(i18next.t('removeFlashSaleProductSuccess'));

    if (onSuccess) {
      onSuccess(flashSale);
    }
  } catch (error) {
    yield put(setRemoveProductError());
    showError(error);
  }
}

/**
 * Toggle Flash Sale Product Saga
 * Toggles the enabled status of a product in flash sale
 */
function* toggleFlashSaleProductSaga(action: PayloadAction<ToggleFlashSaleProductPayload>) {
  const { flashSaleId, productId, onSuccess } = action.payload;

  try {
    yield put(setToggleProductLoading(true));

    const flashSale: FlashSale = yield call(
      flashSaleRepository.toggleFlashSaleProduct,
      flashSaleId,
      productId
    );

    yield put(setToggleProductSuccess(flashSale));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setToggleProductError());
    showError(error);
  }
}

/**
 * Coordinated Bulk Update Flash Sale Products Saga
 * Executes add, update, and remove operations in parallel
 * Shows single consolidated success/error message
 */
function* coordinatedBulkUpdateFlashSaleSaga(
  action: PayloadAction<CoordinatedBulkUpdateFlashSalePayload>
) {
  const { flashSaleId, toAdd, toUpdate, toRemove, onSuccess, onError } = action.payload;

  try {
    // Set loading states for all operations that will run
    const loadingStates: any[] = [];
    if (toAdd.length > 0) loadingStates.push(put(setAddProductLoading(true)));
    if (toUpdate.length > 0) loadingStates.push(put(setUpdateProductLoading(true)));
    if (toRemove.length > 0) loadingStates.push(put(setRemoveProductLoading(true)));

    if (loadingStates.length > 0) {
      yield all(loadingStates);
    }

    // Build array of operations to execute in parallel
    const operations: any[] = [];
    const operationTypes: string[] = [];

    // Add bulk add operation if needed
    if (toAdd.length > 0) {
      operations.push(
        call(function* () {
          // Handle chunked bulk add with progress
          let totalAdded = 0;
          let totalFailed = 0;
          const allFailedProducts: FailedProduct[] = [];
          const totalProducts = toAdd.length;

          yield put(setBulkAddProgress({ current: 0, total: totalProducts }));

          for (let i = 0; i < totalProducts; i += BULK_ADD_CHUNK_SIZE) {
            const chunk = toAdd.slice(i, i + BULK_ADD_CHUNK_SIZE);

            const result: BulkAddFlashSaleProductsResponse = yield call(
              flashSaleRepository.bulkAddFlashSaleProducts,
              { flashSaleId, products: chunk }
            );

            totalAdded += result.addedCount;
            totalFailed += result.failedCount;
            allFailedProducts.push(...result.failedProducts);

            const processed = Math.min(i + chunk.length, totalProducts);
            yield put(setBulkAddProgress({ current: processed, total: totalProducts }));
          }

          yield put(setBulkAddProgress(null));

          return { totalAdded, totalFailed, failedProducts: allFailedProducts };
        })
      );
      operationTypes.push('add');
    }

    // Add bulk update operation if needed
    if (toUpdate.length > 0) {
      operations.push(
        call(flashSaleRepository.bulkUpdateFlashSaleProducts, {
          flashSaleId,
          products: toUpdate,
        })
      );
      operationTypes.push('update');
    }

    // Add bulk remove operation if needed
    if (toRemove.length > 0) {
      operations.push(call(flashSaleRepository.bulkRemoveFlashSaleProducts, flashSaleId, toRemove));
      operationTypes.push('remove');
    }

    // Execute all operations in parallel
    const results: any[] = [];
    const errors: any = {};

    if (operations.length > 0) {
      // Use allSettled pattern for partial failure support
      const settledResults: any[] = yield all(
        operations.map((op) =>
          call(function* () {
            try {
              return { success: true, data: yield op };
            } catch (error) {
              return { success: false, error };
            }
          })
        )
      );

      // Process results
      settledResults.forEach((result, index) => {
        const opType = operationTypes[index];
        if (result.success) {
          results.push(result.data);
        } else {
          errors[opType] = result.error;
        }
      });
    }

    // Check if any operation failed
    const hasErrors = Object.keys(errors).length > 0;

    // Re-fetch flash sale to get updated state
    const flashSale: FlashSale = yield call(() =>
      flashSaleRepository.getFlashSale({ flashSaleId, page: 1, limit: 10, sort: [] })
    );

    // Update Redux state
    if (toAdd.length > 0) yield put(setAddProductSuccess(flashSale));
    if (toUpdate.length > 0) yield put(setUpdateProductSuccess(flashSale));
    if (toRemove.length > 0) yield put(setRemoveProductSuccess(flashSale));

    // Handle bulk add failures
    const addResult = results.find((r) => r && 'totalAdded' in r);
    if (addResult && addResult.totalFailed > 0) {
      yield put(
        setBulkAddResult({
          addedCount: addResult.totalAdded,
          failedCount: addResult.totalFailed,
          failedProducts: addResult.failedProducts,
        })
      );
    }

    // Show appropriate toast messages
    if (hasErrors) {
      // Some operations failed
      const failedOps = Object.keys(errors).join(', ');
      showError(i18next.t('bulkUpdatePartialFailure', { operations: failedOps }));

      if (onError) {
        onError(errors);
      }
    } else {
      // All operations succeeded
      if (!addResult || addResult.totalFailed === 0) {
        showSuccess(i18next.t('bulkUpdateFlashSaleSuccess'));
      }

      if (onSuccess) {
        onSuccess(flashSale);
      }
    }
  } catch (error) {
    // Complete failure - clear all loading states
    yield put(setAddProductLoading(false));
    yield put(setUpdateProductLoading(false));
    yield put(setRemoveProductLoading(false));
    yield put(setBulkAddProgress(null));

    showError(error);

    if (onError) {
      onError({ general: error });
    }
  }
}

/**
 * Root Flash Sale Saga Watcher
 */
function* watchFlashSale() {
  yield takeLatest(getFlashSalesRequest.type, getFlashSalesSaga);
  yield takeLatest(getFlashSaleByIdRequest.type, getFlashSaleByIdSaga);
  yield takeLatest(getFlashSaleProductIdsRequest.type, getFlashSaleProductIdsSaga);
  yield takeLatest(createFlashSaleRequest.type, createFlashSaleSaga);
  yield takeLatest(updateFlashSaleRequest.type, updateFlashSaleSaga);
  yield takeLatest(deleteFlashSaleRequest.type, deleteFlashSaleSaga);
  yield takeLatest(toggleFlashSaleRequest.type, toggleFlashSaleSaga);
  yield takeLatest(addFlashSaleProductRequest.type, addFlashSaleProductSaga);
  yield takeLatest(updateFlashSaleProductRequest.type, updateFlashSaleProductSaga);
  yield takeLatest(bulkAddFlashSaleProductsRequest.type, bulkAddFlashSaleProductsSaga);
  yield takeLatest(bulkUpdateFlashSaleProductsRequest.type, bulkUpdateFlashSaleProductsSaga);
  yield takeLatest(upsertFlashSaleProductsRequest.type, upsertFlashSaleProductsSaga);
  yield takeEvery(removeFlashSaleProductRequest.type, removeFlashSaleProductSaga);
  yield takeLatest(bulkRemoveFlashSaleProductsRequest.type, bulkRemoveFlashSaleProductsSaga);
  yield takeLatest(toggleFlashSaleProductRequest.type, toggleFlashSaleProductSaga);
  yield takeLatest(coordinatedBulkUpdateFlashSaleRequest.type, coordinatedBulkUpdateFlashSaleSaga);
}

/**
 * Root Flash Sale Saga
 */
export function* flashSaleSaga() {
  yield call(watchFlashSale);
}
