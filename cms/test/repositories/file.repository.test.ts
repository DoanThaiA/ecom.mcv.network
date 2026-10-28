import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileRepository } from 'src/repositories/file.repository';
import axiosInstance from 'src/utils/axios';
import axios from 'axios';

vi.mock('src/utils/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('fileRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports fileRepository instance', () => {
    expect(fileRepository).toBeDefined();
    expect(fileRepository).toHaveProperty('uploadFile');
    expect(fileRepository).toHaveProperty('getPresignedUploadUrl');
    expect(fileRepository).toHaveProperty('uploadToPresignedUrl');
    expect(fileRepository).toHaveProperty('uploadWithPresignedUrl');
  });

  describe('uploadFile', () => {
    it('uploads file with multipart/form-data', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        data: {
          file: {
            id: 'file123',
            fileName: 'test.txt',
            fileSize: 7,
            url: 'https://example.com/test.txt',
          },
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await fileRepository.uploadFile(mockFile);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/files/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('creates FormData with file', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = { data: { file: {} } };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await fileRepository.uploadFile(mockFile);

      const callArgs = vi.mocked(axiosInstance.post).mock.calls[0];
      const formData = callArgs[1] as FormData;
      expect(formData).toBeInstanceOf(FormData);
    });

    it('returns FileResponse', async () => {
      const mockFile = new File(['content'], 'test.txt');
      const mockResponse = {
        data: {
          file: {
            id: 'file123',
            fileName: 'test.txt',
          },
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await fileRepository.uploadFile(mockFile);
      expect(result).toHaveProperty('file');
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('requests presigned URL with fileName and fileSize', async () => {
      const mockRequest = {
        fileName: 'test.jpg',
        fileSize: 1024,
      };
      const mockResponse = {
        data: {
          file: {
            id: 'file123',
            fileName: 'test.jpg',
            fileSize: 1024,
          },
          uploadSignedUrl: 'https://s3.amazonaws.com/presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await fileRepository.getPresignedUploadUrl(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith('/files/upload', {
        fileName: 'test.jpg',
        fileSize: 1024,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('returns FileResponseWithUploadUrl', async () => {
      const mockRequest = {
        fileName: 'test.jpg',
        fileSize: 1024,
      };
      const mockResponse = {
        data: {
          file: { id: 'file123' },
          uploadSignedUrl: 'https://presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await fileRepository.getPresignedUploadUrl(mockRequest);
      expect(result).toHaveProperty('file');
      expect(result).toHaveProperty('uploadSignedUrl');
    });
  });

  describe('uploadToPresignedUrl', () => {
    it('uploads file to presigned URL with PUT', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const presignedUrl = 'https://s3.amazonaws.com/presigned-url';

      vi.mocked(axios.put).mockResolvedValue({});

      await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);

      expect(axios.put).toHaveBeenCalledWith(
        presignedUrl,
        mockFile,
        expect.objectContaining({
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      );
    });

    it('uses file.type for Content-Type header', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const presignedUrl = 'https://s3.amazonaws.com/presigned-url';

      vi.mocked(axios.put).mockResolvedValue({});

      await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);

      expect(axios.put).toHaveBeenCalledWith(
        presignedUrl,
        mockFile,
        expect.objectContaining({
          headers: {
            'Content-Type': 'image/jpeg',
          },
        })
      );
    });

    it('returns void on success', async () => {
      const mockFile = new File(['content'], 'test.txt');
      const presignedUrl = 'https://presigned-url';

      vi.mocked(axios.put).mockResolvedValue({});

      const result = await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);
      expect(result).toBeUndefined();
    });
  });

  describe('uploadWithPresignedUrl', () => {
    it('completes full presigned upload flow', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockPresignedResponse = {
        data: {
          file: {
            id: 'file123',
            fileName: 'test.jpg',
            fileSize: 7,
            url: 'https://cdn.example.com/test.jpg',
          },
          uploadSignedUrl: 'https://s3.amazonaws.com/presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockPresignedResponse);
      vi.mocked(axios.put).mockResolvedValue({});

      const result = await fileRepository.uploadWithPresignedUrl(mockFile);

      // Step 1: Get presigned URL
      expect(axiosInstance.post).toHaveBeenCalledWith('/files/upload', {
        fileName: 'test.jpg',
        fileSize: 7,
      });

      // Step 2: Upload to S3
      expect(axios.put).toHaveBeenCalledWith(
        'https://s3.amazonaws.com/presigned-url',
        mockFile,
        expect.any(Object)
      );

      // Step 3: Return file info
      expect(result).toEqual(mockPresignedResponse.data.file);
    });

    it('calls getPresignedUploadUrl first', async () => {
      const mockFile = new File(['content'], 'test.jpg');
      const mockResponse = {
        data: {
          file: { id: 'file123' },
          uploadSignedUrl: 'https://presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);
      vi.mocked(axios.put).mockResolvedValue({});

      await fileRepository.uploadWithPresignedUrl(mockFile);

      expect(axiosInstance.post).toHaveBeenCalledBefore(axios.put as any);
    });

    it('calls uploadToPresignedUrl second', async () => {
      const mockFile = new File(['content'], 'test.jpg');
      const mockResponse = {
        data: {
          file: { id: 'file123' },
          uploadSignedUrl: 'https://presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);
      vi.mocked(axios.put).mockResolvedValue({});

      await fileRepository.uploadWithPresignedUrl(mockFile);

      expect(axios.put).toHaveBeenCalled();
    });

    it('returns file info from presigned response', async () => {
      const mockFile = new File(['content'], 'test.jpg');
      const mockFileInfo = {
        id: 'file123',
        fileName: 'test.jpg',
        fileSize: 7,
        url: 'https://cdn.example.com/test.jpg',
      };
      const mockResponse = {
        data: {
          file: mockFileInfo,
          uploadSignedUrl: 'https://presigned-url',
        },
      };

      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);
      vi.mocked(axios.put).mockResolvedValue({});

      const result = await fileRepository.uploadWithPresignedUrl(mockFile);

      expect(result).toEqual(mockFileInfo);
    });
  });
});
