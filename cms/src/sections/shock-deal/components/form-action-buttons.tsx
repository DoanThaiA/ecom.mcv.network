import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PromotionStatus } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface FormActionButtonsProps {
  mode: 'create' | 'edit';
  status?: PromotionStatus;
  loading?: boolean;
  pauseLoading?: boolean;
  isValid?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function FormActionButtons({
  mode,
  status,
  loading = false,
  pauseLoading = false,
  isValid = true,
  onSubmit,
  onCancel,
  onPause,
  onResume,
}: FormActionButtonsProps) {
  const { t } = useTranslation();

  const canPause = mode === 'edit' && status === PromotionStatus.PROMOTION_STATUS_ACTIVE && onPause;

  const canResume =
    mode === 'edit' && status === PromotionStatus.PROMOTION_STATUS_PAUSED && onResume;

  return (
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
          disabled={loading || pauseLoading}
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

        {canPause && (
          <Button
            variant="outlined"
            onClick={onPause}
            disabled={loading || pauseLoading}
            sx={{
              borderColor: '#FFA500',
              color: '#FFA500',
              '&:hover': {
                borderColor: '#E69500',
                bgcolor: 'rgba(255, 165, 0, 0.08)',
              },
            }}
          >
            {t('pause')}
          </Button>
        )}

        {canResume && (
          <Button
            variant="outlined"
            onClick={onResume}
            disabled={loading || pauseLoading}
            sx={{
              borderColor: '#22C55E',
              color: '#22C55E',
              '&:hover': {
                borderColor: '#16A34A',
                bgcolor: 'rgba(34, 197, 94, 0.08)',
              },
            }}
          >
            {t('resume')}
          </Button>
        )}

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || pauseLoading || !isValid}
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
  );
}
