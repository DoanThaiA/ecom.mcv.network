import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface FormActionButtonsProps {
  mode: 'create' | 'edit';
  loading?: boolean;
  isValid?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function FormActionButtons({
  mode,
  loading = false,
  isValid = true,
  onSubmit,
  onCancel,
}: FormActionButtonsProps) {
  const { t } = useTranslation();

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
          onClick={onSubmit}
          disabled={loading || !isValid}
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
