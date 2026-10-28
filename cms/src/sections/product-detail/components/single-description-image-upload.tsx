import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { selectUploadLoading, uploadFileRequest } from 'src/redux/store/fileSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';

interface SingleDescriptionImageUploadProps {
  imageUrl?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label: string;
  helperText?: string;
  dimensionHint?: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function SingleDescriptionImageUpload({
  imageUrl,
  onChange,
  disabled = false,
  label,
  helperText,
  dimensionHint,
}: SingleDescriptionImageUploadProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const globalUploading = useAppSelector(selectUploadLoading);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const uploading = Boolean(previewUrl);
  const isDisabled = disabled || globalUploading || uploading;

  const handleUpload = useCallback(
    (file: File) => {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            URL.revokeObjectURL(preview);
            setPreviewUrl(undefined);
            onChange(uploadedFile.path);
          },
          onError: () => {
            URL.revokeObjectURL(preview);
            setPreviewUrl(undefined);
          },
        })
      );
    },
    [dispatch, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
    disabled: isDisabled,
    onDrop: (files) => files[0] && handleUpload(files[0]),
  });

  const displayUrl = previewUrl || imageUrl;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {dimensionHint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {dimensionHint}
        </Typography>
      )}
      {displayUrl ? (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <Box
            component="img"
            src={displayUrl}
            alt={label}
            sx={{ display: 'block', width: '100%', borderRadius: 1, opacity: uploading ? 0.5 : 1 }}
          />
          {uploading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          {!isDisabled && (
            <IconButton
              aria-label={t('delete')}
              onClick={() => onChange('')}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {isDragActive ? t('dropImageHere') : t('dragDropOrClick')}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {helperText || t('imageUploadRequirements')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
