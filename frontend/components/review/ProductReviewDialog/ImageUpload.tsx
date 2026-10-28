'use client';

import { useRef } from 'react';
import { Box, Flex, Text, IconButton } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMultipleFilesRequest } from '@/lib/store/slices/fileSlice';
import { showErrorToast } from '@/lib/helpers/toastHelper';
import type { File as FileType } from '@/types/gen/shared/shared/files/file';
import type { RootState } from '@/lib/store';
import { REVIEW_CONSTANTS } from '@/lib/constants/review';
import { validateImages } from '@/lib/utils/reviewValidation';

interface ImageUploadProps {
  images: FileType[];
  onImagesChange: (_images: FileType[]) => void;
}

export function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const t = useTranslations('reviews');
  const dispatch = useDispatch();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const isUploading = useSelector((state: RootState) => state.file.uploadLoading);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validationError = validateImages(files, images.length);
    if (validationError) {
      showErrorToast(t(validationError));
      return;
    }

    // Upload files
    dispatch(
      uploadMultipleFilesRequest({
        files,
        onSuccess: (uploadedFiles: FileType[]) => {
          onImagesChange([...images, ...uploadedFiles]);
        },
        onError: () => {
          showErrorToast(t('submitError'));
        },
      })
    );

    // Reset input
    if (e.target === imageInputRef.current) {
      imageInputRef.current.value = '';
    } else if (e.target === videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoButtonClick = () => {
    videoInputRef.current?.click();
  };

  return (
    <Box>
      <Text size="2" weight="medium" className="mb-3 block">
        {t('mediaTitle')}
      </Text>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept=".mp4,.mov"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image/video preview grid */}
      {images.length > 0 && (
        <Flex gap="2" wrap="wrap" className="mb-3">
          {images.map((image, index) => (
            <Box
              key={image.id || index}
              className="relative w-[60px] h-[60px] rounded-[4px] border border-gray-200"
            >
              <Image
                src={image.path}
                alt={`Review media ${index + 1}`}
                fill
                className="object-cover rounded-[4px]"
              />
              <IconButton
                size="1"
                variant="solid"
                color="red"
                className="absolute -top-2 -right-2 rounded-full cursor-pointer"
                onClick={() => handleRemoveImage(index)}
              >
                <Cross2Icon width={12} height={12} />
              </IconButton>
            </Box>
          ))}
        </Flex>
      )}

      {/* Upload buttons */}
      {images.length < REVIEW_CONSTANTS.MAX_IMAGES && (
        <Flex gap="3" className="w-full">
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={isUploading}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Box className="w-10 h-10 flex items-center justify-center">
                  <Box className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                </Box>
                <Text size="1" className="text-gray-700">
                  {t('uploading')}
                </Text>
              </>
            ) : (
              <>
                <Box className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                  <Image
                    src="/assets/svg/product/camera_photo.svg"
                    alt="Camera"
                    width={24}
                    height={24}
                  />
                </Box>
                <Text size="1" className="text-gray-700">
                  {t('addImage')}
                </Text>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleVideoButtonClick}
            disabled={isUploading}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Box className="w-10 h-10 flex items-center justify-center">
                  <Box className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                </Box>
                <Text size="1" className="text-gray-700">
                  {t('uploading')}
                </Text>
              </>
            ) : (
              <>
                <Box className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                  <Image
                    src="/assets/svg/product/camera_video.svg"
                    alt="Video"
                    width={20}
                    height={14}
                  />
                </Box>
                <Text size="1" className="text-gray-700">
                  {t('addVideo')}
                </Text>
              </>
            )}
          </button>
        </Flex>
      )}
    </Box>
  );
}
