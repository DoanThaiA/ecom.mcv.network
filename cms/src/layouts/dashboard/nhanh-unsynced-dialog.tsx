import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  nhanhUnsyncedCountRequest,
  selectNhanhUnsyncedOrderCount,
} from 'src/redux/store/nhanhSlice';
import { setActiveTab } from 'src/redux/store/orderSlice';

const SESSION_STORAGE_KEY = 'nhanhUnsyncedDialogShown';

/**
 * Shows a warning dialog at most once per session when there are orders
 * that have not yet been synced to Nhanh.vn.
 */
export function NhanhUnsyncedDialog() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const count = useAppSelector(selectNhanhUnsyncedOrderCount);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Always fetch count so other surfaces (banner, tab badge) stay accurate.
    // Only the dialog opening is gated by sessionStorage.
    dispatch(
      nhanhUnsyncedCountRequest({
        onSuccess: (fetched) => {
          if (fetched > 0 && sessionStorage.getItem(SESSION_STORAGE_KEY) !== '1') {
            setOpen(true);
          }
        },
      })
    );
  }, [dispatch]);

  const markAsShown = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
  };

  const handleClose = () => {
    markAsShown();
    setOpen(false);
  };

  const handleViewNow = () => {
    markAsShown();
    setOpen(false);
    dispatch(setActiveTab('nhanhUnsynced'));
    navigate('/order');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon sx={{ color: '#F62E2E' }} />
        {t('nhanhUnsyncedDialogTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t('nhanhUnsyncedDialogMessage', { count })}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {t('close')}
        </Button>
        <Button onClick={handleViewNow} variant="contained">
          {t('viewNow')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
