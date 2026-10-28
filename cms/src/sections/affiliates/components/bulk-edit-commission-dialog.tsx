import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedNumberInput } from 'src/components/input';

interface BulkEditCommissionDialogProps {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onApply: (rate: number) => void;
}

export function BulkEditCommissionDialog({
  open,
  selectedCount,
  onClose,
  onApply,
}: BulkEditCommissionDialogProps) {
  const { t } = useTranslation();
  const [commissionRate, setCommissionRate] = useState<number | undefined>(10);

  const handleApply = () => {
    if (commissionRate !== undefined) {
      onApply(commissionRate);
      // Let parent handle success toast and dialog close
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('bulkEditCommission')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('applyToSelected')}: {selectedCount} {t('products')}
          </Typography>

          <Stack spacing={1}>
            <Typography component="label" sx={{ fontSize: 14, fontWeight: 500 }}>
              {t('commissionRate')}
            </Typography>
            <FormattedNumberInput
              value={commissionRate}
              onChange={setCommissionRate}
              suffix="%"
              min={0}
              max={100}
              allowEmpty={false}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={commissionRate === undefined}
          sx={{ bgcolor: '#0165FC' }}
        >
          {t('applyCommissionRate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
