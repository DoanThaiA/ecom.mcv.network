import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { uploadFileRequest, selectUploadLoading } from 'src/redux/store/fileSlice';

// ----------------------------------------------------------------------

interface BannerImageUploadProps {
  imageUrl?: string;
  onChange?: (url: string) => void;
  disabled?: boolean;
}

export function BannerImageUpload({ imageUrl, onChange, disabled }: BannerImageUploadProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isUploading = useAppSelector(selectUploadLoading);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = useCallback(
    (file: File) => {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload file
      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            URL.revokeObjectURL(preview);
            setPreviewUrl(null);
            onChange?.(uploadedFile.path);
          },
          onError: () => {
            URL.revokeObjectURL(preview);
            setPreviewUrl(null);
          },
        })
      );
    },
    [dispatch, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isUploading,
    onDrop: (files) => files[0] && handleUpload(files[0]),
  });

  const handleRemove = () => {
    onChange?.('');
  };

  const displayUrl = previewUrl || imageUrl;

  return (
    <Box>
      {displayUrl ? (
        // Preview
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <img src={displayUrl} alt="Banner preview" style={{ width: '100%', borderRadius: 8 }} />
          {isUploading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.5)',
                borderRadius: 2,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {!isUploading && !disabled && (
            <IconButton
              onClick={handleRemove}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      ) : (
        // Dropzone
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {isDragActive ? t('dropImageHere') : t('dragDropOrClick')}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            PNG, JPG, GIF, WEBP (Max 10MB)
          </Typography>
        </Box>
      )}
    </Box>
  );
}
