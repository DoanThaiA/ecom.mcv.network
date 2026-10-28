import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import { createWriteStream, createReadStream, promises as fs } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import * as os from 'os';
import * as path from 'path';
import { AllConfigType } from '@app/config/config.type';
import { FileDriver } from '@app/files/config/file-config.type';

export interface ThumbnailJobParams {
  reviewId: string;
  productIndex: number;
  mediaIndex: number;
  videoUrl: string;
  videoKey: string;
}

/**
 * Service for generating video thumbnails
 * Downloads video from S3, extracts a frame using ffmpeg, uploads thumbnail back to S3
 */
@Injectable()
export class ThumbnailService {
  private readonly logger = new Logger(ThumbnailService.name);
  private readonly s3Client: S3Client | null;
  private readonly bucket: string;
  private readonly region: string;
  private readonly backendDomain: string;
  private readonly useS3: boolean;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const fileDriver = this.configService.get('file.driver', { infer: true });
    this.useS3 =
      fileDriver === FileDriver.S3 || fileDriver === FileDriver.S3_PRESIGNED;

    this.bucket =
      this.configService.get('file.awsDefaultS3Bucket', { infer: true }) ?? '';
    this.region =
      this.configService.get('file.awsS3Region', { infer: true }) ?? '';
    this.backendDomain =
      this.configService.get('app.backendDomain', { infer: true }) ?? '';

    const accessKeyId = this.configService.get('file.accessKeyId', {
      infer: true,
    });
    const secretAccessKey = this.configService.get('file.secretAccessKey', {
      infer: true,
    });

    if (accessKeyId && secretAccessKey && this.region) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('S3 client initialized successfully');
    } else {
      this.s3Client = null;
      this.logger.warn(
        'S3 client NOT initialized - missing credentials or region',
      );
    }
  }

  /**
   * Generate thumbnail for a video file
   * @param videoKey - S3 key or local path of the video
   * @returns Thumbnail URL or null if generation failed
   */
  async generateThumbnail(videoKey: string): Promise<string | null> {
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const videoPath = path.join(tempDir, `video_${timestamp}.mp4`);
    const thumbnailPath = path.join(tempDir, `thumb_${timestamp}.jpg`);

    try {
      // 1. Download video to temp file
      await this.downloadFile(videoKey, videoPath);

      // 2. Extract frame using ffmpeg
      await this.extractFrame(videoPath, thumbnailPath);

      // 3. Upload thumbnail
      const thumbnailKey = this.getThumbnailKey(videoKey);
      await this.uploadThumbnail(thumbnailPath, thumbnailKey);

      // 4. Build and return full URL
      return this.buildUrl(thumbnailKey);
    } catch (error) {
      this.logger.error(
        `Failed to generate thumbnail for ${videoKey}: ${error.message}`,
        error.stack,
      );
      return null;
    } finally {
      // Cleanup temp files
      await this.cleanup([videoPath, thumbnailPath]);
    }
  }

  /**
   * Download file from storage to local path
   * @param key - S3 key or local file path
   * @param localPath - Local path to save the file
   */
  private async downloadFile(key: string, localPath: string): Promise<void> {
    if (this.useS3) {
      await this.downloadFromS3(key, localPath);
    } else {
      await this.downloadFromLocal(key, localPath);
    }
  }

  /**
   * Download file from S3
   */
  private async downloadFromS3(key: string, localPath: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    if (!response.Body) {
      throw new Error(`Empty response body for S3 key: ${key}`);
    }

    const writeStream = createWriteStream(localPath);
    await pipeline(response.Body as Readable, writeStream);

    this.logger.debug(`Downloaded ${key} to ${localPath}`);
  }

  /**
   * Download file from local storage
   */
  private async downloadFromLocal(
    key: string,
    localPath: string,
  ): Promise<void> {
    // For local storage, key is the relative path from backend root
    // e.g., /api/v1/files/abc123.mp4
    const sourcePath = path.join(process.cwd(), 'files', path.basename(key));
    await fs.copyFile(sourcePath, localPath);
    this.logger.debug(`Copied local file ${sourcePath} to ${localPath}`);
  }

  /**
   * Extract a frame from video using ffmpeg
   */
  private extractFrame(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Extract frame at 1 second (or 0.1s for very short videos)
      // Scale to max 480px width while maintaining aspect ratio
      const args = [
        '-i',
        videoPath,
        '-ss',
        '1', // Seek to 1 second
        '-vframes',
        '1', // Extract 1 frame
        '-vf',
        'scale=480:-1', // Scale to 480px width, auto height
        '-q:v',
        '2', // JPEG quality (2 = high quality)
        '-y', // Overwrite output
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          this.logger.debug(`Frame extracted to ${outputPath}`);
          resolve();
        } else {
          // If extraction at 1s fails (video too short), try at 0.1s
          this.extractFrameAtTime(videoPath, outputPath, '0.1')
            .then(resolve)
            .catch(() => {
              reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
            });
        }
      });

      ffmpeg.on('error', (err) => {
        reject(new Error(`ffmpeg spawn error: ${err.message}`));
      });
    });
  }

  /**
   * Extract frame at specific time
   */
  private extractFrameAtTime(
    videoPath: string,
    outputPath: string,
    time: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i',
        videoPath,
        '-ss',
        time,
        '-vframes',
        '1',
        '-vf',
        'scale=480:-1',
        '-q:v',
        '2',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          this.logger.debug(`Frame extracted at ${time}s to ${outputPath}`);
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(new Error(`ffmpeg spawn error: ${err.message}`));
      });
    });
  }

  /**
   * Upload thumbnail to storage
   * @param localPath - Local path of the thumbnail
   * @param key - S3 key or local file path
   */
  private async uploadThumbnail(localPath: string, key: string): Promise<void> {
    if (this.useS3) {
      await this.uploadToS3(localPath, key);
    } else {
      await this.uploadToLocal(localPath, key);
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(localPath: string, key: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    const fileContent = createReadStream(localPath);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: 'image/jpeg',
    });

    await this.s3Client.send(command);
    this.logger.debug(`Uploaded thumbnail to S3: ${key}`);
  }

  /**
   * Save file to local storage
   */
  private async uploadToLocal(localPath: string, key: string): Promise<void> {
    const destPath = path.join(process.cwd(), 'files', path.basename(key));
    await fs.copyFile(localPath, destPath);
    this.logger.debug(`Saved thumbnail locally: ${destPath}`);
  }

  /**
   * Generate thumbnail key from video key
   * e.g., "abc123.mp4" -> "abc123-thumb.jpg"
   */
  private getThumbnailKey(videoKey: string): string {
    const ext = path.extname(videoKey);
    const base = videoKey.slice(0, -ext.length);
    return `${base}-thumb.jpg`;
  }

  /**
   * Build full URL for a file key
   * @param key - S3 key or local file path
   */
  private buildUrl(key: string): string {
    if (this.useS3) {
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    return `${this.backendDomain}/api/v1/files/${path.basename(key)}`;
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
