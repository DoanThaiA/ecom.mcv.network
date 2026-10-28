import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'src/redux/store/store';
import { uploadFileRequest } from 'src/redux/store/fileSlice';

// ----------------------------------------------------------------------

interface MediaFile {
  id: string; // Temporary ID
  file: File;
  preview: string; // Object URL for preview
  url?: string; // URL after upload
  path?: string; // File path from upload response
  fileId?: string; // Backend file ID for mediaIds
  isUploading: boolean;
  type: 'image' | 'video';
}

interface ReviewMediaUploadProps {
  onMediaChange: (paths: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function ReviewMediaUpload({
  onMediaChange,
  maxFiles = 5,
  disabled = false,
}: ReviewMediaUploadProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Detect media type from file
  const getMediaType = (file: File): 'image' | 'video' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'image';
  };

  const handleUploadFile = useCallback(
    (file: File) => {
      // Check if max files reached
      if (mediaFiles.length >= maxFiles) {
        return;
      }

      // Create temporary ID and preview
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      const mediaType = getMediaType(file);

      const tempItem: MediaFile = {
        id: tempId,
        file,
        preview: previewUrl,
        isUploading: true,
        type: mediaType,
      };

      setMediaFiles((prev) => [...prev, tempItem]);

      // Upload file
      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            // Update with actual path and file ID
            setMediaFiles((prev) => {
              const newList = prev.map((item) =>
                item.id === tempId
                  ? {
                      ...item,
                      fileId: uploadedFile.id,
                      path: uploadedFile.path,
                      url: uploadedFile.path,
                      isUploading: false,
                    }
                  : item
              );

              // Notify parent with updated file IDs
              const fileIds = newList.filter((item) => item.fileId).map((item) => item.fileId!);
              onMediaChange(fileIds);

              return newList;
            });
          },
          onError: () => {
            // Remove failed upload
            setMediaFiles((prev) => {
              const newList = prev.filter((item) => item.id !== tempId);

              // Notify parent with remaining file IDs
              const fileIds = newList.filter((item) => item.fileId).map((item) => item.fileId!);
              onMediaChange(fileIds);

              // Revoke preview URL
              URL.revokeObjectURL(previewUrl);

              return newList;
            });
          },
        })
      );
    },
    [dispatch, onMediaChange, maxFiles, mediaFiles.length]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to max files
      const remainingSlots = maxFiles - mediaFiles.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      filesToUpload.forEach((file) => {
        handleUploadFile(file);
      });
    },
    [handleUploadFile, maxFiles, mediaFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    disabled: disabled || mediaFiles.length >= maxFiles,
    multiple: true,
    maxFiles,
  });

  const removeFile = (id: string) => {
    const removedItem = mediaFiles.find((item) => item.id === id);

    // Revoke blob URL if it's a preview
    if (removedItem?.preview) {
      URL.revokeObjectURL(removedItem.preview);
    }

    const newList = mediaFiles.filter((item) => item.id !== id);
    setMediaFiles(newList);

    // Notify parent with remaining file IDs
    const fileIds = newList.filter((item) => item.fileId).map((item) => item.fileId!);
    onMediaChange(fileIds);
  };

  // Clean up preview URLs on unmount
  useEffect(
    () => () => {
      mediaFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    },
    [mediaFiles]
  );

  const canAddMore = mediaFiles.length < maxFiles;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
        }}
      >
        {/* Media Preview Boxes */}
        {mediaFiles.map((item) => (
          <Box
            key={item.id}
            sx={{
              position: 'relative',
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              bgcolor: 'grey.400',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Image or Video Preview */}
            {item.type === 'image' ? (
              <Box
                component="img"
                src={item.preview}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: item.isUploading ? 0.5 : 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.800',
                }}
              >
                <Box
                  component="video"
                  src={item.preview}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: item.isUploading ? 0.5 : 1,
                  }}
                />
                <PlayCircleOutlineIcon
                  sx={{
                    position: 'absolute',
                    fontSize: 32,
                    color: 'common.white',
                    opacity: 0.8,
                  }}
                />
              </Box>
            )}

            {/* Loading overlay */}
            {item.isUploading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <CircularProgress size={24} sx={{ color: 'common.white' }} />
              </Box>
            )}

            {/* Close button */}
            {!item.isUploading && (
              <Box
                onClick={() => removeFile(item.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16, color: 'common.white' }} />
              </Box>
            )}
          </Box>
        ))}

        {/* Add Media Box */}
        {canAddMore && (
          <Box
            {...getRootProps()}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              border: '1.5px dashed',
              borderColor: isDragActive ? 'primary.dark' : 'divider',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: disabled ? 'background.paper' : 'action.hover',
                borderColor: disabled ? 'divider' : 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: 10,
                mt: 0.5,
                textAlign: 'center',
                px: 0.5,
              }}
            >
              {t('addMedia')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Helper text */}
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
        {t('uploadMediaHint')} ({mediaFiles.length}/{maxFiles})
      </Typography>
    </Box>
  );
}
