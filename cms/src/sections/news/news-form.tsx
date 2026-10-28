import {
  Box,
  Card,
  TextField,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import AddIcon from '@mui/icons-material/Add';
import { HtmlEditor } from 'src/components/html-editor';
import { fileRepository } from 'src/repositories/file.repository';
import { showError } from 'src/utils/toast';
import type { CreateNewsRequest, NewsLocalization, NewsStatus } from 'src/types/news';

// ----------------------------------------------------------------------

const isHtmlEmpty = (html: string): boolean => {
  if (!html) return true;
  if (/<(iframe|img|video|audio|source|embed)\b/i.test(html)) {
    return false;
  }
  return html.replace(/<[^>]*>/g, '').trim() === '';
};

interface NewsFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateNewsRequest>;
  onSubmit: (data: CreateNewsRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function NewsForm({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}: NewsFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Partial<CreateNewsRequest>>({
    title: initialData.title || '',
    content: initialData.content || '',
    thumbnail: initialData.thumbnail || '',
    status: initialData.status || 'active',
  });

  const [titleLocalization, setTitleLocalization] = useState<NewsLocalization>({
    vi: initialData.titleLocalization?.vi || '',
    en: initialData.titleLocalization?.en || '',
  });

  const [contentLocalization, setContentLocalization] = useState<NewsLocalization>({
    vi: initialData.contentLocalization?.vi || '',
    en: initialData.contentLocalization?.en || '',
  });

  const [titleLength, setTitleLength] = useState((initialData.title || '').length);
  const [contentLength, setContentLength] = useState((initialData.content || '').length);
  const [uploading, setUploading] = useState(false);
  const thumbnailFileRef = useRef<File | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setFormData({ ...formData, title: value });
      setTitleLength(value.length);
    }
  };

  const handleContentChange = (html: string) => {
    setFormData({ ...formData, content: html });
    // Rough estimate of content length (strip HTML tags)
    const textContent = html.replace(/<[^>]*>/g, '');
    setContentLength(textContent.length);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, status: e.target.value as NewsStatus });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // Store file for upload on submit
        thumbnailFileRef.current = file;
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setFormData({ ...formData, thumbnail: previewUrl });
      }
    },
    [formData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleSubmit = async () => {
    try {
      let thumbnailUrl = formData.thumbnail || '';

      // Upload thumbnail file if a new file was selected (blob URL)
      if (thumbnailFileRef.current) {
        setUploading(true);
        const response = await fileRepository.uploadFile(thumbnailFileRef.current);
        thumbnailUrl = response.file?.path || '';
        thumbnailFileRef.current = null;
      }

      const normalizedTitleVi = titleLocalization.vi?.trim() || undefined;
      const normalizedTitleEn = titleLocalization.en?.trim() || undefined;
      const normalizedContentVi = !isHtmlEmpty(contentLocalization.vi || '')
        ? contentLocalization.vi
        : undefined;
      const normalizedContentEn = !isHtmlEmpty(contentLocalization.en || '')
        ? contentLocalization.en
        : undefined;

      const submitData: CreateNewsRequest = {
        title: formData.title || '',
        titleLocalization:
          normalizedTitleVi || normalizedTitleEn
            ? { vi: normalizedTitleVi, en: normalizedTitleEn }
            : null,
        content: formData.content || '',
        contentLocalization:
          normalizedContentVi || normalizedContentEn
            ? { vi: normalizedContentVi, en: normalizedContentEn }
            : null,
        thumbnail: thumbnailUrl,
        status: formData.status || 'active',
      };
      onSubmit(submitData);
    } catch (error) {
      showError(error);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = formData.title && !isHtmlEmpty(formData.content || '') && formData.thumbnail;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card
          sx={{
            p: 3,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
          }}
        >
          {/* Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('articleTitle')}
              <Typography component="span" color="error">
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={formData.title}
              onChange={handleTitleChange}
              placeholder={t('articleTitle')}
              size="small"
              inputProps={{ maxLength: 200 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
            >
              {titleLength}/200
            </Typography>
          </Box>

          {/* Title Localization */}
          <Box
            sx={{
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label={t('articleTitleVi')}
              value={titleLocalization.vi || ''}
              onChange={(e) => setTitleLocalization({ ...titleLocalization, vi: e.target.value })}
              size="small"
              helperText={t('articleTitleViHelper')}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label={t('articleTitleEn')}
              value={titleLocalization.en || ''}
              onChange={(e) => setTitleLocalization({ ...titleLocalization, en: e.target.value })}
              size="small"
              helperText={t('articleTitleEnHelper')}
              inputProps={{ maxLength: 200 }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('articleContent')}
              <Typography component="span" color="error">
                *
              </Typography>
            </Typography>
            <HtmlEditor
              value={formData.content || ''}
              onChange={handleContentChange}
              minHeight={300}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
            >
              {contentLength}/100.000
            </Typography>
          </Box>

          {/* Content Localization */}
          <Box
            sx={{
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('articleContentVi')}
              </Typography>
              <HtmlEditor
                value={contentLocalization.vi || ''}
                onChange={(html) => setContentLocalization({ ...contentLocalization, vi: html })}
                minHeight={200}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('articleContentViHelper')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('articleContentEn')}
              </Typography>
              <HtmlEditor
                value={contentLocalization.en || ''}
                onChange={(html) => setContentLocalization({ ...contentLocalization, en: html })}
                minHeight={200}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('articleContentEnHelper')}
              </Typography>
            </Box>
          </Box>

          {/* Thumbnail */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('thumbnailImage')}
              <Typography component="span" color="error">
                *
              </Typography>
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                width: 200,
                height: 130,
                border: '1px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                backgroundImage: formData.thumbnail ? `url(${formData.thumbnail})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <input {...getInputProps()} />
              {!formData.thumbnail && (
                <>
                  <AddIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('selectImage')}
                  </Typography>
                </>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {t('imageSizeHint')}
            </Typography>
          </Box>

          {/* Status */}
          <Box>
            <FormControl>
              <FormLabel
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {t('status')}
                <Typography component="span" color="error">
                  *
                </Typography>
              </FormLabel>
              <RadioGroup row value={formData.status} onChange={handleStatusChange}>
                <FormControlLabel
                  value="active"
                  control={<Radio size="small" />}
                  label={t('active')}
                />
                <FormControlLabel
                  value="inactive"
                  control={<Radio size="small" />}
                  label={t('inactive')}
                />
              </RadioGroup>
            </FormControl>
          </Box>
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
            disabled={loading || uploading}
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
            disabled={loading || uploading || !isFormValid}
            startIcon={(loading || uploading) && <CircularProgress size={16} color="inherit" />}
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
