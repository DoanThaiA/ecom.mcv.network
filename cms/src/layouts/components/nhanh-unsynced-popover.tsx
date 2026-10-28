import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  nhanhUnsyncedCountRequest,
  selectNhanhUnsyncedOrderCount,
} from 'src/redux/store/nhanhSlice';
import { setActiveTab } from 'src/redux/store/orderSlice';

/**
 * Header notification icon that surfaces the number of orders not yet
 * synced to Nhanh.vn. Click to open a popover with the count and a
 * shortcut to the unsynced tab.
 */
export function NhanhUnsyncedPopover() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const count = useAppSelector(selectNhanhUnsyncedOrderCount);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  // Refresh count on mount so the badge is accurate independent of the dialog
  useEffect(() => {
    dispatch(nhanhUnsyncedCountRequest());
  }, [dispatch]);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleViewNow = () => {
    handleClose();
    dispatch(setActiveTab('nhanhUnsynced'));
    navigate('/order');
  };

  const hasUnsynced = count > 0;

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          color: hasUnsynced ? 'warning.main' : 'text.secondary',
          ...(openPopover && { bgcolor: 'action.selected' }),
        }}
        aria-label={t('nhanhUnsyncedPopoverAria')}
      >
        <Badge
          badgeContent={count}
          color="error"
          max={99}
          invisible={!hasUnsynced}
          overlap="circular"
        >
          <WarningAmberIcon />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 320, p: 2 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {hasUnsynced ? (
            <WarningAmberIcon color="warning" />
          ) : (
            <CheckCircleOutlineIcon color="success" />
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('nhanhUnsyncedPopoverTitle')}
          </Typography>
        </Box>

        {hasUnsynced ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('nhanhUnsyncedDialogMessage', { count })}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={handleViewNow}
              sx={{ textTransform: 'none' }}
            >
              {t('viewNow')}
            </Button>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('nhanhUnsyncedPopoverEmpty')}
          </Typography>
        )}
      </Popover>
    </>
  );
}
