import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fileRepository } from '@/lib/repositories/file.repository';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import type {
  FileResponse,
  FileResponseWithUploadUrl,
  File as FileType,
} from '@/types/gen/shared/shared/files/file';

// Mock axios and axiosInstance
vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('FileRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('uploadFile', () => {
    it('uploads file with FormData successfully', async () => {
      const mockFile = new File(['file content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const mockResponse: FileResponse = {
        file: {
          id: 'file-123',
          fileName: 'test.jpg',
          fileSize: 100,
          url: 'http://example.com/test.jpg',
        } as FileType,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await fileRepository.uploadFile(mockFile);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/files/upload',
        expect.any(FormData)
      );

      expect(result).toEqual(mockResponse);
    });

    it('logs file details before upload', async () => {
      const mockFile = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { file: {} } as FileResponse,
      });

      await fileRepository.uploadFile(mockFile);

      expect(console.log).toHaveBeenCalledWith(
        'Uploading file:',
        expect.objectContaining({
          name: 'document.pdf',
          type: 'application/pdf',
        })
      );
    });

    it('logs upload response', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockResponse: FileResponse = {
        file: { id: '1' } as FileType,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      await fileRepository.uploadFile(mockFile);

      expect(console.log).toHaveBeenCalledWith(
        'Upload response:',
        mockResponse
      );
    });

    it('propagates API errors', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Upload failed')
      );

      await expect(fileRepository.uploadFile(mockFile)).rejects.toThrow(
        'Upload failed'
      );
    });

    it('creates FormData with correct file', async () => {
      const mockFile = new File(['data'], 'image.png', { type: 'image/png' });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { file: {} } as FileResponse,
      });

      await fileRepository.uploadFile(mockFile);

      const formDataCall = vi.mocked(axiosInstance.post).mock.calls[0];
      expect(formDataCall[1]).toBeInstanceOf(FormData);
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('requests presigned URL successfully', async () => {
      const mockRequest = {
        fileName: 'test.jpg',
        fileSize: 1024,
      };

      const mockResponse: FileResponseWithUploadUrl = {
        file: {
          id: 'file-456',
          fileName: 'test.jpg',
          fileSize: 1024,
        } as FileType,
        uploadSignedUrl: 'https://s3.amazonaws.com/bucket/presigned-url',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await fileRepository.getPresignedUploadUrl(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith('/files/upload', {
        fileName: 'test.jpg',
        fileSize: 1024,
      });

      expect(result).toEqual(mockResponse);
      expect(result.uploadSignedUrl).toBe(
        'https://s3.amazonaws.com/bucket/presigned-url'
      );
    });

    it('handles large file sizes', async () => {
      const mockRequest = {
        fileName: 'large-video.mp4',
        fileSize: 1024 * 1024 * 100, // 100MB
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { file: {}, uploadSignedUrl: 'url' } as FileResponseWithUploadUrl,
      });

      await fileRepository.getPresignedUploadUrl(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/files/upload',
        expect.objectContaining({
          fileSize: 1024 * 1024 * 100,
        })
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Presigned URL generation failed')
      );

      await expect(
        fileRepository.getPresignedUploadUrl({
          fileName: 'test.txt',
          fileSize: 100,
        })
      ).rejects.toThrow('Presigned URL generation failed');
    });
  });

  describe('uploadToPresignedUrl', () => {
    it('uploads file to presigned URL successfully', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/upload-url';
      const mockFile = new File(['content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);

      expect(axios.put).toHaveBeenCalledWith(presignedUrl, mockFile, {
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
    });

    it('sets correct Content-Type header', async () => {
      const presignedUrl = 'https://example.com/upload';
      const mockFile = new File(['video'], 'video.mp4', { type: 'video/mp4' });

      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);

      expect(axios.put).toHaveBeenCalledWith(
        presignedUrl,
        mockFile,
        expect.objectContaining({
          headers: {
            'Content-Type': 'video/mp4',
          },
        })
      );
    });

    it('propagates upload errors', async () => {
      const presignedUrl = 'https://example.com/upload';
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      vi.mocked(axios.put).mockRejectedValueOnce(
        new Error('S3 upload failed')
      );

      await expect(
        fileRepository.uploadToPresignedUrl(presignedUrl, mockFile)
      ).rejects.toThrow('S3 upload failed');
    });

    it('handles files with no type', async () => {
      const presignedUrl = 'https://example.com/upload';
      const mockFile = new File(['data'], 'file-no-extension');

      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      await fileRepository.uploadToPresignedUrl(presignedUrl, mockFile);

      expect(axios.put).toHaveBeenCalledWith(
        presignedUrl,
        mockFile,
        expect.objectContaining({
          headers: {
            'Content-Type': '',
          },
        })
      );
    });
  });

  describe('uploadWithPresignedUrl', () => {
    it('completes full presigned URL upload flow', async () => {
      const mockFile = new File(['content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const mockPresignedResponse: FileResponseWithUploadUrl = {
        file: {
          id: 'file-789',
          fileName: 'test.jpg',
          fileSize: 100,
          url: 'http://example.com/test.jpg',
        } as FileType,
        uploadSignedUrl: 'https://s3.amazonaws.com/bucket/upload',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      const result = await fileRepository.uploadWithPresignedUrl(mockFile);

      // Verify step 1: Get presigned URL
      expect(axiosInstance.post).toHaveBeenCalledWith('/files/upload', {
        fileName: 'test.jpg',
        fileSize: mockFile.size,
      });

      // Verify step 2: Upload to S3
      expect(axios.put).toHaveBeenCalledWith(
        'https://s3.amazonaws.com/bucket/upload',
        mockFile,
        {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );

      // Verify step 3: Returns file info
      expect(result).toEqual(mockPresignedResponse.file);
    });

    it('propagates errors from getPresignedUploadUrl', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Failed to get presigned URL')
      );

      await expect(
        fileRepository.uploadWithPresignedUrl(mockFile)
      ).rejects.toThrow('Failed to get presigned URL');
    });

    it('propagates errors from uploadToPresignedUrl', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {
          file: {} as FileType,
          uploadSignedUrl: 'url',
        } as FileResponseWithUploadUrl,
      });
      vi.mocked(axios.put).mockRejectedValueOnce(
        new Error('S3 upload failed')
      );

      await expect(
        fileRepository.uploadWithPresignedUrl(mockFile)
      ).rejects.toThrow('S3 upload failed');
    });

    it('handles files with special characters in name', async () => {
      const mockFile = new File(['data'], 'file (copy) [1].txt', {
        type: 'text/plain',
      });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {
          file: { fileName: 'file (copy) [1].txt' } as FileType,
          uploadSignedUrl: 'url',
        } as FileResponseWithUploadUrl,
      });
      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      const result = await fileRepository.uploadWithPresignedUrl(mockFile);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/files/upload',
        expect.objectContaining({
          fileName: 'file (copy) [1].txt',
        })
      );

      expect(result).toBeDefined();
    });

    it('handles zero-size files', async () => {
      const mockFile = new File([''], 'empty.txt', { type: 'text/plain' });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {
          file: { fileSize: 0 } as FileType,
          uploadSignedUrl: 'url',
        } as FileResponseWithUploadUrl,
      });
      vi.mocked(axios.put).mockResolvedValueOnce({ data: {} });

      await fileRepository.uploadWithPresignedUrl(mockFile);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/files/upload',
        expect.objectContaining({
          fileSize: 0,
        })
      );
    });
  });
});
