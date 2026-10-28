import { Button, CircularProgress, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface FormActionButtonsProps {
  onCancel: () => void;
  onSaveAndHide: () => void;
  onSaveAndShow: () => void;
  loading?: boolean;
}

export function FormActionButtons({
  onCancel,
  onSaveAndHide,
  onSaveAndShow,
  loading = false,
}: FormActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2, sm: 3 }}
      justifyContent="center"
      sx={{ py: 3 }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={loading}
        sx={{
          minWidth: { xs: '100%', sm: 115 },
          height: 40,
          borderColor: 'primary.main',
          color: 'primary.main',
          borderRadius: 1.25,
          fontWeight: 500,
          '&:hover': {
            borderColor: 'primary.dark',
            bgcolor: 'primary.lighter',
          },
        }}
      >
        {t('goBack')}
      </Button>
      <Button
        variant="outlined"
        onClick={onSaveAndHide}
        disabled={loading}
        startIcon={loading && <CircularProgress size={16} color="inherit" />}
        sx={{
          minWidth: { xs: '100%', sm: 115 },
          height: 40,
          borderColor: 'primary.main',
          color: 'primary.main',
          borderRadius: 1.25,
          fontWeight: 500,
          '&:hover': {
            borderColor: 'primary.dark',
            bgcolor: 'primary.lighter',
          },
        }}
      >
        {t('saveAndHide')}
      </Button>
      <Button
        variant="contained"
        onClick={onSaveAndShow}
        disabled={loading}
        startIcon={loading && <CircularProgress size={16} color="inherit" />}
        sx={{
          minWidth: { xs: '100%', sm: 115 },
          height: 40,
          bgcolor: 'primary.main',
          borderRadius: 1.25,
          fontWeight: 500,
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'primary.dark',
            boxShadow: 4,
          },
        }}
      >
        {t('saveAndShow')}
      </Button>
    </Stack>
  );
}
