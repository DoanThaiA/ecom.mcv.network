import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { File as FileType } from '@/types/gen/shared/shared/files/file';

/**
 * File State
 */
export interface FileState {
  uploadedFile: FileType | null;
  uploadLoading: boolean;
  uploadProgress: number;
}

const initialState: FileState = {
  uploadedFile: null,
  uploadLoading: false,
  uploadProgress: 0,
};

/**
 * Saga Action Payload Types
 */
export type UploadFilePayload = {
  file: File;
  onSuccess?: (_file: FileType) => void;
  onError?: () => void;
};

export type UploadMultipleFilesPayload = {
  files: File[];
  onSuccess?: (_files: FileType[]) => void;
  onError?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const uploadFileRequest =
  createAction<UploadFilePayload>('file/uploadFileRequest');
export const uploadMultipleFilesRequest =
  createAction<UploadMultipleFilesPayload>('file/uploadMultipleFilesRequest');

/**
 * File Slice
 */
export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    // Upload file
    setUploadLoading: (state, action: PayloadAction<boolean>) => {
      state.uploadLoading = action.payload;
    },

    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },

    setUploadSuccess: (state, action: PayloadAction<FileType>) => {
      state.uploadedFile = action.payload;
      state.uploadLoading = false;
      state.uploadProgress = 100;
    },

    // Reset state
    resetFileState: (state) => {
      state.uploadedFile = null;
      state.uploadLoading = false;
      state.uploadProgress = 0;
    },

    clearUploadedFile: (state) => {
      state.uploadedFile = null;
    },
  },
});

export const {
  setUploadLoading,
  setUploadProgress,
  setUploadSuccess,
  resetFileState,
  clearUploadedFile,
} = fileSlice.actions;

/**
 * Selectors
 */
export const selectUploadedFile = (state: { file: FileState }) =>
  state.file.uploadedFile;

export const selectUploadLoading = (state: { file: FileState }) =>
  state.file.uploadLoading;

export const selectUploadProgress = (state: { file: FileState }) =>
  state.file.uploadProgress;

export default fileSlice.reducer;
