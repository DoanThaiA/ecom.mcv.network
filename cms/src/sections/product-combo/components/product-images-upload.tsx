import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { selectUploadLoading, uploadFileRequest } from 'src/redux/store/fileSlice';
import type { ProductImages } from 'src/types/gen/shared/shared/products/product';

// ----------------------------------------------------------------------

interface ImageItem {
  url: string;
  isUploading?: boolean;
}

interface ProductImagesUploadProps {
  images?: ProductImages;
  onChange?: (images: ProductImages) => void;
  disabled?: boolean;
}

export function ProductImagesUpload({
  images,
  onChange,
  disabled = false,
}: ProductImagesUploadProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isUploading = useAppSelector(selectUploadLoading);
  const [imageList, setImageList] = useState<ImageItem[]>([]);

  // Sync with external images prop
  useEffect(() => {
    if (images) {
      const items: ImageItem[] = [];

      if (images.avatar) {
        items.push({ url: images.avatar });
      }

      images.others?.forEach((url) => {
        items.push({ url });
      });

      setImageList(items);
    }
  }, [images]);

  const handleUploadFile = useCallback(
    (file: File) => {
      // Create temporary preview
      const previewUrl = URL.createObjectURL(file);
      const tempItem: ImageItem = { url: previewUrl, isUploading: true };

      setImageList((prev) => {
        const newList = [...prev, tempItem];
        return newList;
      });

      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            // Replace preview with actual URL
            setImageList((prev) => {
              const newList = prev.map((item) =>
                item.url === previewUrl ? { url: uploadedFile.path, isUploading: false } : item
              );

              // Callback to parent with updated URLs
              if (onChange) {
                const newImages: ProductImages = {
                  avatar: newList[0]?.url,
                  others: newList.slice(1).map((item) => item.url),
                };
                onChange(newImages);
              }

              // Revoke preview URL
              URL.revokeObjectURL(previewUrl);

              return newList;
            });
          },
          onError: () => {
            // Remove failed image from list
            setImageList((prev) => {
              const newList = prev.filter((item) => item.url !== previewUrl);

              // Callback to parent with updated URLs
              if (onChange) {
                const newImages: ProductImages = {
                  avatar: newList[0]?.url,
                  others: newList.slice(1).map((item) => item.url),
                };
                onChange(newImages);
              }

              // Revoke preview URL
              URL.revokeObjectURL(previewUrl);

              return newList;
            });
          },
        })
      );
    },
    [dispatch, onChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        handleUploadFile(file);
      });
    },
    [handleUploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    disabled: disabled || isUploading,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const removedItem = imageList[index];

    // Revoke blob URL if it's a preview
    if (removedItem?.url.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.url);
    }

    const newList = imageList.filter((_, i) => i !== index);
    setImageList(newList);

    // Callback to parent
    if (onChange) {
      const newImages: ProductImages = {
        avatar: newList[0]?.url,
        others: newList.slice(1).map((item) => item.url),
      };
      onChange(newImages);
    }
  };

  // Clean up preview URLs on unmount
  useEffect(
    () => () => {
      imageList.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    },
    [imageList]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.primary' }}>
        {`${t('productImage')} *`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2.25 },
          flexWrap: 'wrap',
        }}
      >
        {/* Image Preview Boxes */}
        {imageList.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              bgcolor: 'grey.400',
              borderRadius: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transition: 'all 0.2s',
            }}
          >
            <Box
              component="img"
              src={item.url}
              alt={`Preview ${index + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: item.isUploading ? 0.5 : 1,
              }}
            />

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

            {/* Close button - hide while uploading */}
            {!item.isUploading && (
              <Box
                onClick={() => removeFile(index)}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0, 0, 0, 0.48)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18, color: 'common.white' }} />
              </Box>
            )}
          </Box>
        ))}

        {/* Add Image Box */}
        <Box
          {...getRootProps()}
          sx={{
            width: { xs: 100, sm: 120 },
            height: { xs: 100, sm: 120 },
            border: '1.5px dashed',
            borderColor: isDragActive ? 'primary.dark' : 'primary.main',
            borderRadius: 1.25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
            opacity: disabled || isUploading ? 0.6 : 1,
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: disabled || isUploading ? 'background.paper' : 'action.hover',
              borderColor: disabled || isUploading ? 'primary.main' : 'primary.dark',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.primary',
              fontSize: { xs: 12, sm: 14 },
              mt: 0.5,
              textAlign: 'center',
            }}
          >
            {t('selectImageVideo')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
