import type { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { fileRepository } from 'src/repositories';
import type { File as FileType, FileResponse } from 'src/types/gen/shared/shared/files/file';
import { showError } from 'src/utils/toast';
import {
  setUploadLoading,
  setUploadProgress,
  setUploadSuccess,
  uploadFileRequest,
  uploadMultipleFilesRequest,
  type UploadFilePayload,
  type UploadMultipleFilesPayload,
} from '../store/fileSlice';

/**
 * Upload Single File Saga
 * Uploads a single file (supports both multipart/form-data and presigned URL)
 */
function* uploadFileSaga(action: PayloadAction<UploadFilePayload>) {
  const { file, driver = 's3-presigned', onSuccess, onError } = action.payload;

  try {
    yield put(setUploadLoading(true));
    yield put(setUploadProgress(0));

    let uploadedFile: FileType | undefined;

    if (driver === 's3-presigned') {
      // Use presigned URL upload flow
      uploadedFile = yield call(fileRepository.uploadWithPresignedUrl, file);
    } else {
      // Use multipart/form-data upload (for s3 and local drivers)
      const response: FileResponse = yield call(fileRepository.uploadFile, file);
      uploadedFile = response.file;
    }

    if (uploadedFile) {
      yield put(setUploadSuccess(uploadedFile));

      if (onSuccess) {
        onSuccess(uploadedFile);
      }
    } else {
      throw new Error(i18next.t('uploadFileFailed'));
    }
  } catch (error) {
    console.error('Upload file error:', error);
    yield put(setUploadLoading(false));
    showError(error);

    if (onError) {
      onError();
    }
  }
}

/**
 * Upload Multiple Files Saga
 * Uploads multiple files in parallel
 */
function* uploadMultipleFilesSaga(action: PayloadAction<UploadMultipleFilesPayload>) {
  const { files, driver = 's3-presigned', onSuccess, onError } = action.payload;

  try {
    yield put(setUploadLoading(true));
    yield put(setUploadProgress(0));

    const uploadedFiles: FileType[] = [];

    if (driver === 's3-presigned') {
      // Upload all files using presigned URLs in parallel
      const results: (FileType | undefined)[] = yield all(
        files.map((file) => call(fileRepository.uploadWithPresignedUrl, file))
      );

      // Filter out undefined results
      results.forEach((result) => {
        if (result) {
          uploadedFiles.push(result);
        }
      });
    } else {
      // Upload all files using multipart/form-data in parallel
      const results: FileResponse[] = yield all(
        files.map((file) => call(fileRepository.uploadFile, file))
      );

      // Extract file from response
      results.forEach((result) => {
        if (result.file) {
          uploadedFiles.push(result.file);
        }
      });
    }

    yield put(setUploadProgress(100));
    yield put(setUploadLoading(false));

    if (onSuccess && uploadedFiles.length > 0) {
      onSuccess(uploadedFiles);
    }
  } catch (error) {
    console.error('Upload multiple files error:', error);
    yield put(setUploadLoading(false));
    showError(error);

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
