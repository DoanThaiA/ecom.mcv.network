import type { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { fileRepository } from '@/lib/repositories';
import type { File as FileType, FileResponse } from '@/types/gen/shared/shared/files/file';
import { showErrorToast } from '@/lib/helpers/toastHelper';
import {
  setUploadLoading,
  setUploadProgress,
  setUploadSuccess,
  uploadFileRequest,
  uploadMultipleFilesRequest,
  type UploadFilePayload,
  type UploadMultipleFilesPayload,
} from '../slices/fileSlice';

/**
 * Upload Single File Saga
 * Uploads a single file using multipart/form-data
 */
function* uploadFileSaga(action: PayloadAction<UploadFilePayload>) {
  const { file, onSuccess, onError } = action.payload;

  try {
    yield put(setUploadLoading(true));
    yield put(setUploadProgress(0));

    // Use direct multipart/form-data upload
    const response: FileResponse = yield call(fileRepository.uploadFile, file);
    const uploadedFile = response.file;

    if (uploadedFile) {
      yield put(setUploadSuccess(uploadedFile));

      if (onSuccess) {
        onSuccess(uploadedFile);
      }
    } else {
      throw new Error('Upload file failed');
    }
  } catch (error) {
    yield put(setUploadLoading(false));
    showErrorToast(error);

    if (onError) {
      onError();
    }
  }
}

/**
 * Upload Multiple Files Saga
 * Uploads multiple files in parallel using multipart/form-data
 */
function* uploadMultipleFilesSaga(
  action: PayloadAction<UploadMultipleFilesPayload>
) {
  const { files, onSuccess, onError } = action.payload;

  try {
    yield put(setUploadLoading(true));
    yield put(setUploadProgress(0));

    // Upload all files using direct multipart/form-data in parallel
    const results: FileResponse[] = yield all(
      files.map((file) => call(fileRepository.uploadFile, file))
    );

    // Extract files from responses
    const uploadedFiles: FileType[] = [];
    results.forEach((result) => {
      if (result.file) {
        uploadedFiles.push(result.file);
      }
    });

    yield put(setUploadProgress(100));
    yield put(setUploadLoading(false));

    if (onSuccess && uploadedFiles.length > 0) {
      onSuccess(uploadedFiles);
    }
  } catch (error) {
    yield put(setUploadLoading(false));
    showErrorToast(error);

    if (onError) {
      onError();
    }
  }
}

/**
 * Root File Saga Watcher
 */
function* watchFile() {
  yield takeLatest(uploadFileRequest.type, uploadFileSaga);
  yield takeLatest(uploadMultipleFilesRequest.type, uploadMultipleFilesSaga);
}

/**
 * Root File Saga
 */
export function* fileSaga() {
  yield call(watchFile);
}
