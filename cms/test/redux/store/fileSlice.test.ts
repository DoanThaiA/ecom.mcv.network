import { describe, it, expect, vi } from 'vitest';

import fileReducer, {
  setUploadLoading,
  setUploadProgress,
  setUploadSuccess,
  resetFileState,
  clearUploadedFile,
  uploadFileRequest,
  uploadMultipleFilesRequest,
  selectUploadedFile,
  selectUploadLoading,
  selectUploadProgress,
  type FileState,
  type UploadDriver,
} from 'src/redux/store/fileSlice';
import type { File as FileType } from 'src/types/gen/shared/shared/files/file';

describe('fileSlice', () => {
  const initialState: FileState = {
    uploadedFile: null,
    uploadLoading: false,
    uploadProgress: 0,
  };

  const mockFile: FileType = {
    id: 'file-1',
    name: 'test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    createdAt: '2024-01-01T00:00:00Z',
  };

  describe('reducers', () => {
    describe('setUploadLoading', () => {
      it('sets loading to true', () => {
        const state = fileReducer(initialState, setUploadLoading(true));

        expect(state.uploadLoading).toBe(true);
        expect(state.uploadedFile).toBe(null);
        expect(state.uploadProgress).toBe(0);
      });

      it('sets loading to false', () => {
        const loadingState: FileState = {
          uploadedFile: null,
          uploadLoading: true,
          uploadProgress: 50,
        };

        const state = fileReducer(loadingState, setUploadLoading(false));

        expect(state.uploadLoading).toBe(false);
      });

      it('does not affect other state properties', () => {
        const stateWithData: FileState = {
          uploadedFile: mockFile,
          uploadLoading: false,
          uploadProgress: 100,
        };

        const state = fileReducer(stateWithData, setUploadLoading(true));

        expect(state.uploadLoading).toBe(true);
        expect(state.uploadedFile).toEqual(mockFile);
        expect(state.uploadProgress).toBe(100);
      });
    });

    describe('setUploadProgress', () => {
      it('sets progress to 0', () => {
        const state = fileReducer(initialState, setUploadProgress(0));

        expect(state.uploadProgress).toBe(0);
      });

      it('sets progress to 50', () => {
        const state = fileReducer(initialState, setUploadProgress(50));

        expect(state.uploadProgress).toBe(50);
      });

      it('sets progress to 100', () => {
        const state = fileReducer(initialState, setUploadProgress(100));

        expect(state.uploadProgress).toBe(100);
      });

      it('updates existing progress', () => {
        let state: FileState = {
          uploadedFile: null,
          uploadLoading: true,
          uploadProgress: 25,
        };

        state = fileReducer(state, setUploadProgress(75));

        expect(state.uploadProgress).toBe(75);
      });

      it('does not affect other state properties', () => {
        const stateWithData: FileState = {
          uploadedFile: mockFile,
          uploadLoading: true,
          uploadProgress: 0,
        };

        const state = fileReducer(stateWithData, setUploadProgress(50));

        expect(state.uploadProgress).toBe(50);
        expect(state.uploadedFile).toEqual(mockFile);
        expect(state.uploadLoading).toBe(true);
      });
    });

    describe('setUploadSuccess', () => {
      it('sets uploaded file and completes upload', () => {
        const loadingState: FileState = {
          uploadedFile: null,
          uploadLoading: true,
          uploadProgress: 80,
        };

        const state = fileReducer(loadingState, setUploadSuccess(mockFile));

        expect(state.uploadedFile).toEqual(mockFile);
        expect(state.uploadLoading).toBe(false);
        expect(state.uploadProgress).toBe(100);
      });

      it('replaces existing uploaded file', () => {
        const stateWithFile: FileState = {
          uploadedFile: mockFile,
          uploadLoading: false,
          uploadProgress: 100,
        };

        const newFile: FileType = {
          id: 'file-2',
          name: 'new-document.pdf',
          url: 'https://example.com/new-document.pdf',
          mimeType: 'application/pdf',
          size: 2048000,
          createdAt: '2024-01-02T00:00:00Z',
        };

        const state = fileReducer(stateWithFile, setUploadSuccess(newFile));

        expect(state.uploadedFile).toEqual(newFile);
        expect(state.uploadedFile).not.toEqual(mockFile);
      });

      it('always sets loading to false and progress to 100', () => {
        const state = fileReducer(initialState, setUploadSuccess(mockFile));

        expect(state.uploadLoading).toBe(false);
        expect(state.uploadProgress).toBe(100);
      });
    });

    describe('resetFileState', () => {
      it('resets all state to initial values', () => {
        const stateWithData: FileState = {
          uploadedFile: mockFile,
          uploadLoading: true,
          uploadProgress: 75,
        };

        const state = fileReducer(stateWithData, resetFileState());

        expect(state.uploadedFile).toBe(null);
        expect(state.uploadLoading).toBe(false);
        expect(state.uploadProgress).toBe(0);
      });

      it('works on already empty state', () => {
        const state = fileReducer(initialState, resetFileState());

        expect(state).toEqual(initialState);
      });

      it('resets after successful upload', () => {
        const successState: FileState = {
          uploadedFile: mockFile,
          uploadLoading: false,
          uploadProgress: 100,
        };

        const state = fileReducer(successState, resetFileState());

        expect(state.uploadedFile).toBe(null);
        expect(state.uploadLoading).toBe(false);
        expect(state.uploadProgress).toBe(0);
      });
    });

    describe('clearUploadedFile', () => {
      it('clears uploaded file only', () => {
        const stateWithFile: FileState = {
          uploadedFile: mockFile,
          uploadLoading: false,
          uploadProgress: 100,
        };

        const state = fileReducer(stateWithFile, clearUploadedFile());

        expect(state.uploadedFile).toBe(null);
        expect(state.uploadLoading).toBe(false);
        expect(state.uploadProgress).toBe(100);
      });

      it('does not affect loading state', () => {
        const loadingState: FileState = {
          uploadedFile: mockFile,
          uploadLoading: true,
          uploadProgress: 50,
        };

        const state = fileReducer(loadingState, clearUploadedFile());

        expect(state.uploadedFile).toBe(null);
        expect(state.uploadLoading).toBe(true);
        expect(state.uploadProgress).toBe(50);
      });

      it('works on already empty file', () => {
        const state = fileReducer(initialState, clearUploadedFile());

        expect(state.uploadedFile).toBe(null);
      });
    });
  });

  describe('saga actions', () => {
    describe('uploadFileRequest', () => {
      it('creates correct action type', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const action = uploadFileRequest({ file });

        expect(action.type).toBe('file/uploadFileRequest');
      });

      it('includes file in payload', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const action = uploadFileRequest({ file });

        expect(action.payload.file).toBe(file);
      });

      it('includes driver in payload', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const driver: UploadDriver = 's3-presigned';
        const action = uploadFileRequest({ file, driver });

        expect(action.payload.driver).toBe('s3-presigned');
      });

      it('includes callbacks in payload', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = uploadFileRequest({ file, onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles all driver types', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const drivers: UploadDriver[] = ['s3-presigned', 's3', 'local'];

        drivers.forEach((driver) => {
          const action = uploadFileRequest({ file, driver });
          expect(action.payload.driver).toBe(driver);
        });
      });

      it('handles payload without optional fields', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const action = uploadFileRequest({ file });

        expect(action.payload.file).toBe(file);
        expect(action.payload.driver).toBeUndefined();
        expect(action.payload.onSuccess).toBeUndefined();
        expect(action.payload.onError).toBeUndefined();
      });
    });

    describe('uploadMultipleFilesRequest', () => {
      it('creates correct action type', () => {
        const files = [
          new File(['content1'], 'test1.txt', { type: 'text/plain' }),
          new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        ];
        const action = uploadMultipleFilesRequest({ files });

        expect(action.type).toBe('file/uploadMultipleFilesRequest');
      });

      it('includes files array in payload', () => {
        const files = [
          new File(['content1'], 'test1.txt', { type: 'text/plain' }),
          new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        ];
        const action = uploadMultipleFilesRequest({ files });

        expect(action.payload.files).toEqual(files);
        expect(action.payload.files).toHaveLength(2);
      });

      it('includes driver in payload', () => {
        const files = [new File(['content'], 'test.txt', { type: 'text/plain' })];
        const driver: UploadDriver = 's3';
        const action = uploadMultipleFilesRequest({ files, driver });

        expect(action.payload.driver).toBe('s3');
      });

      it('includes callbacks in payload', () => {
        const files = [new File(['content'], 'test.txt', { type: 'text/plain' })];
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = uploadMultipleFilesRequest({ files, onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles empty files array', () => {
        const action = uploadMultipleFilesRequest({ files: [] });

        expect(action.payload.files).toEqual([]);
        expect(action.payload.files).toHaveLength(0);
      });

      it('handles large files array', () => {
        const files = Array.from({ length: 10 }, (_, i) =>
          new File([`content${i}`], `test${i}.txt`, { type: 'text/plain' })
        );
        const action = uploadMultipleFilesRequest({ files });

        expect(action.payload.files).toHaveLength(10);
      });
    });
  });

  describe('selectors', () => {
    describe('selectUploadedFile', () => {
      it('returns null for initial state', () => {
        const state = { file: initialState };

        const file = selectUploadedFile(state);

        expect(file).toBe(null);
      });

      it('returns uploaded file when present', () => {
        const state = {
          file: {
            uploadedFile: mockFile,
            uploadLoading: false,
            uploadProgress: 100,
          },
        };

        const file = selectUploadedFile(state);

        expect(file).toEqual(mockFile);
      });

      it('returns null after clearing file', () => {
        const stateWithFile = {
          file: {
            uploadedFile: mockFile,
            uploadLoading: false,
            uploadProgress: 100,
          },
        };

        const clearedState = {
          file: fileReducer(stateWithFile.file, clearUploadedFile()),
        };

        const file = selectUploadedFile(clearedState);

        expect(file).toBe(null);
      });
    });

    describe('selectUploadLoading', () => {
      it('returns false for initial state', () => {
        const state = { file: initialState };

        const loading = selectUploadLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when uploading', () => {
        const state = {
          file: {
            uploadedFile: null,
            uploadLoading: true,
            uploadProgress: 50,
          },
        };

        const loading = selectUploadLoading(state);

        expect(loading).toBe(true);
      });

      it('returns false after upload completes', () => {
        const state = {
          file: {
            uploadedFile: mockFile,
            uploadLoading: false,
            uploadProgress: 100,
          },
        };

        const loading = selectUploadLoading(state);

        expect(loading).toBe(false);
      });
    });

    describe('selectUploadProgress', () => {
      it('returns 0 for initial state', () => {
        const state = { file: initialState };

        const progress = selectUploadProgress(state);

        expect(progress).toBe(0);
      });

      it('returns current progress value', () => {
        const state = {
          file: {
            uploadedFile: null,
            uploadLoading: true,
            uploadProgress: 75,
          },
        };

        const progress = selectUploadProgress(state);

        expect(progress).toBe(75);
      });

      it('returns 100 after upload completes', () => {
        const state = {
          file: {
            uploadedFile: mockFile,
            uploadLoading: false,
            uploadProgress: 100,
          },
        };

        const progress = selectUploadProgress(state);

        expect(progress).toBe(100);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete upload flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectUploadedFile({ file: state })).toBe(null);
      expect(selectUploadLoading({ file: state })).toBe(false);
      expect(selectUploadProgress({ file: state })).toBe(0);

      // Step 1: Start upload
      state = fileReducer(state, setUploadLoading(true));
      expect(selectUploadLoading({ file: state })).toBe(true);

      // Step 2: Update progress
      state = fileReducer(state, setUploadProgress(25));
      expect(selectUploadProgress({ file: state })).toBe(25);

      state = fileReducer(state, setUploadProgress(50));
      expect(selectUploadProgress({ file: state })).toBe(50);

      state = fileReducer(state, setUploadProgress(75));
      expect(selectUploadProgress({ file: state })).toBe(75);

      // Step 3: Upload success
      state = fileReducer(state, setUploadSuccess(mockFile));
      expect(selectUploadedFile({ file: state })).toEqual(mockFile);
      expect(selectUploadLoading({ file: state })).toBe(false);
      expect(selectUploadProgress({ file: state })).toBe(100);
    });

    it('handles upload cancellation flow', () => {
      // Start upload
      let state = fileReducer(initialState, setUploadLoading(true));
      state = fileReducer(state, setUploadProgress(50));

      expect(selectUploadLoading({ file: state })).toBe(true);
      expect(selectUploadProgress({ file: state })).toBe(50);

      // Cancel - reset state
      state = fileReducer(state, resetFileState());
      expect(selectUploadLoading({ file: state })).toBe(false);
      expect(selectUploadProgress({ file: state })).toBe(0);
    });

    it('handles sequential uploads', () => {
      // First upload
      let state = fileReducer(initialState, setUploadLoading(true));
      state = fileReducer(state, setUploadProgress(100));
      state = fileReducer(state, setUploadSuccess(mockFile));

      expect(selectUploadedFile({ file: state })).toEqual(mockFile);

      // Second upload - reset first
      state = fileReducer(state, resetFileState());
      expect(selectUploadedFile({ file: state })).toBe(null);

      // Start second upload
      const newFile: FileType = {
        id: 'file-2',
        name: 'new-file.jpg',
        url: 'https://example.com/new-file.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        createdAt: '2024-01-02T00:00:00Z',
      };

      state = fileReducer(state, setUploadLoading(true));
      state = fileReducer(state, setUploadProgress(100));
      state = fileReducer(state, setUploadSuccess(newFile));

      expect(selectUploadedFile({ file: state })).toEqual(newFile);
    });

    it('handles replace file flow', () => {
      // Upload first file
      let state = fileReducer(initialState, setUploadSuccess(mockFile));
      expect(selectUploadedFile({ file: state })).toEqual(mockFile);

      // Clear current file
      state = fileReducer(state, clearUploadedFile());
      expect(selectUploadedFile({ file: state })).toBe(null);

      // Upload new file
      const newFile: FileType = {
        id: 'file-2',
        name: 'replacement.jpg',
        url: 'https://example.com/replacement.jpg',
        mimeType: 'image/jpeg',
        size: 3072000,
        createdAt: '2024-01-03T00:00:00Z',
      };

      state = fileReducer(state, setUploadLoading(true));
      state = fileReducer(state, setUploadSuccess(newFile));

      expect(selectUploadedFile({ file: state })).toEqual(newFile);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = fileReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = fileReducer(state, setUploadLoading(true));
      expect(state.uploadLoading).toBe(true);

      state = fileReducer(state, setUploadLoading(false));
      expect(state.uploadLoading).toBe(false);

      state = fileReducer(state, setUploadLoading(true));
      expect(state.uploadLoading).toBe(true);
    });

    it('handles progress updates beyond 100', () => {
      const state = fileReducer(initialState, setUploadProgress(150));

      expect(state.uploadProgress).toBe(150);
    });

    it('handles negative progress values', () => {
      const state = fileReducer(initialState, setUploadProgress(-10));

      expect(state.uploadProgress).toBe(-10);
    });

    it('preserves file through loading state changes', () => {
      let state = fileReducer(initialState, setUploadSuccess(mockFile));
      const originalFile = state.uploadedFile;

      state = fileReducer(state, setUploadLoading(true));
      expect(state.uploadedFile).toEqual(originalFile);

      state = fileReducer(state, setUploadLoading(false));
      expect(state.uploadedFile).toEqual(originalFile);
    });

    it('preserves file through progress updates', () => {
      let state = fileReducer(initialState, setUploadSuccess(mockFile));
      const originalFile = state.uploadedFile;

      state = fileReducer(state, setUploadProgress(50));
      expect(state.uploadedFile).toEqual(originalFile);

      state = fileReducer(state, setUploadProgress(75));
      expect(state.uploadedFile).toEqual(originalFile);
    });
  });
});
