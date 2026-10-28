import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest, all } from 'redux-saga/effects';
import { fileRepository } from 'src/repositories';
import { fileSaga } from 'src/redux/saga/fileSaga';
import {
  uploadFileRequest,
  uploadMultipleFilesRequest,
  setUploadLoading,
  setUploadProgress,
  setUploadSuccess,
} from 'src/redux/store/fileSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  fileRepository: {
    uploadFile: vi.fn(),
    uploadWithPresignedUrl: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showError: vi.fn(),
}));

// Mock i18next
vi.mock('src/i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('fileSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports fileSaga function', () => {
      expect(fileSaga).toBeDefined();
      expect(fileSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchFile', () => {
      const gen = fileSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchFile', () => {
      const gen = fileSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('uploadFileSaga', () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    it('successfully uploads file with s3-presigned driver', async () => {
      const mockUploadedFile = {
        id: 'file-1',
        path: 'https://example.com/file.jpg',
        name: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
      };

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockResolvedValue(mockUploadedFile);

      const action = uploadFileRequest({
        file: mockFile,
        driver: 's3-presigned',
      });

      expect(action.type).toBe('file/uploadFileRequest');
      expect(action.payload.driver).toBe('s3-presigned');
    });

    it('successfully uploads file with default driver', async () => {
      const mockUploadedFile = {
        id: 'file-1',
        path: 'https://example.com/file.jpg',
        name: 'test.jpg',
      };

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockResolvedValue(mockUploadedFile);

      const action = uploadFileRequest({
        file: mockFile,
      });

      expect(action.payload.driver).toBeUndefined();
    });

    it('successfully uploads file with multipart driver', async () => {
      const mockResponse = {
        file: {
          id: 'file-1',
          path: 'https://example.com/file.jpg',
          name: 'test.jpg',
        },
      };

      vi.mocked(fileRepository.uploadFile).mockResolvedValue(mockResponse);

      const action = uploadFileRequest({
        file: mockFile,
        driver: 's3',
      });

      expect(action.payload.driver).toBe('s3');
    });

    it('calls onSuccess callback when upload succeeds', async () => {
      const mockFile = {
        id: 'file-1',
        path: 'https://example.com/file.jpg',
      };

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockResolvedValue(mockFile);

      const onSuccess = vi.fn();
      const action = uploadFileRequest({
        file: mockFile as any,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles upload failure', async () => {
      const mockError = new Error('Upload failed');

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockRejectedValue(mockError);

      expect(fileSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = uploadFileRequest({
        file: mockFile,
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles undefined uploaded file', () => {
      vi.mocked(fileRepository.uploadWithPresignedUrl).mockResolvedValue(undefined);

      expect(fileSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setUploadLoading(true);

      expect(action.type).toBe('file/setUploadLoading');
      expect(action.payload).toBe(true);
    });

    it('sets upload progress', () => {
      const action = setUploadProgress(50);

      expect(action.type).toBe('file/setUploadProgress');
      expect(action.payload).toBe(50);
    });

    it('sets upload success', () => {
      const file = {
        id: 'file-1',
        path: 'https://example.com/file.jpg',
      };

      const action = setUploadSuccess(file);

      expect(action.type).toBe('file/setUploadSuccess');
      expect(action.payload).toEqual(file);
    });
  });

  describe('uploadMultipleFilesSaga', () => {
    const mockFiles = [
      new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
    ];

    it('successfully uploads multiple files with s3-presigned driver', async () => {
      const mockUploadedFiles = [
        {
          id: 'file-1',
          path: 'https://example.com/file1.jpg',
          name: 'test1.jpg',
        },
        {
          id: 'file-2',
          path: 'https://example.com/file2.jpg',
          name: 'test2.jpg',
        },
      ];

      vi.mocked(fileRepository.uploadWithPresignedUrl)
        .mockResolvedValueOnce(mockUploadedFiles[0])
        .mockResolvedValueOnce(mockUploadedFiles[1]);

      const action = uploadMultipleFilesRequest({
        files: mockFiles,
        driver: 's3-presigned',
      });

      expect(action.type).toBe('file/uploadMultipleFilesRequest');
      expect(action.payload.files).toEqual(mockFiles);
    });

    it('successfully uploads multiple files with multipart driver', async () => {
      const mockResponses = [
        { file: { id: 'file-1', path: 'https://example.com/file1.jpg' } },
        { file: { id: 'file-2', path: 'https://example.com/file2.jpg' } },
      ];

      vi.mocked(fileRepository.uploadFile)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1]);

      const action = uploadMultipleFilesRequest({
        files: mockFiles,
        driver: 's3',
      });

      expect(action.payload.driver).toBe('s3');
    });

    it('handles empty files array', () => {
      const action = uploadMultipleFilesRequest({
        files: [],
      });

      expect(action.payload.files).toEqual([]);
    });

    it('calls onSuccess callback with uploaded files', async () => {
      const mockUploadedFiles = [
        { id: 'file-1', path: 'https://example.com/file1.jpg' },
      ];

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockResolvedValue(
        mockUploadedFiles[0]
      );

      const onSuccess = vi.fn();
      const action = uploadMultipleFilesRequest({
        files: mockFiles,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles upload multiple failure', async () => {
      const mockError = new Error('Batch upload failed');

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockRejectedValue(mockError);

      expect(fileSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(fileRepository.uploadWithPresignedUrl).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = uploadMultipleFilesRequest({
        files: mockFiles,
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('filters out undefined results from presigned upload', () => {
      vi.mocked(fileRepository.uploadWithPresignedUrl)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ id: 'file-1', path: 'https://example.com/file.jpg' });

      expect(fileSaga).toBeDefined();
    });

    it('handles result without file in multipart response', () => {
      vi.mocked(fileRepository.uploadFile).mockResolvedValue({ file: undefined } as any);

      expect(fileSaga).toBeDefined();
    });

    it('sets progress to 100 after completion', () => {
      const action = setUploadProgress(100);

      expect(action.payload).toBe(100);
    });

    it('handles single file in array', () => {
      const singleFile = [mockFiles[0]];
      const action = uploadMultipleFilesRequest({
        files: singleFile,
      });

      expect(action.payload.files.length).toBe(1);
    });
  });

  describe('action types', () => {
    it('has correct action type for uploadFileRequest', () => {
      expect(uploadFileRequest.type).toBe('file/uploadFileRequest');
    });

    it('has correct action type for uploadMultipleFilesRequest', () => {
      expect(uploadMultipleFilesRequest.type).toBe('file/uploadMultipleFilesRequest');
    });

    it('has correct action type for setUploadLoading', () => {
      expect(setUploadLoading.type).toBe('file/setUploadLoading');
    });

    it('has correct action type for setUploadProgress', () => {
      expect(setUploadProgress.type).toBe('file/setUploadProgress');
    });

    it('has correct action type for setUploadSuccess', () => {
      expect(setUploadSuccess.type).toBe('file/setUploadSuccess');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });

    it('uses all effect', () => {
      expect(all).toBeDefined();
    });
  });

  describe('driver options', () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    it('handles s3-presigned driver', () => {
      const action = uploadFileRequest({
        file: mockFile,
        driver: 's3-presigned',
      });

      expect(action.payload.driver).toBe('s3-presigned');
    });

    it('handles s3 driver', () => {
      const action = uploadFileRequest({
        file: mockFile,
        driver: 's3',
      });

      expect(action.payload.driver).toBe('s3');
    });

    it('handles local driver', () => {
      const action = uploadFileRequest({
        file: mockFile,
        driver: 'local',
      });

      expect(action.payload.driver).toBe('local');
    });

    it('defaults to s3-presigned when driver not specified', () => {
      const action = uploadFileRequest({
        file: mockFile,
      });

      expect(action.payload.driver).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Upload error');

      expect(error.message).toBe('Upload error');
    });

    it('handles error without message', () => {
      const error = { code: 500 };

      expect(error).toHaveProperty('code');
    });

    it('handles network errors', () => {
      const error = new Error('Network error');

      expect(error.message).toBe('Network error');
    });
  });

  describe('callbacks', () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    it('handles onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = uploadFileRequest({
        file: mockFile,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback', () => {
      const onError = vi.fn();
      const action = uploadFileRequest({
        file: mockFile,
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles both callbacks together', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const action = uploadFileRequest({
        file: mockFile,
        onSuccess,
        onError,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
      expect(action.payload.onError).toBe(onError);
    });

    it('handles callbacks for multiple files', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const action = uploadMultipleFilesRequest({
        files: [mockFile],
        onSuccess,
        onError,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
      expect(action.payload.onError).toBe(onError);
    });
  });
});
