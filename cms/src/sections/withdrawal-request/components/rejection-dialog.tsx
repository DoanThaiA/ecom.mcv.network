import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RejectionDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectionDialog({
  open,
  loading = false,
  onClose,
  onConfirm,
}: RejectionDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(t('rejectionReasonRequired'));
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('rejectRequestTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('rejectionReason')}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            error={!!error}
            helperText={error}
            placeholder={t('rejectionReason')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          {t('cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
