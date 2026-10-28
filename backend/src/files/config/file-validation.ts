import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

/**
 * Allowed media file extensions for upload
 */
export const ALLOWED_FILE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'mp4',
  'webm',
  'mov',
] as const;

/**
 * Regex pattern for validating file extensions
 */
export const ALLOWED_FILE_EXTENSIONS_REGEX = new RegExp(
  `\\.(${ALLOWED_FILE_EXTENSIONS.join('|')})$`,
  'i',
);

/**
 * Validates if a filename has an allowed extension
 * @param filename - The filename to validate
 * @returns true if the extension is allowed, false otherwise
 */
export function isAllowedFileExtension(filename: string): boolean {
  return ALLOWED_FILE_EXTENSIONS_REGEX.test(filename);
}

/**
 * Multer file filter function that validates file extensions
 * @param request - Express request object
 * @param file - Multer file object
 * @param callback - Multer callback function
 */
export function createFileFilter() {
  return (
    request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!isAllowedFileExtension(file.originalname)) {
      return callback(
        new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'cantUploadFileType',
          },
        }),
        false,
      );
    }

    callback(null, true);
  };
}
