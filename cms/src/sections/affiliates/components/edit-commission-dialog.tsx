import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedNumberInput } from 'src/components/input';

interface EditCommissionDialogProps {
  open: boolean;
  productId: string | null;
  currentRate: number;
  onClose: () => void;
  onSave: (productId: string, rate: number) => void;
}

export function EditCommissionDialog({
  open,
  productId,
  currentRate,
  onClose,
  onSave,
}: EditCommissionDialogProps) {
  const { t } = useTranslation();
  const [commissionRate, setCommissionRate] = useState<number | undefined>(currentRate);

  // Reset rate when dialog opens with new product
  useEffect(() => {
    if (open) {
      setCommissionRate(currentRate);
    }
  }, [open, currentRate]);

  const handleSave = () => {
    if (commissionRate !== undefined && productId) {
      onSave(productId, commissionRate);
      // Let parent handle success toast and dialog close
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('edit')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Stack spacing={1}>
            <Typography component="label" sx={{ fontSize: 14, fontWeight: 500 }}>
              {t('defaultCommissionRate')}
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
          onClick={handleSave}
          disabled={commissionRate === undefined}
          sx={{ bgcolor: '#0165FC' }}
        >
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
