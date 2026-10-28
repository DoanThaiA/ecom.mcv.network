import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ConfirmAction = 'approve' | 'pay';

interface ConfirmActionDialogProps {
  open: boolean;
  loading?: boolean;
  action: ConfirmAction;
  count: number; // 1 for single, >1 for bulk
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmActionDialog({
  open,
  loading = false,
  action,
  count,
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) {
  const { t } = useTranslation();

  const getMessage = () => {
    if (action === 'approve') {
      return count === 1 ? t('confirmApproveSingle') : t('confirmApproveBulk', { count });
    }
    return count === 1 ? t('confirmPaySingle') : t('confirmPayBulk', { count });
  };

  const getTitle = () => {
    return action === 'approve' ? t('approveRequest') : t('payRequest');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <Typography>{getMessage()}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          color={action === 'approve' ? 'primary' : 'success'}
          onClick={onConfirm}
          disabled={loading}
        >
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
