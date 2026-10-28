import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Stack,
} from '@mui/material';
import type { CreatePushNotificationRequest } from 'src/types/gen/cms/cms/push-notifications/push-notification';
import {
  PushNotificationCategory,
  PushNotificationStatus,
} from 'src/types/gen/shared/shared/common/enums';

interface FormData {
  category?: PushNotificationCategory;
  title?: string;
  subtitle?: string;
  url?: string;
  scheduledAt?: string | Date;
}

interface PushNotificationFormProps {
  mode: 'create' | 'edit';
  initialData?: FormData;
  onSubmit: (data: CreatePushNotificationRequest) => void;
  onSend?: (data: CreatePushNotificationRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

export function PushNotificationForm({
  mode,
  initialData,
  onSubmit,
  onSend,
  onCancel,
  loading,
}: PushNotificationFormProps) {
  const { t } = useTranslation();

  const [category, setCategory] = useState<PushNotificationCategory>(
    initialData?.category ?? PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_NEWS
  );
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (!initialData?.scheduledAt) return '';
    const d =
      initialData.scheduledAt instanceof Date
        ? initialData.scheduledAt
        : new Date(initialData.scheduledAt);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [titleError, setTitleError] = useState('');
  const [subtitleError, setSubtitleError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (!title.trim()) {
      setTitleError(t('fieldRequired'));
      valid = false;
    } else if (title.length > 100) {
      setTitleError(t('pushNotificationTitleMaxLength'));
      valid = false;
    } else {
      setTitleError('');
    }

    if (!subtitle.trim()) {
      setSubtitleError(t('fieldRequired'));
      valid = false;
    } else if (subtitle.length > 250) {
      setSubtitleError(t('pushNotificationSubtitleMaxLength'));
      valid = false;
    } else {
      setSubtitleError('');
    }

    return valid;
  };

  const getScheduledDate = (): Date | undefined => {
    if (!scheduledAt) return undefined;
    const d = new Date(scheduledAt);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    onSubmit({
      category,
      title: title.trim(),
      subtitle: subtitle.trim(),
      url: url.trim() || undefined,
      scheduledAt: getScheduledDate(),
      status: PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT,
    });
  };

  const handleSend = () => {
    if (!validate()) return;
    const scheduledDate = getScheduledDate();
    const hasScheduledTime = !!scheduledDate && scheduledDate > new Date();
    const data: CreatePushNotificationRequest = {
      category,
      title: title.trim(),
      subtitle: subtitle.trim(),
      url: url.trim() || undefined,
      scheduledAt: scheduledDate,
      status: hasScheduledTime
        ? PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING
        : PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT,
    };
    if (onSend) {
      onSend(data);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
      <Card sx={{ p: 3, maxWidth: 800 }}>
        <Stack spacing={3}>
          {/* Category */}
          <FormControl fullWidth required>
            <InputLabel>{t('pushNotificationCategory')}</InputLabel>
            <Select
              value={category}
              label={t('pushNotificationCategory')}
              onChange={(e) => setCategory(e.target.value as PushNotificationCategory)}
            >
              <MenuItem value={PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_NEWS}>
                {t('pushNotificationCategoryNews')}
              </MenuItem>
              <MenuItem value={PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_PROMOTION}>
                {t('pushNotificationCategoryPromotion')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Title */}
          <Box>
            <TextField
              fullWidth
              required
              label={t('pushNotificationTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!titleError}
              helperText={titleError}
              inputProps={{ maxLength: 100 }}
            />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
              {title.length}/100
            </Typography>
          </Box>

          {/* Subtitle */}
          <Box>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label={t('pushNotificationSubtitle')}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              error={!!subtitleError}
              helperText={subtitleError}
              inputProps={{ maxLength: 250 }}
            />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
              {subtitle.length}/250
            </Typography>
          </Box>

          {/* URL */}
          <TextField
            fullWidth
            label={t('pushNotificationUrl')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {/* Scheduled Time */}
          <TextField
            fullWidth
            type="datetime-local"
            label={t('pushNotificationScheduledTime')}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="outlined" onClick={handleSaveDraft} disabled={loading}>
          {t('saveDraft')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading}
          sx={{ bgcolor: '#0165FC', '&:hover': { bgcolor: '#0052CC' } }}
        >
          {t('sendNotification')}
        </Button>
      </Stack>
    </Box>
  );
}
