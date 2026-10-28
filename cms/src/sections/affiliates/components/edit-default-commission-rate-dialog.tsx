import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedNumberInput } from 'src/components/input';

interface EditDefaultCommissionRateDialogProps {
  open: boolean;
  currentRate: number;
  onClose: () => void;
  onSave: (rate: number) => void;
  disabled?: boolean;
}

export function EditDefaultCommissionRateDialog({
  open,
  currentRate,
  onClose,
  onSave,
  disabled = false,
}: EditDefaultCommissionRateDialogProps) {
  const { t } = useTranslation();
  const [rate, setRate] = useState<number | undefined>(currentRate);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setRate(currentRate);
      setError('');
    }
  }, [open, currentRate]);

  const handleRateChange = (value: number | undefined) => {
    setRate(value);

    // Validation
    if (value !== undefined && (value < 0 || value > 100)) {
      setError(t('commissionRateMustBeBetween0And100'));
    } else {
      setError('');
    }
  };

  const handleSave = () => {
    if (!error && rate !== undefined && rate >= 0 && rate <= 100) {
      onSave(rate);
    }
  };

  const isValid = !error && rate !== undefined && rate >= 0 && rate <= 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('editDefaultCommissionRate')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography
            component="label"
            sx={{ fontSize: 14, fontWeight: 500, mb: 1, display: 'block' }}
          >
            {t('defaultCommissionRate')}
          </Typography>
          <FormattedNumberInput
            value={rate}
            onChange={handleRateChange}
            suffix="%"
            min={0}
            max={100}
            allowEmpty={false}
            disabled={disabled}
          />
          {error && (
            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {error}
            </Typography>
          )}
          {!error && (
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}
            >
              {t('commissionRateHelper')}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={disabled}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid || disabled}>
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
