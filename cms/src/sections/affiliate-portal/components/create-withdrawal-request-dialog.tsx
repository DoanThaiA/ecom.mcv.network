import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { formatPrice } from 'src/utils/format';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createMyWithdrawalRequestRequest,
  selectCreateWithdrawalLoading,
} from 'src/redux/store/affiliatePortalSlice';

interface CreateWithdrawalRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRecipientName?: string;
  defaultBankAccountNumber?: string;
  defaultBankName?: string;
  availableBalance?: number;
}

/**
 * Dialog for an affiliate to create a new withdrawal request.
 */
export function CreateWithdrawalRequestDialog({
  open,
  onClose,
  onSuccess,
  defaultRecipientName = '',
  defaultBankAccountNumber = '',
  defaultBankName = '',
  availableBalance,
}: CreateWithdrawalRequestDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreateWithdrawalLoading);

  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [bankAccountNumber, setBankAccountNumber] = useState(defaultBankAccountNumber);
  const [bankName, setBankName] = useState(defaultBankName);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setAmount('');
      setRecipientName(defaultRecipientName);
      setBankAccountNumber(defaultBankAccountNumber);
      setBankName(defaultBankName);
      setNote('');
      setErrors({});
    }
  }, [open, defaultRecipientName, defaultBankAccountNumber, defaultBankName]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = t('amountMustBePositive');
    } else if (availableBalance !== undefined && amountNum > availableBalance) {
      newErrors.amount = t('amountExceedsBalance');
    }
    if (!recipientName.trim()) {
      newErrors.recipientName = t('required');
    }
    if (!bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = t('required');
    }
    if (!bankName.trim()) {
      newErrors.bankName = t('required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    dispatch(
      createMyWithdrawalRequestRequest({
        amount: Number(amount),
        recipientName: recipientName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankName: bankName.trim(),
        note: note.trim() || undefined,
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      })
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('createWithdrawalRequest')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {availableBalance !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {t('availableBalance')}: <strong>{formatPrice(availableBalance)}</strong>
            </Typography>
          )}
          <TextField
            label={t('withdrawalAmount')}
            type="number"
            size="small"
            fullWidth
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            inputProps={{
              min: 1,
              ...(availableBalance !== undefined && { max: availableBalance }),
            }}
          />
          <TextField
            label={t('recipientName')}
            size="small"
            fullWidth
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            error={!!errors.recipientName}
            helperText={errors.recipientName}
          />
          <TextField
            label={t('bankAccountNumber')}
            size="small"
            fullWidth
            required
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            error={!!errors.bankAccountNumber}
            helperText={errors.bankAccountNumber}
          />
          <TextField
            label={t('bankName')}
            size="small"
            fullWidth
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            error={!!errors.bankName}
            helperText={errors.bankName}
          />
          <TextField
            label={t('withdrawalNote')}
            size="small"
            fullWidth
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? `${t('loading')}...` : t('submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
