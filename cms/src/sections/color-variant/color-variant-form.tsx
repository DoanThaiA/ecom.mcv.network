import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  ColorVariantDisplayType,
  type CreateColorVariantRequest,
  type UpdateColorVariantRequest,
} from 'src/types/color-variant';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { uploadFileRequest, selectUploadLoading } from 'src/redux/store/fileSlice';
import { ColorVariantPreview } from './components/color-variant-preview';
import { ColorPickerMulti } from './components/color-picker-multi';
import { DisplayTypeSelect } from './components/display-type-select';
import {
  parseColorValue,
  joinColorValue,
  getDefaultColors,
  getMinColors,
} from './utils/color-utils';

// ----------------------------------------------------------------------

export interface ColorVariantFormData {
  name: string;
  displayType: ColorVariantDisplayType;
  colorValue: string;
  patternImage: string;
  order: number;
}

interface ColorVariantFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ColorVariantFormData>;
  onSubmit: (data: CreateColorVariantRequest | UpdateColorVariantRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ColorVariantForm({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}: ColorVariantFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isUploading = useAppSelector(selectUploadLoading);

  // Form state
  const [name, setName] = useState(initialData.name || '');
  const [displayType, setDisplayType] = useState<ColorVariantDisplayType>(
    initialData.displayType || ColorVariantDisplayType.SOLID
  );
  const [colors, setColors] = useState<string[]>(() =>
    parseColorValue(
      initialData.colorValue,
      initialData.displayType || ColorVariantDisplayType.SOLID
    )
  );
  const [patternImage, setPatternImage] = useState(initialData.patternImage || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [order, setOrder] = useState(initialData.order || 0);

  // Update colors when display type changes
  useEffect(() => {
    const minRequired = getMinColors(displayType);
    if (colors.length < minRequired) {
      const newColors = [...colors];
      while (newColors.length < minRequired) {
        newColors.push(newColors.length === 0 ? '#000000' : '#FFFFFF');
      }
      setColors(newColors);
    }
  }, [displayType, colors.length]);

  // Handle display type change
  const handleDisplayTypeChange = (newDisplayType: ColorVariantDisplayType) => {
    setDisplayType(newDisplayType);
    // Reset colors to default for new display type
    setColors(getDefaultColors(newDisplayType));
  };

  // File upload handling
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
            setPatternImage(uploadedFile.path);
          },
          onError: () => {
            URL.revokeObjectURL(preview);
            setPreviewUrl(null);
          },
        })
      );
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading || isUploading,
    onDrop: (files) => files[0] && handleUpload(files[0]),
  });

  const handleRemoveImage = () => {
    setPatternImage('');
  };

  const handleSubmit = () => {
    const colorValue = joinColorValue(colors, displayType);
    const submitData: CreateColorVariantRequest | UpdateColorVariantRequest = {
      name,
      displayType,
      display: {
        colorValue,
        patternImage: patternImage || undefined,
      },
      order,
    };
    onSubmit(submitData);
  };

  const isValid = name.trim().length > 0;
  const colorValue = joinColorValue(colors, displayType);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Form Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                id="color-variant-name"
                name="name"
                fullWidth
                label={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>

            {/* Order */}
            <Grid item xs={12} md={6}>
              <TextField
                id="color-variant-order"
                name="order"
                fullWidth
                label={t('order')}
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                disabled={loading}
              />
            </Grid>

            {/* Display Type */}
            <Grid item xs={12} md={6}>
              <DisplayTypeSelect
                value={displayType}
                onChange={handleDisplayTypeChange}
                disabled={loading}
              />
            </Grid>

            {/* Preview */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('preview')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ColorVariantPreview
                  displayType={displayType}
                  colorValue={colorValue}
                  patternImage={patternImage}
                  size={80}
                />
                <Typography variant="body2" color="text.secondary">
                  {colorValue}
                </Typography>
              </Box>
            </Grid>

            {/* Color Picker */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('colorValue')}
              </Typography>
              <ColorPickerMulti
                colors={colors}
                onChange={setColors}
                displayType={displayType}
                disabled={loading}
              />
            </Grid>

            {/* Pattern Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('patternImage')}
              </Typography>

              {previewUrl || patternImage ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={previewUrl || patternImage}
                    sx={{
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  {isUploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        borderRadius: 1,
                      }}
                    >
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    </Box>
                  )}
                  {!isUploading && (
                    <Button
                      size="small"
                      color="error"
                      onClick={handleRemoveImage}
                      startIcon={<DeleteIcon />}
                      disabled={loading}
                      sx={{ mt: 1 }}
                    >
                      {t('removeColor')}
                    </Button>
                  )}
                </Box>
              ) : (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: loading || isUploading ? 'default' : 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    '&:hover': {
                      bgcolor: loading || isUploading ? 'background.paper' : 'action.hover',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {isDragActive ? t('dropImageHere') : t('dragDropOrClick')}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    PNG, JPG, GIF, WEBP (Max 10MB)
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Sticky Action Buttons */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: '#E5E6EB',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#C4C6CF',
                bgcolor: 'grey.50',
              },
            }}
          >
            {t('goBack')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {mode === 'create' ? t('addNew') : t('update')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
