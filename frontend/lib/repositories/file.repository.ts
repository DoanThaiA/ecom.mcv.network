import axios from 'axios';
import axiosInstance from '@/lib/axios';
import type {
  File as FileType,
  FileUpload,
  FileResponse,
  FileResponseWithUploadUrl,
} from '@/types/gen/shared/shared/files/file';

/**
 * File Repository
 * Handles all file-related API calls
 */
class FileRepository {
  /**
   * Upload file using multipart/form-data
   */
  uploadFile = async (file: File): Promise<FileResponse> => {
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const formData = new FormData();
    formData.append('file', file);

    // Don't set Content-Type manually - let axios set it with the correct boundary
    const response = await axiosInstance.post<FileResponse>(
      '/files/upload',
      formData
    );

    console.log('Upload response:', response.data);
    return response.data;
  };

  /**
   * Get presigned URL for upload
   */
  getPresignedUploadUrl = async (
    request: FileUpload
  ): Promise<FileResponseWithUploadUrl> => {

    const response = await axiosInstance.post<FileResponseWithUploadUrl>(
      '/files/upload',
      {
        fileName: request.fileName,
        fileSize: request.fileSize,
      }
    );

    return response.data;
  };

  /**
   * Upload file directly to S3 using presigned URL
   */
  uploadToPresignedUrl = async (
    presignedUrl: string,
    file: File
  ): Promise<void> => {
   

    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

  };

  /**
   * Complete upload flow for presigned URL:
   * 1. Get presigned URL from API
   * 2. Upload file directly to S3
   * 3. Return the file info
   */
  uploadWithPresignedUrl = async (file: File): Promise<FileType | undefined> => {

    // Step 1: Get presigned URL
    const presignedResponse = await this.getPresignedUploadUrl({
      fileName: file.name,
      fileSize: file.size,
    });

    // Step 2: Upload to S3
    await this.uploadToPresignedUrl(presignedResponse.uploadSignedUrl, file);

    // Step 3: Return file info
    return presignedResponse.file;
  };
}

export const fileRepository = new FileRepository();
