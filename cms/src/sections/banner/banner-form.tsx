import {
  Box,
  Card,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createBannerRequest,
  updateBannerRequest,
  BannerMediaType,
} from 'src/redux/store/bannerSlice';
import { uploadFileRequest, selectUploadLoading } from 'src/redux/store/fileSlice';
import type { BannerListItem } from 'src/types/gen/shared/shared/banners/banner';
import { showError } from 'src/utils/toast';

// File size limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

interface BannerFormProps {
  banner?: BannerListItem;
  isEdit?: boolean;
}

interface MediaState {
  url: string;
  isUploading?: boolean;
}

export function BannerForm({ banner, isEdit = false }: BannerFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const uploadLoading = useAppSelector(selectUploadLoading);

  const [formData, setFormData] = useState({
    position: banner?.position || 1, // 1 = BANNER_POSITION_HERO_SLIDER
    mediaType: banner?.mediaType || BannerMediaType.BANNER_MEDIA_TYPE_IMAGE,
    link: banner?.link || '',
    order: banner?.order || 0,
    isActive: banner?.isActive ?? true,
  });

  const [mobileMedia, setMobileMedia] = useState<MediaState | null>(
    banner?.media?.mobile ? { url: banner.media.mobile } : null
  );
  const [tabletMedia, setTabletMedia] = useState<MediaState | null>(
    banner?.media?.tablet ? { url: banner.media.tablet } : null
  );
  const [desktopMedia, setDesktopMedia] = useState<MediaState | null>(
    banner?.media?.desktop ? { url: banner.media.desktop } : null
  );

  const isVideoType = formData.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;

  const handleUpload = useCallback(
    (file: File, setMedia: React.Dispatch<React.SetStateAction<MediaState | null>>) => {
      const previewUrl = URL.createObjectURL(file);
      setMedia({ url: previewUrl, isUploading: true });

      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            setMedia({ url: uploadedFile.path, isUploading: false });
            URL.revokeObjectURL(previewUrl);
          },
          onError: () => {
            setMedia(null);
            URL.revokeObjectURL(previewUrl);
          },
        })
      );
    },
    [dispatch]
  );

  const createDropzone = (
    mediaState: MediaState | null,
    setMedia: React.Dispatch<React.SetStateAction<MediaState | null>>,
    label: string
  ) => {
    const acceptTypes = isVideoType
      ? { 'video/*': ['.mp4', '.webm', '.mov'] }
      : { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] };

    const maxSize = isVideoType ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => {
        if (files[0]) handleUpload(files[0], setMedia);
      },
      onDropRejected: (fileRejections) => {
        const rejection = fileRejections[0];
        if (rejection?.errors[0]?.code === 'file-too-large') {
          const maxSizeMB = maxSize / (1024 * 1024);
          showError(t('fileTooLarge', { maxSize: `${maxSizeMB}MB` }));
        }
      },
      accept: acceptTypes,
      maxSize,
      disabled: uploadLoading || mediaState?.isUploading,
      multiple: false,
    });

    return (
      <Box>
        <Typography variant="caption" display="block" gutterBottom>
          {label}
        </Typography>
        {mediaState ? (
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            {isVideoType ? (
              <Box
                component="video"
                src={mediaState.url}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 1,
                  opacity: mediaState.isUploading ? 0.5 : 1,
                }}
                muted
              />
            ) : (
              <Box
                component="img"
                src={mediaState.url}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 1,
                  opacity: mediaState.isUploading ? 0.5 : 1,
                }}
              />
            )}
            {mediaState.isUploading && (
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
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderRadius: 1,
                }}
              >
                <CircularProgress size={24} sx={{ color: 'white' }} />
              </Box>
            )}
            {!mediaState.isUploading && (
              <Box
                onClick={() => setMedia(null)}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.48)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
            )}
          </Box>
        ) : (
          <Box
            {...getRootProps()}
            sx={{
              width: 120,
              height: 120,
              border: '1.5px dashed',
              borderColor: isDragActive ? 'primary.dark' : 'primary.main',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadLoading ? 'not-allowed' : 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              '&:hover': { bgcolor: uploadLoading ? 'background.paper' : 'action.hover' },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center' }}>
              {t('upload')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const handleSubmit = () => {
    const payload = {
      position: formData.position, // Already a number (1 or 2)
      mediaType: formData.mediaType,
      media: {
        mobile: mobileMedia?.url || '',
        tablet: tabletMedia?.url || '',
        desktop: desktopMedia?.url || '',
      },
      link: formData.link || null,
      order: formData.order,
      isActive: formData.isActive,
      onSuccess: () => {
        navigate('/banners');
      },
    };

    if (isEdit && banner) {
      dispatch(
        updateBannerRequest({
          bannerId: banner.id,
          ...payload,
        })
      );
    } else {
      dispatch(createBannerRequest(payload));
    }
  };

  const handleMediaTypeChange = (newMediaType: number) => {
    setFormData({ ...formData, mediaType: newMediaType });
    // Clear media when switching types
    setMobileMedia(null);
    setTabletMedia(null);
    setDesktopMedia(null);
  };

  const isValid =
    !mobileMedia?.isUploading && !tabletMedia?.isUploading && !desktopMedia?.isUploading;

  return (
    <Box>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label={t('position')}
            value={String(formData.position)}
            onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
          >
            <MenuItem value="1">{t('heroSlider')}</MenuItem>
            <MenuItem value="2">{t('adSection')}</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label={t('mediaType')}
            value={String(formData.mediaType)}
            onChange={(e) => handleMediaTypeChange(Number(e.target.value))}
          >
            <MenuItem value={String(BannerMediaType.BANNER_MEDIA_TYPE_IMAGE)}>
              {t('imageType')}
            </MenuItem>
            <MenuItem value={String(BannerMediaType.BANNER_MEDIA_TYPE_VIDEO)}>
              {t('videoType')}
            </MenuItem>
          </TextField>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {isVideoType ? t('bannerVideos') : t('bannerImages')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                {createDropzone(
                  mobileMedia,
                  setMobileMedia,
                  isVideoType
                    ? `${t('mobileVideo')} (672x982px)`
                    : `${t('mobileImage')} (672x982px)`
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {createDropzone(
                  tabletMedia,
                  setTabletMedia,
                  isVideoType
                    ? `${t('tabletVideo')} (1274x523px)`
                    : `${t('tabletImage')} (1274x523px)`
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {createDropzone(
                  desktopMedia,
                  setDesktopMedia,
                  isVideoType
                    ? `${t('desktopVideo')} (1920x788px)`
                    : `${t('desktopImage')} (1920x788px)`
                )}
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            label={t('link')}
            placeholder="https://example.com/promotion"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            helperText={t('optionalBannerLink')}
          />

          <TextField
            fullWidth
            type="number"
            label={t('displayOrder')}
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) })}
            helperText={t('lowerValueDisplaysFirst')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label={t('active')}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/banners')}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="contained"
            disabled={!isValid || uploadLoading}
          >
            {isEdit ? t('update') : t('create')}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
